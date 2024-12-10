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
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

require('dotenv').config();

const SHAREPOINT_CLIENT_ID = process.env.SHAREPOINT_CLIENT_ID;
const SHAREPOINT_TENANT_ID = process.env.SHAREPOINT_TENANT_ID;
const SHAREPOINT_CLIENT_SECRET = process.env.SHAREPOINT_CLIENT_SECRET;
const SHAREPOINT_DRIVE_ID = process.env.SHAREPOINT_DRIVE_ID;
const EDS_ADMIN_KEY = process.env.EDS_ADMIN_KEY;
const CONSUMER = process.env.CONSUMER;
const PREVIEW_INDEX_JSON = process.env.PREVIEW_INDEX_JSON;
const PREVIEW_INDEX_FILE = process.env.PREVIEW_INDEX_FILE;
const PREVIEW_RESOURCES_FOLDER = process.env.PREVIEW_RESOURCES_FOLDER;
const ENABLED = process.env.ENABLED;

const PREVIEW_STATUS_URL = `https://admin.hlx.page/status/adobecom/${CONSUMER}/main/*`;
const PREVIEW_UPDATE_URL = `https://admin.hlx.page/preview/adobecom/${CONSUMER}/main/${PREVIEW_INDEX_JSON}`;
const PREVIEW_BASE_URL = `https://main--${CONSUMER}--adobecom.aem.page`;
const GRAPH_BASE_URL = 'https://graph.microsoft.com/v1.0';
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

const validateConfig = () => {
  const envConfig = {
    SHAREPOINT_CLIENT_ID: SHAREPOINT_CLIENT_ID,
    SHAREPOINT_TENANT_ID: SHAREPOINT_TENANT_ID,
    SHAREPOINT_CLIENT_SECRET: SHAREPOINT_CLIENT_SECRET,
    SHAREPOINT_DRIVE_ID: SHAREPOINT_DRIVE_ID,
    EDS_ADMIN_KEY: EDS_ADMIN_KEY,
    CONSUMER: CONSUMER,
    PREVIEW_INDEX_FILE: PREVIEW_INDEX_FILE,
  };
  let valid = true;
  Object.entries(envConfig).forEach(([key, value]) => {
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

const getConfig = () => {
  if (!validateConfig()) return null;

  return {
    SHAREPOINT_CLIENT_ID,
    SHAREPOINT_TENANT_ID,
    SHAREPOINT_CLIENT_SECRET,
    SHAREPOINT_DRIVE_ID,
    EDS_ADMIN_KEY,
    CONSUMER,
    PREVIEW_INDEX_FILE,
    ENABLED,
    PREVIEW_BASE_URL,
    GRAPH_BASE_URL,
    SHEET_RAW_INDEX,
    TABLE_NAME,
    PREVIEW_RESOURCES_FOLDER,
    PREVIEW_STATUS_URL,
    PREVIEW_UPDATE_URL,
    FETCH_RETRY,
  }
};

const getAccessToken = async () => {
  if (!accessToken || isTokenExpired(accessToken)) {
    console.log('fetching access token...')
    const authConfig = {
      auth: {
        clientId: SHAREPOINT_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${SHAREPOINT_TENANT_ID}`,
        clientSecret: encodeURIComponent(SHAREPOINT_CLIENT_SECRET)
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
};

const getResourceIndexData = async (path) => {
  console.log(new Date().toString() + ', path: ' + path);
  const url = `${PREVIEW_BASE_URL}${path}`;
  const response = await fetch(url, {
    headers: {...edsAdminHeaders(), 'Content-Type': 'application/json'}
  });
  if (response?.status !== 200) {
    console.log('Failed to fetch card: ' + url);
    return [];
  }
  const cardHTML = await response.text();
  const document = new JSDOM(cardHTML).window.document;
  const merchCard = document.querySelector('main div.merch-card');
  if (!merchCard) {
    console.log('Merch card not found in the dom: ' + path);
    return [];
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
};

const sharepointHeaders = async () => ({
  'Authorization': `Bearer ${await getAccessToken()}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1'
});

const edsAdminHeaders = () => ({
  'Authorization': `token ${EDS_ADMIN_KEY}`,
  'User-Agent': 'NONISV|Adobe|PreviewIndex/0.0.1'
});


const getItemId = async (indexPath) => {
  const url = `${GRAPH_BASE_URL}/drives/${SHAREPOINT_DRIVE_ID}/root:/${indexPath}`;
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

const previewIndex = async () => {
  console.log('Preview update url: ' + PREVIEW_UPDATE_URL);
  const previewResponse = await fetch(PREVIEW_UPDATE_URL, {
    method: 'POST',
    headers: edsAdminHeaders(),
  });
  if (previewResponse?.ok) {
    console.log(`Previewed index file: ${previewResponse.status} - ${previewResponse.statusText}`);
  } else {
    console.log(`Failed to preview index file: ${previewResponse.status} - ${previewResponse.statusText}`);
  }
}

module.exports = {
  getConfig,
  getResourceIndexData,
  getAccessToken,
  getItemId,
  sharepointHeaders,
  edsAdminHeaders,
  previewIndex
};
