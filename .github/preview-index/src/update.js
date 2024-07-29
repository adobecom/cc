/* ***********************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2023 Adobe
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
const crypto = require('crypto');
const msal = require('@azure/msal-node');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

require('dotenv').config();
const SP_CLIENT_ID = process.env.SP_CLIENT_ID;
const SP_TENANT_ID = process.env.SP_TENANT_ID;
const SP_CERT_PASSWORD = process.env.SP_CERT_PASSWORD;
const SP_CERT_THUMB_PRINT = process.env.SP_CERT_THUMB_PRINT;
const SP_CERT_CONTENT = process.env.SP_CERT_CONTENT;
const SP_DRIVE_ID = process.env.SP_DRIVE_ID;
const PREVIEW_INDEX_FILE = process.env.PREVIEW_INDEX_FILE;
const PREVIEW_RESOURCES_FOLDER = process.env.PREVIEW_INDEX_FILE;

const GRAPH_BASE_URL = `https://graph.microsoft.com/v1.0`;
const SHEET_RAW_INDEX = 'raw_index';
const TABLE_NAME = 'Table1';
const FETCH_RETRY = 10;
let accessToken;

const parseCert = (content, password) => crypto.createPrivateKey({
  key: content,
  passphrase: password,
  format: 'pem'
}).export({
  format: 'pem',
  type: 'pkcs8'
});

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
            knownAuthorities: ['login.microsoftonline.com'],
            clientCertificate: {
                privateKey: parseCert(SP_CERT_CONTENT, SP_CERT_PASSWORD),
                thumbprint: SP_CERT_THUMB_PRINT,
            }
        }
    }
    const authClient = new msal.ConfidentialClientApplication(authConfig);
    const request = {
        scopes: ['https://graph.microsoft.com/.default']
    };
    const tokens = await authClient.acquireTokenByClientCredential(request);
    accessToken = tokens.accessToken;
    console.log('token fetched.')
  }
  return accessToken;
}

const getResourceIndexData = async (resource) => {
  const url = `https://main--milo--adobecom.hlx.page${resource.path}`;
  const response = await fetch(url);
  if (response?.status !== 200) {
    console.log('Failed to fetch card: ' + url);
    return;
  }
  const cardHTML = await response.text();
  const document = new JSDOM(cardHTML).window.document;
  const merchCard = document.querySelector('main div.merch-card');
  if (!merchCard) {
    console.log('Merch card not found in the dom: ' + merchCard.outerHTML);
    return;
  }
  const path = resource.path,
        title = document.querySelector('head > meta[property="og:title"]')?.content || '',
        cardContent = merchCard.outerHTML,
        lastModified = new Date(resource.previewLastModified).getTime().toString(),
        cardClasses = JSON.stringify(Object.values(merchCard.classList)),
        robots = 'new',
        tags = '[]',
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

const defaultHeaders = async () => ({
  Authorization: `Bearer ${await getAccessToken()}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1',
});

const getItemId = async (indexPath) => {
  const url = `${GRAPH_BASE_URL}/drives/${SP_DRIVE_ID}/root:/${indexPath}`;
  console.log(`Get item id: ${url}`);
  const response = await fetch(url, {
      headers: await defaultHeaders(),
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

const getPreviewResources = async (folder, parseIndexFc) => {
  const PREVIEW_STATUS_URL = 'https://admin.hlx.page/status/adobecom/milo/main/*';
  const data = {"select": ["preview"], "paths": [folder]};
  let headers = {...await defaultHeaders(),
    'Content-Type': 'application/json'
  };
  const response = await fetch(PREVIEW_STATUS_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
  });
  if (!response?.ok) {
    console.log(`fetching preview status failed: ${response.status} - ${response.statusText}`);
    return;
  }
  const job = await response.json();
  const jobDetailsURL = `${job.links.self}/details`;

  const retryFetch = async (resolve, attempt = 1) => {
    const response = await fetch(jobDetailsURL, { headers: await defaultHeaders() });
    const data = await response.json();
    if (data?.state === 'stopped') {
        resolve(data?.data);
    } else if (attempt < FETCH_RETRY) {
        console.log(`Attempt ${attempt}: Job state is '${data?.state}'. Checking again in 1 second...`);
        setTimeout(() => retryFetch(resolve, attempt + 1), 1000); // Wait 1 second before the next check
    } else {
        console.log("Maximum attempts reached. Stopping the fetching.");
        resolve(undefined);
    }
  };

  const cardsDataPromise = new Promise (async (resolve) => retryFetch(resolve, 1));
  const cardsData = await cardsDataPromise;
  if (!cardsData) {
    console.log('Failed to fetch previewed cards.')
    return;
  }
  
  const jsonPromises = await Promise.allSettled(
    cardsData.resources
      .filter((res) => !res.path.endsWith('.json'))
      .map(async (resource) => await parseIndexFc(resource))
  );

  const indexData = jsonPromises
    .filter((p) => p.status === 'fulfilled')
    .map((p) => p.value);
  console.log(`fetched ${indexData?.length} previewed resources`);
  return indexData;
}

const getTableURL = (itemId) => `${GRAPH_BASE_URL}/drives/${SP_DRIVE_ID}/items/${itemId}/workbook/worksheets/${SHEET_RAW_INDEX}/tables/${TABLE_NAME}`;

const deleteAllRows = async (url) => {
  let headers = {...await defaultHeaders(),
    'Content-Type': 'application/json'
  };
  const response = await fetch(`${url}/DataBodyRange/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      "shift": "Up"
    }),
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
    SP_CERT_PASSWORD: SP_CERT_PASSWORD,
    SP_CERT_THUMB_PRINT: SP_CERT_THUMB_PRINT,
    SP_CERT_CONTENT: SP_CERT_CONTENT,
    SP_DRIVE_ID: SP_DRIVE_ID,
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
  if (!indexData) {
    console.log('No index data found.');
    return;
  }
  const itemId = await getItemId(indexPath);
  if (!itemId) {
    console.error('No index item id found.');
    return;
  }
  
  const tableURL = getTableURL(itemId);
  await deleteAllRows(tableURL);
  const response = await fetch(`${tableURL}/rows`, {
      method: 'POST',
      headers: await defaultHeaders(),
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
  console.log(`Reindexed folder ${folder}`);
};

reindex(PREVIEW_INDEX_FILE, PREVIEW_RESOURCES_FOLDER);
