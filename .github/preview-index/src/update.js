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
const fs = require('fs');
const msal = require('@azure/msal-node');
var XLSX = require("xlsx");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;


// todo: move out
const GRAPH_BASE_URL = '';
const SP_CLIENT_ID='';
const SP_TENANT_ID='';
const SP_CERT_PASSWORD='';
const SP_CERT_THUMB_PRINT='';
const SP_CERT_CONTENT='';
const DRIVE_ID = '';
// todo end: move out

const INDEX_PATH = `milo/drafts/mariia/preview-index/query-index-cards-preview.xlsx`;
const SHEET_RAW_INDEX = 'raw_index';

const toSharepointUrl = (relativePath) => `${GRAPH_BASE_URL}/drives/${DRIVE_ID}/root:/${relativePath}`;

const parseCert = (content, password) => crypto.createPrivateKey({
  key: content,
  passphrase: password,
  format: 'pem'
}).export({
  format: 'pem',
  type: 'pkcs8'
});

const getAccessToken = async () => {
  const config = {
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
  const authClient = new msal.ConfidentialClientApplication(config);
  const request = {
      scopes: ['https://graph.microsoft.com/.default']
  };
  const tokens = await authClient.acquireTokenByClientCredential(request);
  return tokens.accessToken;
}

const download = async (accessToken, indexPath, indexName) => {
  const filePath = `${toSharepointUrl(indexPath)}:/content`;
  const response = await fetch(filePath, {
      headers: {
          Authorization: `Bearer ${accessToken}`,
      }
  });
  if (response?.status === 200) {
      console.log('downloaded: ' + filePath);
      return new Promise (resolve => {
          const stream = fs.createWriteStream(`./${indexName}`);
          response.body.pipe(stream);
          stream.on('finish', resolve);
      });
  } else {
    console.log('Failed to download: ' + filePath);
  }
};

const getCardJson = async (path) => {
  const url = `https://main--milo--adobecom.hlx.page${path}`;
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
  
  const title = document.querySelector('head > meta[property="og:title"]')?.content || '',
        cardContent = merchCard.outerHTML,
        lastModified = '',
        cardClasses = JSON.stringify(Object.values(merchCard.classList)),
        robots = 'mariia',
        tags = '[]',
        publicationDate = '';

  return {
    path,
    title,
    cardContent,
    lastModified,
    cardClasses,
    robots,
    tags,
    publicationDate
  }
}

const modify = async (indexName, localFileName) => {
  const workbook = XLSX.readFile(`./${indexName}`);
  const rawSheet = workbook.Sheets[SHEET_RAW_INDEX];
  if (!rawSheet) {
      console.error(`Sheet ${SHEET_RAW_INDEX} not found in the workbook.`);
      return;
  }
  const CARD_PATH = '/drafts/mariia/preview-index/adobe-firefly/default';
  const cardJson = await getCardJson(CARD_PATH);
  const data = XLSX.utils.sheet_to_json(rawSheet);
  const row = data.find((card) => card.path === CARD_PATH);
  if (row) {
    Object.assign(row, cardJson);
  } else {
    data.push(cardJson);
  }

  const updatedSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets[SHEET_RAW_INDEX] = updatedSheet;
  XLSX.writeFile(workbook, `./${localFileName}`);
}

const upload = async (accessToken, indexPath, localFileName) => {
  const data = fs.readFileSync(localFileName);
  const url = `${toSharepointUrl(indexPath)}:/content`;
  const uploadResponse = await fetch(url, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          Authorization: `Bearer ${accessToken}`,
      },
      body: data,
  });
  if (uploadResponse) {
      console.log(`Upload: ${uploadResponse.status} - ${uploadResponse.statusText}`);
      if (uploadResponse.status === 200 || uploadResponse.status === 201) {
        console.log('uploaded successfully');
        return;
      } 
  }
  console.log('ERROR: upload failed.');
}

const cleanup = async(indexName) => {
  try {
    fs.unlinkSync(`./${indexName}`);
    console.log('removed: ' + indexName);
  } catch (e) {}
  try {
    fs.unlinkSync(`./MODIFIED_${indexName}`);
    console.log('removed: MODIFIED_' + indexName);
  } catch (e) {}
}

const updateIndex = async (indexPath) => {
  const indexName = indexPath.split('/').pop();
  const localFileName = `MODIFIED_${indexName}`;
  cleanup(indexName);
  const accessToken = await getAccessToken();
  const indexFilePromise = await download(accessToken, indexPath, indexName);
  await indexFilePromise;
  await modify(indexName, localFileName);
  await upload(accessToken, indexPath, localFileName);
};

updateIndex(INDEX_PATH);
