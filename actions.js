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
    index: function() {
        this.response.writeHead(200);
        this.response.write('Index');
        this.response.end();
    },
    twitterAuthenticate: function() {
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
    },
    twitterCb: function() {
        self = this;
        req = this.request;
        res = this.response;
        if (req.session.oauth) {
            req.session.oauth.verifier = req.query.oauth_verifier;
            var oauth = req.session.oauth;
            oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
                function(error, oauth_access_token, oauth_access_token_secret, results){
                    if (error) {
                        self.json(error);
                    } else {
                        req.session.oauth.access_token = oauth_access_token;
                        req.session.oauth,access_token_secret = oauth_access_token_secret;
                        self.json(results);
                    }
                }
            );
        } else {
            self.json({msg: 'you are not supposed to be here'});
        }
    }
}
