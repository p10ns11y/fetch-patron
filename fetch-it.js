/* globals fetch */
import 'whatwg-fetch';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return Promise.resolve(response);
  }

  const error = new Error(response.statusText);
  error.response = response;

  const contentType = response.headers.get('content-type');

  if (contentType && contentType.indexOf('application/json') > -1) {
    return response.json().then((json) => {
      error.response.jsonMessage = json;
      return Promise.reject(error);
    });
  }

  return Promise.reject(error);
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function fetchIt(url, options) {
  return fetch(url, options)
    .then(checkStatus)
    .then(parseJSON);
}

// @see: https://github.com/github/fetch
