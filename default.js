import { translate, language } from './translate.js'

let interval, cancel,
  destination = window.location.origin,
      seconds = Number(
                document.getElementById('module').getAttribute('data-seconds')
              )
const elError = document.getElementById('traceError'),
      elTitle = document.getElementById('traceTitle'),
      elRetry = document.getElementById('traceRetry'),
      elExtra = document.getElementById('traceExtra'),
       button = document.getElementById('button'),
       valign = document.getElementById('valign'),

allowedStatus = [200, 204, 400, 401, 404, 405, 503],
      message = id => {
          try {
              return translate(id)
          } catch (e) {
              return e
          }
      },
updateElement = (element, value) => {
  if (!value) value = ''
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
// (HTTP 50x) Starts a timer checking the destination until available.
// (HTTP 600) Network error. Same as above without response from worker.
requestHandle = () => {
    cancel &&
    cancel.abort()
    cancel = new AbortController()

    return fetch(destination, { method: 'HEAD', signal: cancel.signal })
    .catch(er => { throw {...er, title: 'Network Error.', status: 600 } })
     .then(responseEvent)
    .catch(er => {
       if (er.name === 'AbortError') return

       if (er.status >= 500)
           er.extra = destination.endsWith('/?login') ? message('login_503')
                   : (destination.endsWith('/logout') ? message('logout_503')
                   : null)

       updateElement(elError, er.stack)
       updateElement(elTitle, er.title)
       updateElement(elExtra, er.extra)

       // Starts refreshHandle() OR resets/updates 'seconds'.
       if (er.status >= 500) throw true
    })
},
responseEvent = response => {

  if (allowedStatus.includes(response.status) === false)
      throw { title: `Unknown ${response.status}.`, status: response.status }

  if (response.ok) {
      valign.className = 'hidden'
      return setTimeout(() => window.location = window.location.origin, 500)
  }

  const stack = response.headers.get('x-e-trace'),
        title = response.headers.get('x-e-title')

  seconds = Number(response.headers.get('Refresh-After')) || seconds

  if (response.status === 401 && button.getAttribute('href') !== '/?login') {
      button.setAttribute('href', '/?login')
      updateElement(button, message('login'))
  }

  throw { stack, title, status: response.status }
},

// Timer until status code < 500.
refreshHandle = () => {
     let secs = seconds
  elRetry.innerHTML = message('retryafter') + ' ' + secs + 's'

  interval = setInterval(() => {
    elRetry.innerHTML = message('retryafter') + ' '
                       + (secs-- > 1 ? secs + 's' : '-')
    if (secs === 0) 
        requestHandle().then(() => clearInterval(interval))
         .catch(retry => {
             if (true !== retry) { clearInterval(interval); throw retry }
             secs = seconds + 1
         })
  }, 1000)
}

// 'data-seconds' is set on the server along with the 'Refresh-After' header.
if (seconds) refreshHandle()
else seconds = 10

button.onclick = event => {
 event.preventDefault()

 if ( ! button.hasAttribute('tabindex') ) {
        button.setAttribute('tabindex', '-1')
        button.blur()
        clearInterval(interval)

        destination = window.location.origin + button.getAttribute('href')

        requestHandle()
        .catch(retry => {
            if (true !== retry) throw retry
            refreshHandle()
        })
        .finally(() => button.removeAttribute('tabindex'))
 }
}

// Pressing the enter key does the same as clicking the button.
document.onkeypress = e => e.keyCode === 13 && button.click()
