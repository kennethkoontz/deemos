var routes = module.exports = {
    '/': 'home',
    '/register': 'register',
    '/login': 'login',
    '/login/submit': 'loginSubmit',
    '/logout': 'logout',
    '/tweet': 'tweet',
    '/auth/twitter/': 'twitterAuthenticate',
    '/auth/facebook/': 'facebookAuthenticate',
    '/auth/twitter/callback': 'twitterCallback',
    '/auth/facebook/callback': 'facebookCallback',
    '/aggregate': 'aggregate'
}
