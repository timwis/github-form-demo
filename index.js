/* global $, Cookies, Github */
var config = {
  GITHUB_CLIENT: 'f8b5db18eb2794a70bc5',
  GATEKEEPER_HOST: 'http://localhost:9999'
}
var currentURL = window.location.href
var oauthToken = Cookies.get('oauth-token')
var authCodeMatch = window.location.href.match(/\?code=([a-z0-9]*)/)

if (oauthToken) {
// If user has oauth token stored in a cookie, show their username
  console.log('OAuth Token', oauthToken)
  var github = new Github({
    token: oauthToken,
    auth: 'oauth'
  })
  var user = github.getUser()
  user.show(null, function (err, userData) {
    if (err) console.error(err)
    setUserInfo(userData)
  })
} else if (authCodeMatch) {
// If URL has ?code=XXXX in it, use it to fetch oauth token
  var authCode = authCodeMatch[1]
  var authURL = config.GATEKEEPER_HOST + '/authenticate/' + authCode
  $.getJSON(authURL, function (data) {
    console.log('auth response', data)
    Cookies.set('oauth-token', data.token)
    removeFromURL('?code=' + authCode)
  })
}

// When user clicks login
$('[data-hook~=login-link]').on('click', function (e) {
  var redirectUrl = 'https://github.com/login/oauth/authorize'
  var redirectParams = {
    client_id: config.GITHUB_CLIENT,
    redirect_uri: currentURL,
    scope: 'public_repo'
  }
  window.location.href = redirectUrl + '?' + $.param(redirectParams)
  e.preventDefault()
})

// When user clicks logout
$('[data-hook~=logout-link]').on('click', function (e) {
  Cookies.remove('oauth-token')
  window.location.reload(true)
  e.preventDefault()
})

function removeFromURL (search) {
  window.location.href = window.location.href.replace(search, '')
}

function setUserInfo (userData) {
  $('[data-hook~=login-link]').hide()
  $('[data-hook~=user-name]').text(userData.login)
  $('[data-hook~=user-dropdown]').removeClass('hidden')
}
