# Usage

1. Populate /preview-index/.env
2. npm i
3. npm run index


If you do a change to .env file, remember to re-run 'npm i' before running 'npm run index' command.


# Configuration
Application expects a .env file of this format:
```
SP_CLIENT_ID="..."
SP_TENANT_ID="..."
SP_CLIENT_SECRET="..."
SP_DRIVE_ID="..."
EDS_ADMIN_KEY="..."
EDS_ACCESS_KEY="..."
CONSUMER="..."
PREVIEW_INDEX_FILE="..."
PREVIEW_RESOURCES_FOLDER="..."
```

`SP_CLIENT_ID` and `SP_TENANT_ID` can be found on the azure app 'Essential' tab, see 'Application (client) ID' and 'Directory (tenant) ID'.
`PREVIEW_INDEX_FILE` path to the target index file, e.g. "milo/drafts/mariia/preview-index/query-index-cards-preview.xlsx"
`PREVIEW_RESOURCES_FOLDER` path to resource to index, e.g. "/drafts/mariia/preview-index/*". Folder path is not sharepoint path, but mapped *hlx.page location. So if your sharepoint folder is CC/www/cc-shared/myfolder, please specify /cc-shared/myfolder.

Azure app: [CC preview index](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/94136756-61af-4f63-af05-6991a719b872/isMSAApp~/false)


# CURLs

Change `access_token` for an actual one.

## EDS Admin API: Get previewed resources - bulk status
Admin token and access token are different values!

```
curl -v -X POST --header "Authorization: Bearer admin_token" -H "Content-Type: application/json" -d '{"select": ["preview"], "paths": ["/drafts/mariia/preview-index/*"]}' 'https://admin.hlx.page/status/adobecom/cc/main/*'
```

## EDS Get page content
Admin token and access token are different values!
```
curl -v --header "Authorization: token access_token" -H "Content-Type: application/json" 'https://main--cc--adobecom.hlx.page/cc-shared/fragments/merch/products/catalog/merch-card/ec/target/default'
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
