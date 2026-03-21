export const createPageUrl = (pageName, params = "") => {
  if (pageName === "Dashboard") return "/";
  return `/${pageName}${params ? `?${params}` : ""}`;
};