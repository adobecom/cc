/* eslint-disable consistent-return */

export function isEmptyObject(obj) {
  const isObject = (typeof obj === 'object') && !Array.isArray(obj) && obj !== null;
  const val = isObject ? Object.keys(obj).length === 0 : true;
  return val;
}

export function getCookieValue(cookie, raw) {
  let cookies;
  let index;
  let temporaryCookie;
  let cookieValue;
  if (typeof cookie === 'string' && cookie.length && (typeof document.cookie === 'string')) {
    cookies = document.cookie.split('; ');
    const { length } = cookies;
    for (index = length - 1; index >= 0; index -= 1) {
      temporaryCookie = cookies[index];
      if (typeof temporaryCookie === 'string' && temporaryCookie.length) {
        temporaryCookie = temporaryCookie.split(/=(.+)/);
        if (cookie === temporaryCookie[0]) {
          if (typeof raw === 'boolean' && raw) {
            [, cookieValue] = temporaryCookie;
            return cookieValue;
          }
          cookieValue = window.decodeURIComponent(temporaryCookie[1]);
        }
      }
    }
  }

  return cookieValue;
}

export function setCookieValue(cookie, value, options, raw) {
  let newCookie = '';
  let cookiePath;
  let cookieExpiration;
  let cookieDomain;
  let isSecure;
  if ((typeof cookie === 'string') && cookie.length && (typeof document.cookie === 'string')) {
    if ((typeof raw === 'boolean') && raw) {
      newCookie += `${cookie}=${value}`;
    } else {
      newCookie += `${window.encodeURIComponent(cookie)}=${window.encodeURIComponent(value)}`;
    }
    if (!isEmptyObject(options)) {
      cookiePath = options.path;
      if ((typeof cookiePath === 'string') && !!cookiePath.length) newCookie += `; path=${cookiePath}`;
      cookieExpiration = options.expiration;
      if (cookieExpiration instanceof Date) newCookie += `; expires=${cookieExpiration.toUTCString()}`;
      cookieDomain = options.domain;
      if ((typeof cookieDomain === 'string') && !!cookieDomain.length) newCookie += `; domain=${cookieDomain}`;
      isSecure = options.secure;
      if (typeof isSecure === 'boolean' && isSecure) newCookie += '; secure';
    }
    document.cookie = newCookie;
  }
}
