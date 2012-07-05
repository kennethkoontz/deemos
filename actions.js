var OAuth= require('oauth').OAuth;

var sessions = {};

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
    home: function() {
        var oauth = sessions.oauth;
        console.log(oauth);
        oa.get("https://api.twitter.com/1/statuses/home_timeline.json", oauth.token, oauth.token_secret, function(error, data) {
            if (error) {
                self.json(error);
            } else {
                self.json(data);
            }
        });
    },
    login: function() {
        this.render('./views/login.html');
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
    twitterCb: function() {
        self = this;
        req = this.request;
        res = this.response;
        if (sessions.oauth) {
            var oauth = sessions.oauth;
            oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
                function(error, oauth_access_token, oauth_access_token_secret, results){
                    if (error) {
                        self.json(error);
                    } else {
                        sessions.oauth.access_token = oauth_access_token;
                        sessions.oauth,access_token_secret = oauth_access_token_secret;
                        self.json(results);
                    }
                }
            );
        } else {
            self.json({msg: 'you are not supposed to be here'});
        }
    }
}
