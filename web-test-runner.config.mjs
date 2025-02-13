// eslint-disable-next-line import/no-extraneous-dependencies
import { importMapsPlugin } from '@web/dev-server-import-maps';

async function enableCORS(context, next) {
  await next();
  context.set('Access-Control-Allow-Credentials', true);
  context.set('Access-Control-Allow-Origin', context.request.headers.origin);
}

const swcImportMaps = Object.fromEntries([
  'theme.js',
  'search.js',
  'checkbox.js',
  'dialog.js',
  'base.js',
  'reactive-controllers.js',
  'shared.js',
  'textfield.js',
  'button.js',
  'icons-workflow.js',
  'icons-ui.js',
  'checkmark.js',
  'dash.js',
  'divider.js',
  'button-group.js',
  'alert-dialog.js',
  'underlay.js',
  'help-text.js',
  'icon.js',
  'icons/checkmark.js',
  'icons/dash.js',
  'icons/cross.js',
].map((file) => [`/libs/features/spectrum-web-components/dist/${file}`, `/node_modules/@adobecom/milo/libs/features/spectrum-web-components/dist/${file}`]));

const miloImportMaps = { 'libs/': 'https://main--milo--adobecom.hlx.live/libs/' };

export default {
  coverageConfig: {
    include: ['creativecloud/**'],
    exclude: ['test/mocks/**', 'test/**', '**/node_modules/**', 'creativecloud/deps/**'],
  },
  debug: false,
  files: ['test/**/*.test.(js|html)'],
  nodeResolve: true,
  middlewares: [enableCORS],
  plugins: [
    importMapsPlugin({
      inject: {
        importMap: {
          imports: {
            ...swcImportMaps,
            ...miloImportMaps,
          },
        },
      },
    }),
  ],
  port: 2000,
  browserLogs: false,
};
