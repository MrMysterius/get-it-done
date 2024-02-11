export function getUrlParam(key) {
  const params = new URLSearchParams(location.search);
  return params.has(key) ? params.get(key) : null;
}

export function getAllUrlParams() {
  const params = new URLSearchParams(location.search);
  return params;
}

export function setUrlParam(key, value = null) {
  const params = new URLSearchParams(location.search);
  if (value == null) params.delete(key);
  else params.set(key, value);
  window.history.replaceState({}, "", `${location.pathname}?${params}`);
  return true;
}
