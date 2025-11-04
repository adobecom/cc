There are 2 scripts here, one for full reindex and one to reindex a single document.

# Full reindex

The script for full reindex:
* query all 'previewed' resources in folder /cc-shared/fragments/merch/*
* filter out .json or urls that don't contain /merch-card/ in the path
* for each merch-card resource, it will request .aem.page content 
* parse the content to the index table row, similar to the 'merch-cards' index definition in 'helix-query.yaml'
* delete all rows from /cc-shared/assets/query-index-cards-preview.xslx, 'raw_index' sheet, 'Table1'
* add new generated rows to the index
* preview the index
* every card will be indexed in the query-index-cards-preview.xslx created in the locale of that card, if that locale is supported in configuration


## Usage

1. Populate /preview-index/.env
2. npm i
3. npm run full

If you do a change to .env file, remember to re-run 'npm i' before running 'npm run full' command.

# Single reindex

The script for reindexing of a single document
* is triggered on 'resource-previewed' event
* will work only if resource path contains /merch-card/ and does not end with .json
* for the resource path it requests .aem.page content
* it searches for the existing row in /cc-shared/assets/query-index-cards-preview.xslx for this resource 
* if it exists, it updates that row with new details
* otherwise it inserts new row

## Usage

1. Populate /preview-index/.env
2. npm i
3. npm run single --path=/cc-shared/fragments/merch/products/catalog/default.md

# Configuration
Application expects a .env file of this format:
```
SHAREPOINT_CLIENT_ID="..."
SHAREPOINT_TENANT_ID="..."
SHAREPOINT_CLIENT_SECRET="..."
SHAREPOINT_DRIVE_ID="..."
EDS_ADMIN_KEY="..."
CONSUMER="..."
PREVIEW_INDEX_FILE="..."
PREVIEW_INDEX_JSON="..."
PREVIEW_RESOURCES_FOLDER="..."
PREVIEW_LOCALES="..."
ENABLED=y
```

`SHAREPOINT_CLIENT_ID` and `SHAREPOINT_TENANT_ID` can be found on the azure app 'Essential' tab, see 'Application (client) ID' and 'Directory (tenant) ID'.
`PREVIEW_INDEX_FILE` path to the target index file, e.g. "milo/drafts/mariia/preview-index/query-index-cards-preview.xlsx"
`PREVIEW_RESOURCES_FOLDER` path to resource to index, e.g. "/drafts/mariia/preview-index/*". Folder path is not sharepoint path, but mapped *aem.page location. So if your sharepoint folder is CC/www/cc-shared/myfolder, please specify /cc-shared/myfolder.
`PREVIEW_LOCALES` comma separated string of locales supported appart from us e.g. ca,at_de,au

Azure app: [CC preview index](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/94136756-61af-4f63-af05-6991a719b872/isMSAApp~/false)

`EDS_ADMIN_KEY` can be gernearted by a member of the MILO Core Team. It needs to be added to the GitHub varibables and the correspondind ID needs to be added to the .helix config.
<img width="2020" height="48" alt="image" src="https://github.com/user-attachments/assets/abb0a9b3-0545-4600-b2cd-ae34c1a182f9" />



# CURLs

Change `access_token` for an actual one.

## EDS Admin API: Get previewed resources - bulk status
Admin token and access token are different values!

```
curl -v -X POST --header "Authorization: token admin_token" -H "Content-Type: application/json" -d '{"select": ["preview"], "paths": ["/drafts/mariia/preview-index/*"]}' 'https://admin.hlx.page/status/adobecom/cc/main/*'
```

## EDS Get page content
Admin token and access token are different values!
```
curl -v --header "Authorization: token access_token" -H "Content-Type: application/json" 'https://main--cc--adobecom.aem.page/cc-shared/fragments/merch/products/catalog/merch-card/ec/target/default'
```

## GRAPH API: Get index file Item ID
change DRIVER_ID to the actual one
```
curl --header "Authorization: Bearer access_token" 'https://graph.microsoft.com/v1.0/drives/DRIVER_ID/root:/Book1.xlsx'
```
## GRAPH API: delete all rows
```
curl -X POST --header "Authorization: Bearer access_token" -H "Content-Type: application/json" -d '{"shift": "Up"}' 'https://graph.microsoft.com/v1.0/drives/${DRIVE_ID}/items/${ITEM_ID}/workbook/worksheets/raw_index/tables/Table1/DataBodyRange/delete'
```


# Troubleshooting

The error below doesn't mean the script failed, it could be that your target index file table had no rows, so nothing could be deleted.

```
(no rows found?) Failed to delete all rows: 409 - Conflict
```
