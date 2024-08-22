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
const { getConfig, getResourceIndexData, getAccessToken, getItemId, sharepointHeaders, previewIndex } = require('./sharepoint');

const config = getConfig();

let sessionId;

const sharepointHeadersWithSession = async () => ({
  'Authorization': `Bearer ${await getAccessToken()}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1',
  'workbook-session-id': sessionId,
});

const fetchSessionId = async (itemId) => {
  const createSessionUrl = `${config.GRAPH_BASE_URL}/drives/${config.SHAREPOINT_DRIVE_ID}/items/${itemId}/workbook/createSession`;
  const csResponse = await fetch(createSessionUrl, {
    method: 'POST',
    headers: await sharepointHeaders(),
    body: JSON.stringify({
      persistChanges: false
    }),
  });

  if (csResponse?.ok) {
    console.log(`Session created: ${csResponse.status} - ${csResponse.statusText}`);
    const csData = await csResponse.json();
    sessionId = csData.id;
    return true
  } else {
    console.log(`Failed to create session: ${csResponse.status} - ${csResponse.statusText}`);
    return false;
  }
}

const respond = (response, action) => {
  if (response?.ok) {
    console.log(`Action \"${action}\" successful : ${response.status} - ${response.statusText}`);
    return true;
  }

  console.log(`Action \"${action}\" failed: ${response.status} - ${response.statusText}`);
  return false;
}

const getBaseUrl = (itemId) => `${config.GRAPH_BASE_URL}/drives/${config.SHAREPOINT_DRIVE_ID}/items/${itemId}/workbook/worksheets/${config.SHEET_RAW_INDEX}/tables/${config.TABLE_NAME}`;

const clearFilter = async (itemId) => {
  const clearFilterUrl = `${getBaseUrl(itemId)}/columns/8/filter/clear`;
  const response = await fetch(clearFilterUrl, {
    method: 'POST',
    headers: await sharepointHeadersWithSession(),
    body: JSON.stringify({
    }),
  });
  return respond(response, 'clear filter');
}

const applyFilter = async (itemId, resPath) => {
  const applyFilterUrl = `${getBaseUrl(itemId)}/columns('path')/filter/apply`;
  const response = await fetch(applyFilterUrl, {
    method: 'POST',
    headers: await sharepointHeadersWithSession(),
    body: JSON.stringify({
      criteria : {
        filterOn: 'custom',
        criterion1: `=${resPath}`,
        operator: 'or',
        criterion2: null
      }
    }),
  });
  return respond(response, 'apply filter');
}

const addTableRow = async (itemId, values) => {
  const addRowUrl = `${getBaseUrl(itemId)}/rows/add`;
  const response = await fetch(addRowUrl, {
    method: 'POST',
    headers: await sharepointHeaders(),
    body: JSON.stringify({ index: null, values: [values] })
  });
  return respond(response, 'add row');
}

const updateTableRow = async (itemId, values, updateIndex) => {
  const updateRowUrl = `${getBaseUrl(itemId)}/rows/itemAt(index=${updateIndex})`;
  const response = await fetch(updateRowUrl, {
    method: 'PATCH',
    headers: await sharepointHeaders(),
    body: JSON.stringify({ index: updateIndex, values: [values] })
  });
  return respond(response, 'update row');
}

const fetchVisibleView = async (itemId) => {
  const visibleViewUrl = `${getBaseUrl(itemId)}/range/visibleView/rows`;
  const response = await fetch(visibleViewUrl, {
    method: 'GET',
    headers: await sharepointHeadersWithSession(),
  });
  if (response?.ok) {
    console.log(`Got visible view: ${response.status} - ${response.statusText}`);
    return await response.json();
  } else {
    console.log(`Failed to get visible view: ${response.status} - ${response.statusText}`);
    return {};
  }
}

const findRowAddress = (data) => {
  if (!data?.value || data.value.length < 2) return;

  return data.value[1].cellAddresses[0];
}

const findIndex = (cellAddress) => {
  const cell = cellAddress[0];
  return parseInt(cell.replace('A', ''), 10) - 2;
}

/**
 * Path of the resource that needs to be indexed will be read from the event "resource-previewed".
 * It ends with '.md' extension that needs to be removed.
 * Details of this resource, that will be saved in index file, needs to be loaded.
 * If that resource is already indexed, details will be updated in index file, otherwise new row will be added.
 *
 * The procedure to check if the resource is already indexed is :
 * - create session and get the session ID that will be used in all subsequent calls
 * - clear all filters
 * - create new filter with criterion "= resource path"
 * - fetch the row for this filter
 * - if there is no row fetched, the new row will be added with resource details
 * - otherwise the fetched row will be updated.
 * From the address of the fetched row (which has the form like ['A10', 'B10', 'C10', ...]) we can extract the index
 * of the row that needs to be updated.
 *
 * Doc https://learn.microsoft.com/en-us/graph/api/resources/excel?view=graph-rest-1.0
 */
const reindex = async () => {
  if (!config?.ENABLED) {
    return;
  }

  const path = process.env.npm_config_path;
  if (!path || path.endsWith('.json') || !path.includes('/merch-card/') || !path.startsWith('/cc-shared/fragments/merch/')) {
    return;
  }

  const itemId = await getItemId(config.PREVIEW_INDEX_FILE);
  if (!itemId) {
    console.error('No index item id found.');
    return;
  }

  // cut off '.md'
  const resPath = path.substring(0, path.length - 3);
  const resData = await getResourceIndexData(resPath);

  await fetchSessionId(itemId);
  if (!sessionId) return;
  if (!await clearFilter(itemId)) return;
  if (!await applyFilter(itemId, resPath)) return;
  const data = await fetchVisibleView(itemId);
  const address = findRowAddress(data);
  if (address) {
    const updateIndex = findIndex(address);
    await updateTableRow(itemId, resData, updateIndex);
  } else {
    await addTableRow(itemId, resData);
  }

  await previewIndex();
}

reindex();
