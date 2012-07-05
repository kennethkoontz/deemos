var OAuth= require('oauth').OAuth;

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "lWc6kG4NPaWYzoKf3M38Ag",
    "at3gb0aWDbzqfIwph8iRnJLGZ37wxwWOLZMRt4Hk",
    "1.0",
    "http://binaryfootprints.com/auth/twitter/callback",
    "HMAC-SHA1"
);


var actions = module.exports = {
    index: function () {
        self = this;
        req = this.request;
        res = this.response;
        oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
            if (error) {
                self.json(error);
            }
            else {
                req.session = {};
                req.session.oauth = {};
                req.session.oauth.token = oauth_token;
                console.log('oauth.token: ' + req.session.oauth.token);
                req.session.oauth.token_secret = oauth_token_secret;
                console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
                self.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
            }
        });
    }
}
