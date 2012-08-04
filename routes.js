var routes = module.exports = {
    '/': 'home',
    '/login': 'login',
    '/tweet': 'tweet',
    '/auth/twitter/': 'twitterAuthenticate',
    '/auth/facebook/': 'facebookAuthenticate',
    '/auth/twitter/callback': 'twitterCallback',
    '/auth/facebook/callback': 'facebookCallback',
    '/aggregate': 'aggregate'
}
