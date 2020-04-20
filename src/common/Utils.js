export const isUndefinedOrNull = val => {
  return val === undefined || val === null;
};

export const isUndefinedOrNullOrEmpty = val => {
  return val === undefined || val === null || val === "";
};

export const isEmpty = val => {
  return !isUndefinedOrNull(val) && val === "";
};

export const isAnyValueOfObjectUndefinedOrNullOrEmpty = obj => {
  let isInvalid = false;
  for (let key in obj) {
    if (isUndefinedOrNullOrEmpty(obj[key])) {
      isInvalid = true;
    }
  }
  return isInvalid;
};

export const assignEmptyStringToAllKeysInObj = obj => {
  if (!isUndefinedOrNull(obj)) {
    for (let key in obj) {
      obj[key] = "";
    }
  }
};

export const buildUrlWithParameters = (requestUrl, urlParametersObj) => {
  if (!isUndefinedOrNull(urlParametersObj)) {
    let parametersString = "";
    for (let key in urlParametersObj) {
      if (parametersString !== "") {
        parametersString += "&";
      }
      parametersString += key + "=" + encodeURIComponent(urlParametersObj[key]);
    }
    requestUrl += "?" + parametersString;
  }
  return requestUrl;
};

export const makeApiCall = (
  requestUrl,
  urlParametersObj,
  requestDataBodyObj,
  apiCallRequestType,
  requestHeadersObj,
  successCallback,
  failCallback
) => {
  let xhr = new XMLHttpRequest();
  xhr.open(
    apiCallRequestType,
    buildUrlWithParameters(requestUrl, urlParametersObj)
  );
  if (!isUndefinedOrNull(requestHeadersObj)) {
    for (let key in requestHeadersObj) {
      if (!isUndefinedOrNullOrEmpty(requestHeadersObj[key])) {
        xhr.setRequestHeader(key, requestHeadersObj[key]);
      }
    }
  }
  isUndefinedOrNull(requestDataBodyObj)
    ? xhr.send()
    : xhr.send(JSON.stringify(requestDataBodyObj));
  xhr.addEventListener("readystatechange", function() {
    if (this.readyState === 4) {
      if (xhr.status === 200) {
        if (!isUndefinedOrNull(successCallback)) {
          successCallback(this.responseText, this.getAllResponseHeaders());
        }
      } else {
        if (!isUndefinedOrNull(failCallback)) {
          failCallback(this.responseText);
        }
      }
    }
  });
};

export const formatDate = time => {
  return (
    new Date(time * 1000).toLocaleDateString() +
    " " +
    new Date(time * 1000).toLocaleTimeString()
  );
};
