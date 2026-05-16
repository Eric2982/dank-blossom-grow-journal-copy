const isNode = typeof window === 'undefined';

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
  if (isNode) return defaultValue;
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get(paramName);
  if (removeFromUrl && searchParam) {
    urlParams.delete(paramName);
    const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
    window.history.replaceState({}, document.title, newUrl);
  }
  return searchParam || defaultValue || null;
};

const getAppParams = () => {
  const appId = import.meta.env?.VITE_BASE44_APP_ID || "6994e0c98fb6b9d1d4521dbd";

  if (isNode) {
    return {
      appId,
      token: null,
      functionsVersion: null,
    };
  }

  return {
    appId,
    token: getAppParamValue("access_token", { removeFromUrl: true }) || getAppParamValue("_preview_token", { removeFromUrl: true }),
    functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env?.VITE_BASE44_FUNCTIONS_VERSION }),
  };
};

export const appParams = { ...getAppParams() };