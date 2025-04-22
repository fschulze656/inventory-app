import axios from 'axios';

import { userUrls } from '@urls';

const axiosConfig = {
  baseURL: `${window.location.protocol}//${window.location.hostname}`,
  withCredentials: true
};

const axiosClient = axios.create(axiosConfig);

let refreshInProgress = false;

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (refreshInProgress) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return axiosClient(originalRequest);
      }

      if (!refreshInProgress) {
        refreshInProgress = true;
        try {
          await axiosClient.post(userUrls.refreshToken);
          refreshInProgress = false;
          return axiosClient(originalRequest);
        } catch (err) {
          refreshInProgress = false;
          return Promise.reject(err);
        }
      }
    }

    return Promise.reject(error);
  }
);

const get = async (baseurl, params = {}, config = {}) => {
  const { pathParams, queryParams } = splitParams(baseurl, params);
  const pathedUrl = replaceUrlPlaceholders(baseurl, pathParams);
  const query = Object.entries(queryParams).map(([key, val]) => `${key}=${val}`).join('&');
  const url = query ? `${pathedUrl}?${query}` : pathedUrl;
  return axiosClient.get(url, config);
};

const post = async (baseurl, data, params = {}, config = {}) => {
  const { pathParams } = splitParams(baseurl, params);
  const pathedUrl = replaceUrlPlaceholders(baseurl, pathParams);
  return axiosClient.post(pathedUrl, data, config);
};

function replaceUrlPlaceholders(url, params) {
  return url.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (key in params) return encodeURIComponent(params[key]);
    throw new Error(`Missing parameter: ${key}`);
  });
}

function splitParams(url, params) {
  const pathParams = {};
  const queryParams = { ...params };

  url.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => {
    if (key in queryParams) {
      pathParams[key] = queryParams[key];
      delete queryParams[key];
    }
  });

  return { pathParams, queryParams };
}

export { get, post };
export default axiosClient;
