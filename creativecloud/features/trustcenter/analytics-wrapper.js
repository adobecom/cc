/* eslint-disable max-len */
function isObject(obj) {
  const val = (typeof obj === 'object') && !Array.isArray(obj) && obj !== null;
  return val;
}

function isFunction(fn) {
  return typeof fn === 'function';
}

function isEmptyString(str) {
  const val = typeof str === 'string' ? str.length === 0 : true;
  return val;
}

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
const isAlloyAnalyticsAvailable = () => isObject(window.alloy_all) && isFunction(window.alloy_all.set);
// eslint-disable-next-line no-underscore-dangle
const isLegacyAnalyticsAvailable = () => isObject(window.digitalData) && isFunction(window.digitalData._set);
const analyticsWrapper = {};

analyticsWrapper.onReady = () => {
  if (!onReadyPromise) {
    onReadyPromise = new Promise((resolve, reject) => {
      const isAnalyticsAvailable = () => isAlloyAnalyticsAvailable() || isLegacyAnalyticsAvailable();
      const executeOnReady = () => {
        isAnalyticsReady = true;
        resolve();
      };
      if (isAnalyticsAvailable()) {
        executeOnReady();
      } else {
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
      }
    });
  }
  return onReadyPromise;
};

let onAlloyMethodReadyPromise = null;
analyticsWrapper.onAlloyMethodReady = () => {
  if (!onAlloyMethodReadyPromise) {
    onAlloyMethodReadyPromise = new Promise((resolve, reject) => {
      // eslint-disable-next-line no-underscore-dangle
      const isAlloyMethodAvailable = () => isFunction(window.alloy) && isObject(window._satellite);
      if (isAlloyMethodAvailable()) {
        resolve();
      } else {
        let interval;
        const timeout = setTimeout(() => {
          clearInterval(interval);
          reject();
        }, CONFIG.timeouts.maxAlloyMethodWait);

        interval = setInterval(() => {
          if (isAlloyMethodAvailable()) {
            clearInterval(interval);
            clearTimeout(timeout);
            resolve();
          }
        }, CONFIG.timeouts.checkInterval);
      }
    });
  }
  return onAlloyMethodReadyPromise;
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
