var OAuth= require('oauth').OAuth;

var sessions = {};

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "lWc6kG4NPaWYzoKf3M38Ag",
    "at3gb0aWDbzqfIwph8iRnJLGZ37wxwWOLZMRt4Hk",
    "1.0",
    "http://binaryfootprints.com/",
    "HMAC-SHA1"
);


var actions = module.exports = {
    login: function() {
        this.render('./views/login.html');
    },
    home: function() {
        this.render('./views/deemos.html');
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
                sessions.oauth = {};
                sessions.oauth.token = oauth_token;
                console.log('oauth.token: ' + sessions.oauth.token);
                sessions.oauth.token_secret = oauth_token_secret;
                console.log('oauth.token_secret: ' + sessions.oauth.token_secret);
                self.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
            }
        });
    },
    aggregate: function() {
        self = this;
        req = this.request;
        res = this.response;
        if (sessions.oauth) {
            var oauth = sessions.oauth;
            oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
                function(error, token, secret, results){
                    if (error) {
                        self.json(error);
                    } else {
                        oa.get("https://api.twitter.com/1/statuses/home_timeline.json", token, secret, function(error, data) {
                            if (error) {
                                self.json(error);
                            } else {
                                self.json(data);
                            }
                        });
                    }
                }
            );
        } else {
            self.json({msg: 'you are not supposed to be here'});
        }
    }
}
