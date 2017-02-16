### Fetch-patron

The following is available everywhere.

### Caveats

The `fetch` specification differs from `jQuery.ajax()` in mainly two ways that
bear keeping in mind:

* The Promise returned from `fetch()` **won't reject on HTTP error status**
  even if the response is a HTTP 404 or 500. Instead, it will resolve normally,
  and it will only reject on network failure, or if anything prevented the
  request from completing.

* By default, `fetch` **won't send or receive any cookies** from the server,
  resulting in unauthenticated requests if the site relies on maintaining a user
  session. See [Sending cookies](#sending-cookies) for how to opt into cookie
  handling.

#### Handling HTTP error statuses

To have `fetch` Promise reject on HTTP error statuses, i.e. on any non-2xx
status, define a custom response handler:

```javascript
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    var error = new Error(response.statusText)
    error.response = response
    throw error
  }
}

function parseJSON(response) {
  return response.json()
}

fetch('/users')
  .then(checkStatus)
  .then(parseJSON)
  .then(function(data) {
    console.log('request succeeded with JSON response', data)
  }).catch(function(error) {
    console.log('request failed', error)
  })
```

#### Sending cookies

To automatically send cookies for the current domain, the `credentials` option
must be provided:

```javascript
fetch('/users', {
  credentials: 'same-origin'
})
```

The "same-origin" value makes `fetch` behave similarly to XMLHttpRequest with
regards to cookies. Otherwise, cookies won't get sent, resulting in these
requests not preserving the authentication session.

For [CORS][] requests, use the "include" value to allow sending credentials to
other domains:

```javascript
fetch('https://example.com:1234/users', {
  credentials: 'include'
})
```

#### Receiving cookies

Like with XMLHttpRequest, the `Set-Cookie` response header returned from the
server is a [forbidden header name][] and therefore can't be programatically
read with `response.headers.get()`. Instead, it's the browser's responsibility
to handle new cookies being set (if applicable to the current URL). Unless they
are HTTP-only, new cookies will be available through `document.cookie`.

Bear in mind that the default behavior of `fetch` is to ignore the `Set-Cookie`
header completely. To opt into accepting cookies from the server, you must use
the `credentials` option.

Checkout http://github.github.io/fetch/ for the polyfill

# The Missing piece
However it is bit unclear how to handle the custom json(or text) error messages
which are not overriding the http header [`Reason-Phrases`](https://www.w3.org/Protocols/rfc2616/rfc2616-sec6.html#sec6.1.1) instead send as body content

For example assume express server send the following
`res.status(422).send({ message: 'Password reset token is invalid or has expired' });`

Now you want the `checkStatus` would like to throw you all the original response
including error code, and json response which could be resolved only by `.json()` promise.

Is it possible? Yes check the source !
