/**
 * @author Kuitos
 * @homepage https://github.com/kuitos/
 * @since 2015-09-21
 * inspired by angular $http
 * fetch request api基础封装
 */

import unused from 'whatwg-fetch';

const fetch = window.fetch,
  Headers = window.Headers;

let toString = Object.prototype.toString;

function isString(string) {
  return typeof string === 'string';
}

function isObject(value) {
  return value !== null && typeof value === 'object';
}

function isFile(obj) {
  return toString.call(obj) === '[object File]';
}

function isBlob(obj) {
  return toString.call(obj) === '[object Blob]';
}

function isFormData(obj) {
  return toString.call(obj) === '[object FormData]';
}

function toJson(obj) {
  if (obj !== undefined) {
    return JSON.stringify(obj);
  }
}

/**
 * url parser
 * @see https://github.com/angular/angular.js/blob/master/src%2Fng%2FurlUtils.js
 */
let msie = document.documentMode,
  urlParsingNode = document.createElement('a'),
  originUrl = urlResolve(window.location.href);

function urlResolve(url) {

  let href = url;

  if (msie) {
    // Normalize before parse.  Refer Implementation Notes on why this is
    // done in two steps on IE.
    urlParsingNode.setAttribute('href', href);
    href = urlParsingNode.href;
  }

  urlParsingNode.setAttribute('href', href);

  // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
  return {
    href    : urlParsingNode.href,
    protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
    host    : urlParsingNode.host,
    search  : urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
    hash    : urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
    hostname: urlParsingNode.hostname,
    port    : urlParsingNode.port,
    pathname: (urlParsingNode.pathname.charAt(0) === '/')
      ? urlParsingNode.pathname
      : '/' + urlParsingNode.pathname
  };
}

function urlIsSameOrigin(requestUrl) {
  let parsed = (isString(requestUrl)) ? urlResolve(requestUrl) : requestUrl;
  return (parsed.protocol === originUrl.protocol &&
  parsed.host === originUrl.host);
}

// 参数为json对象时则作序列化操作
function transformRequest(payload) {
  return isObject(payload) && !isFile(payload) && !isBlob(payload) && !isFormData(payload) ? toJson(payload) : payload;
}

// 响应头为application/json时作反序列化处理
function transformResponse(response) {

  let contentType = response.headers.get('Content-Type');

  if (contentType && (contentType.indexOf(APPLICATION_JSON) === 0)) {
    return response.json();
  } else {
    return response;
  }

}

function mergeHeaders(baseHeaders, ...sourceHeaders) {
  return Object.assign({}, baseHeaders, ...sourceHeaders);
}

// 请求方法类型
const REQUEST_METHODS = {
  GET   : 'GET',
  POST  : 'POST',
  PUT   : 'PUT',
  PATCH : 'PATCH',
  DELETE: 'DELETE'
};

const APPLICATION_JSON = 'application/json';

// fetch通用配置
let COMMON_CONFIG = {
  headers    : {'Content-Type': `${APPLICATION_JSON};charset=utf-8`, 'X-Requested-With': 'https://github.com/kuitos/'},
  mode       : 'same-origin',
  credentials: 'same-origin',
  cache      : 'no-cache'
};

function sendReq(url, method, payload, configs) {

  let init;

  if (!urlIsSameOrigin(url)) {
    configs.mode = 'cors';
  }

  configs.headers = mergeHeaders(COMMON_CONFIG.headers, configs.headers);

  // get和delete方法不允许有请求体
  if (~[REQUEST_METHODS.GET, REQUEST_METHODS.DELETE].indexOf(method)) {
    init = Object.assign({}, COMMON_CONFIG, configs, {method});
  } else {
    init = Object.assign({body: transformRequest(payload)}, COMMON_CONFIG, configs, {method});
  }

  return fetch(url, init).then(response => {
    return transformResponse(response);
  });
}

export default {

  get (url, configs = {}){
    return sendReq(url, REQUEST_METHODS.GET, undefined, configs);
  },

  post (url, payload, configs = {}){
    return sendReq(url, REQUEST_METHODS.POST, payload, configs);
  },

  put (url, payload, configs = {}){
    return sendReq(url, REQUEST_METHODS.PUT, payload, configs);
  },

  patch (url, payload, configs = {}){
    return sendReq(url, REQUEST_METHODS.PATCH, payload, configs);
  },

  delete (url, configs = {}){
    return sendReq(url, REQUEST_METHODS.DELETE, undefined, configs);
  }

}
