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
  if (isNode) {
    return {
      appId: import.meta.env?.VITE_BASE44_APP_ID || "69be6d60d8aa3924e66d8e69",
      token: null,
      functionsVersion: null,
      appBaseUrl: null,
    };
  }

  const appId = import.meta.env.VITE_BASE44_APP_ID || "69be6d60d8aa3924e66d8e69";

  return {
    appId,
    token: getAppParamValue("access_token", { removeFromUrl: true }) || getAppParamValue("_preview_token", { removeFromUrl: true }),
    functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
    appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL || "https://base44.app" }),
  };
};

export const appParams = { ...getAppParams() };