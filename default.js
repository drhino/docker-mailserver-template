let interval,
  destination = window.location.origin,
      seconds = Number(
                document.getElementById('module').getAttribute('data-seconds')
              )
const elError = document.getElementById('traceError'),
      elTitle = document.getElementById('traceTitle'),
      elRetry = document.getElementById('traceRetry'),
       button = document.getElementById('button'),
       valign = document.getElementById('valign'),

updateElement = (element, value) => {
  if (element.innerHTML !== value) {
      element.className = 'animate'
      setTimeout(() => {
        element.innerHTML = value
        element.className = ''
      }, 500)
  }
},

// (HTTP 200) Redirects to the homepage.
// (HTTP 4xx) Displays the error message.
// (HTTP 5xx) Starts a timer checking the network until back available.
requestHandle = () => fetch(destination, { method: 'HEAD' }).then(responseEvent)
                     .catch(er => {
                       updateElement(elError, er.stack)
                       updateElement(elTitle, er.title || messages.unavailable)
                       if (!er.status || er.status >= 500) throw null
                     }),
responseEvent = response => {

  if (response.ok) {
      valign.className = 'leave'
      return setTimeout(() => window.location = window.location.origin, 500)
  }

  const stack = response.headers.get('x-e-trace'),
        title = response.headers.get('x-e-title')

  seconds = Number(response.headers.get('Refresh-After')) || seconds

  if (response.status === 401 && button.getAttribute('href') !== '/?login') {
      button.setAttribute('href', '/?login')
      updateElement(button, messages.signin)
  }

  throw { stack, title, status: response.status }
},

// Timer until network back online or server responded with non-500 status code.
refreshHandle = () => {
     let secs = seconds
  elRetry.innerHTML = messages.retryafter + ' ' + secs + 's'

  clearInterval(interval)
  interval = setInterval(() => {
    elRetry.innerHTML = messages.retryafter + ' '
                       + (secs-- > 1 ? secs + 's' : '-')
    if (secs === 0)
        requestHandle().then(() => {
          clearInterval(interval)
          if (!response.ok) button.click()
        })
       .catch(() => secs = seconds + 1)
  }, 1000)
}

// 'data-seconds' is set on the server along with the 'Refresh-After' header.
if (seconds) refreshHandle()
else seconds = 10

button.onclick = event => {
  event.preventDefault()
  button.blur()
  destination = window.location.origin + button.getAttribute('href')
  requestHandle().catch(refreshHandle)
}

// Pressing the enter key does the same as clicking the button.
document.onkeypress = e => e.keyCode === 13 && button.click()
