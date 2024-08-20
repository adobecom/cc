/* ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 ************************************************************************* */

const fetch = require('node-fetch-commonjs');
const { getConfig, getResourceIndexData, getItemId, sharepointHeaders, edsAdminHeaders } = require('./sharepoint');

const config = getConfig();

/**
 * Fetch all previewed resources in specified folder. Bulk status job is asynchronyous, 
 * so the method will keep re-fetching the status till the job is done. Interval - 5 seconds.
 * When Bulk Status returned all previewed resource paths, map each path to a function that will 
 * request this path content from hlx.page and map it to index row.
 * Concurrent Requests to hlx.page are limited to 20 in order not to overload EDS. hlx.page is an uncached endpoint.
 * Promise.allSettled instead of Promise.all insures the script will execute for rest of paths, even if one of them failed.
 * @param {*} folder 
 * @param {*} parseIndexFc 
 * @returns 
 */
const getPreviewResources = async (folder, parseIndexFc) => {
  const headers = {...edsAdminHeaders(), 'Content-Type': 'application/json'};
  const response = await fetch(config.PREVIEW_STATUS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({"select": ["preview"], "paths": [folder], "pathsOnly": "true"}),
  });
  if (!response?.ok) {
    console.log(`fetching preview status failed: ${response.status} - ${response.statusText}`);
    return;
  }
  const job = await response.json();
  const jobDetailsURL = `${job.links.self}/details`;
  console.log(`fetching list of previewed resources: ${jobDetailsURL}`);

  const retryFetch = async (resolve, attempt = 1) => {
    const response = await fetch(jobDetailsURL, { headers });
    const data = await response.json();
    if (data?.state === 'stopped') {
        resolve(data?.data);
    } else if (attempt < config.FETCH_RETRY) {
        console.log(`Attempt ${attempt}: Job state is '${data?.state}'. Checking again in 5 second...`);
        setTimeout(() => retryFetch(resolve, attempt + 1), 5000); // Wait 1 second before the next check
    } else {
        console.log("Maximum attempts reached. Stopping the fetching.");
        resolve(undefined);
    }
  };

  const paths = await new Promise (async (resolve) => retryFetch(resolve, 1));
  if (!paths) {
    console.log('Failed to fetch previewed resources.')
    return;
  }

  const tasks = paths.resources?.preview
    .filter((path) => !path.endsWith('.json') && path.includes('/merch-card/'))
    .map((path) => () => parseIndexFc(path));
  const pool = async (tasks, concurrencyLimit) => {
    const results = [];
    const executing = new Set();
    for (const task of tasks) {
      const promise = task();
      results.push(promise);
      executing.add(promise);
      promise.finally(() => executing.delete(promise));
      if (executing.size >= concurrencyLimit) {
        console.log('Waiting...');
        await Promise.race(executing);
      }
    }
    return Promise.allSettled(results); // wait for the rest of tasks
  }

  let indexData = await pool(tasks, 20);
  indexData = indexData.map((item) => item?.value)
    .filter((row) => row?.length > 0);
  console.log(`fetched ${indexData?.length} previewed resources`);
  return indexData;
}

const deleteAllRows = async (url) => {
  const response = await fetch(`${url}/DataBodyRange/delete`, {
    method: 'POST',
    headers: {...await sharepointHeaders(), 'Content-Type': 'application/json'},
    body: JSON.stringify({ "shift": "Up" }),
  });
  if (response?.ok) {
    console.log(`Deleted all row: ${response.status} - ${response.statusText}`);
  } else {
    console.log(`(no rows found?) Failed to delete all rows: ${response.status} - ${response.statusText}`);
  }
}

const reindex = async () => {
  if (!config) {
    return;
  }

  const indexPath = config.PREVIEW_INDEX_FILE;
  const folder = config.PREVIEW_RESOURCES_FOLDER;

  const indexData = await getPreviewResources(folder, getResourceIndexData);
  // todo think if we want to delete rows in index table in case no cards found..
  if (!indexData?.length) {
    console.log('No index data found.');
    return;
  }
  const itemId = await getItemId(indexPath);
  if (!itemId) {
    console.error('No index item id found.');
    return;
  }
  
  const tableURL = `${config.GRAPH_BASE_URL}/drives/${config.SHAREPOINT_DRIVE_ID}/items/${itemId}/workbook/worksheets/${config.SHEET_RAW_INDEX}/tables/${config.TABLE_NAME}`;
  await deleteAllRows(tableURL);
  const response = await fetch(`${tableURL}/rows`, {
      method: 'POST',
      headers: await sharepointHeaders(),
      body: JSON.stringify({
        "index": null, 
        "values": indexData
      }),
    });
  if (response?.ok) {
    console.log(`Added index rows: ${response.status} - ${response.statusText}`);
  } else {
    console.log(`Failed to add index rows: ${response.status} - ${response.statusText}`);
  }

  console.log('preview update url:' + config.PREVIEW_UPDATE_URL);
  const previewResponse = await fetch(config.PREVIEW_UPDATE_URL, {
      method: 'POST',
      headers: edsAdminHeaders(),
    });
  if (previewResponse?.ok) {
    console.log(`Previewed index file: ${previewResponse.status} - ${previewResponse.statusText}`);
  } else {
    console.log(`Failed to preview index file: ${previewResponse.status} - ${previewResponse.statusText}`);
  }
  console.log(`Reindexed folder ${folder}`);
};

reindex();
