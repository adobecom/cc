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
const msal = require('@azure/msal-node');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

require('dotenv').config();

const SP_CLIENT_ID = process.env.SP_CLIENT_ID;
const SP_TENANT_ID = process.env.SP_TENANT_ID;
const SP_CLIENT_SECRET = process.env.SP_CLIENT_SECRET;
const SP_DRIVE_ID = process.env.SP_DRIVE_ID;
const EDS_ADMIN_KEY = process.env.EDS_ADMIN_KEY;
const CONSUMER = process.env.CONSUMER;
const PREVIEW_INDEX_JSON = process.env.PREVIEW_INDEX_JSON;
const PREVIEW_INDEX_FILE = process.env.PREVIEW_INDEX_FILE;
const PREVIEW_RESOURCES_FOLDER = process.env.PREVIEW_RESOURCES_FOLDER;

const PREVIEW_STATUS_URL = `https://admin.hlx.page/status/adobecom/${CONSUMER}/main/*`;
const PREVIEW_UPDATE_URL = `https://admin.hlx.page/preview/adobecom/${CONSUMER}/main/${PREVIEW_INDEX_JSON}`;
const PREVIEW_BASE_URL = `https://main--${CONSUMER}--adobecom.hlx.page`;
const GRAPH_BASE_URL = `https://graph.microsoft.com/v1.0`;
const SHEET_RAW_INDEX = 'raw_index';
const TABLE_NAME = 'Table1';
const FETCH_RETRY = 10;
let accessToken;

const decodeToObject = (base64String) => {
  try {
      return JSON.parse(Buffer.from(base64String, 'base64').toString());
  } catch (err) {
      return {};
  }
};

const isTokenExpired = (token) => {
  const tokenParts = token.split('.');
  if (tokenParts.length === 3) {
      const data = decodeToObject(tokenParts[1]);
      if (data && data.exp) {
          return Math.floor(Date.now() / 1000) > data.exp - 10;
      }
  }
  return true;
};

const getAccessToken = async () => {
  if (!accessToken || isTokenExpired(accessToken)) {
    console.log('fetching access token...')
    const authConfig = {
      auth: {
          clientId: SP_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${SP_TENANT_ID}`,
          clientSecret: encodeURIComponent(SP_CLIENT_SECRET)
      }
    }
    const authClient = new msal.ConfidentialClientApplication(authConfig);
    const request = {
        scopes: ['https://graph.microsoft.com/.default']
    };
    const tokens = await authClient.acquireTokenByClientCredential(request);
    accessToken = tokens.accessToken;
    console.log('token fetched.');
  }
  return accessToken;
}

const getResourceIndexData = async (path) => {
  const url = `${PREVIEW_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {...edsAdminHeaders(), 'Content-Type': 'application/json'}
  });
  if (response?.status !== 200) {
    console.log('Failed to fetch card: ' + url);
    return;
  }
  const cardHTML = await response.text();
  const document = new JSDOM(cardHTML).window.document;
  const merchCard = document.querySelector('main div.merch-card');
  if (!merchCard) {
    console.log('Merch card not found in the dom: ' + path);
    return;
  }
  // lastModified and publicationDate are not parsed for preview index since this data is irrelevant
  // robots should be ignored
  const title = document.querySelector('head > meta[property="og:title"]')?.content || '',
        cardContent = merchCard.outerHTML,
        lastModified = '',
        cardClasses = JSON.stringify(Object.values(merchCard.classList)),
        robots =  '',
        tags = document.querySelector('head > meta[property="article:tag"]')?.content || '',
        publicationDate = '';

  return [
    path,
    title,
    cardContent,
    lastModified,
    cardClasses,
    robots,
    tags,
    publicationDate
  ]
}

const sharepointHeaders = async () => ({
  'Authorization': `Bearer ${await getAccessToken()}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1',
});

const edsAdminHeaders = () => ({
  'Authorization': `token ${EDS_ADMIN_KEY}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1'
});

const getItemId = async (indexPath) => {
  const url = `${GRAPH_BASE_URL}/drives/${SP_DRIVE_ID}/root:/${indexPath}`;
  console.log(`Get item id: ${url}`);
  const response = await fetch(url, {
      headers: await sharepointHeaders(),
  });
  if (response) {
      console.log(`Check if document exists: ${response.status} - ${response.statusText}`);
      if (response.status === 200) {
          const jsonResponse = await response.json();
          return jsonResponse.id;
      }
  }
  return null;
};

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
  const response = await fetch(PREVIEW_STATUS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({"select": ["preview"], "paths": [folder], "pathsOnly": "true"}),
  });
  if (!response?.ok) {
    console.log(`fetching preview status failed: ${response.status} - ${response.statusText}`);
    return;
  }
  const job = await response.json();
  let jobDetailsURL = `${job.links.self}/details`;
  console.log(`fetching list of previewed resources: ${jobDetailsURL}`);

  const retryFetch = async (resolve, attempt = 1) => {
    const response = await fetch(jobDetailsURL, { headers });
    const data = await response.json();
    if (data?.state === 'stopped') {
        resolve(data?.data);
    } else if (attempt < FETCH_RETRY) {
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
    .map((path) => async () => {
      console.log(new Date().toString() + ', path: ' + path);
      await parseIndexFc(path);
    });
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

  const indexData = await pool(tasks, 20);
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

const validateConfig = () => {
  const config = {
    SP_CLIENT_ID: SP_CLIENT_ID,
    SP_TENANT_ID: SP_TENANT_ID,
    SP_CLIENT_SECRET: SP_CLIENT_SECRET,
    SP_DRIVE_ID: SP_DRIVE_ID,
    EDS_ADMIN_KEY: EDS_ADMIN_KEY,
    CONSUMER: CONSUMER,
    PREVIEW_INDEX_FILE: PREVIEW_INDEX_FILE,
    PREVIEW_RESOURCES_FOLDER: PREVIEW_RESOURCES_FOLDER,
  };
  let valid = true;
  Object.entries(config).forEach(([key, value]) => {
     if (!value) {
      console.error(`ERROR: Config item ${key} is empty.`);
      valid = false;
     }
    });
  if (valid) {
    console.log('config is valid')
  }
  return valid;
}

const reindex = async (indexPath, folder) => {
  if (!validateConfig()) {
    return;
  }

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
  
  const tableURL = `${GRAPH_BASE_URL}/drives/${SP_DRIVE_ID}/items/${itemId}/workbook/worksheets/${SHEET_RAW_INDEX}/tables/${TABLE_NAME}`;
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

  console.log('preview update url:' + PREVIEW_UPDATE_URL);
  const previewResponse = await fetch(PREVIEW_UPDATE_URL, {
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

reindex(PREVIEW_INDEX_FILE, PREVIEW_RESOURCES_FOLDER);
