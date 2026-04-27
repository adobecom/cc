/* eslint-disable max-len */
const CONFIG = {
  timeouts: {
    maxWait: 10000,
    maxAlloyMethodWait: 5000,
    checkInterval: 150,
  },
  strings: { alloyPrefix: 'data._adobe_corpnew.digitalData.' },
};
let onReadyPromise = null;
let isAnalyticsReady = false;
const analyticsWrapper = {};
const isObject = (obj) => ((typeof obj === 'object') && !Array.isArray(obj) && obj !== null);
const isFunction = (fn) => typeof fn === 'function';
const isEmptyString = (str) => (typeof str === 'string' ? str.length === 0 : true);
const isAlloyAnalyticsAvailable = () => isObject(window.alloy_all) && isFunction(window.alloy_all.set);
// eslint-disable-next-line no-underscore-dangle
const isLegacyAnalyticsAvailable = () => isObject(window.digitalData) && isFunction(window.digitalData._set);

analyticsWrapper.onReady = () => {
  if (!onReadyPromise) {
    // eslint-disable-next-line consistent-return
    onReadyPromise = new Promise((resolve, reject) => {
      const isAnalyticsAvailable = () => isAlloyAnalyticsAvailable() || isLegacyAnalyticsAvailable();
      const executeOnReady = () => {
        isAnalyticsReady = true;
        resolve();
      };
      // eslint-disable-next-line no-promise-executor-return
      if (isAnalyticsAvailable()) return executeOnReady();
      let analyticsIntervalFn;
      const waitTimeout = setTimeout(() => {
        isAnalyticsReady = false;
        clearInterval(analyticsIntervalFn);
        reject();
      }, CONFIG.timeouts.maxWait);

      analyticsIntervalFn = setInterval(() => {
        if (isAnalyticsAvailable()) {
          clearInterval(analyticsIntervalFn);
          clearTimeout(waitTimeout);
          executeOnReady();
        }
      }, CONFIG.timeouts.checkInterval);
    });
  }
  return onReadyPromise;
};

analyticsWrapper.set = ({ path, data, prefix = CONFIG.strings.alloyPrefix } = {}) => {
  if (!isAnalyticsReady || isEmptyString(path)) return;
  if (isAlloyAnalyticsAvailable()) {
    try {
      window.alloy_all.set(`${prefix}${path}`, data);
    } catch (e) { /* no action required */ }
  }
  if (isLegacyAnalyticsAvailable()) {
    try {
      // eslint-disable-next-line no-underscore-dangle
      window.digitalData._set(path, data);
    } catch (e) { /* no action required */ }
  }
};

analyticsWrapper.batchSet = (analyticsBatch) => {
  if (!Array.isArray(analyticsBatch)) return;
  analyticsBatch.forEach(analyticsWrapper.set);
};

export default analyticsWrapper;
