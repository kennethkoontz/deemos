var routes = module.exports = {
    '/': 'home',
    '/register': 'register',
    '/register/email': 'registerEmail',
    '/checkEmail': 'checkEmail',
    '/login': 'login',
    '/login/submit': 'loginSubmit',
    '/tweet': 'tweet',
    '/auth/twitter/': 'twitterAuthenticate',
    '/auth/facebook/': 'facebookAuthenticate',
    '/auth/twitter/callback': 'twitterCallback',
    '/auth/facebook/callback': 'facebookCallback',
    '/aggregate': 'aggregate'
}
