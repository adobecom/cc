import { setLibs } from './utils.js';

const miloLibs = setLibs('/libs');
const { createTag, loadScript } = await import(`${miloLibs}/utils/utils.js`);

export { createTag, loadScript };
