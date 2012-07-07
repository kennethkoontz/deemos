var crypto = require('crypto'),
    qs = require('querystring'),
    redis = require("redis"),
    client = redis.createClient(),
    OAuth = require('oauth').OAuth;

    client.on("error", function(error) {
        console.log("Error: " + err);
    });

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "lWc6kG4NPaWYzoKf3M38Ag",
    "at3gb0aWDbzqfIwph8iRnJLGZ37wxwWOLZMRt4Hk",
    "1.0",
    "http://binaryfootprints.com/auth/twitter/callback",
    "HMAC-SHA1"
);

var generateString = function() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var stringLength = 8;
    var randomString = '';

    for (var i=0; i<stringLength; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomString += chars.substring(rnum,rnum+1);
    }
    return randomString;
}

var generateCookie = function() {
    var randomString = Math.round(new Date().getTime() / 1000.0) + generateString(); // concat epoch time and 8 character string
    return crypto.createHash('md5').update(randomString).digest('hex');
}

/* TODO *** Assert Exception *** 
 * Let's move this somewhere better than here.
 */
var AssertException = function (message) { this.message = message; }

AssertException.prototype.toString = function () {
    return 'AssertException: ' + this.message;
}

var assert = function (exp, message) {
    if (!exp) {
        throw new AssertException(message);
    }
}

/* TODO *** Assert Exception (END) ***
 */

/* TODO Issue 15 in mold repo.
 * Take this out of here.
 *
 * Parse a cookie string and return a cookie object.
 *
 * @params
 * cookieString - cookie representation in a string format
 *
 * @returns
 * cookie object
 */
var cookieParser = function(cookieString) {
    assert(typeof cookieString === 'string', 'Object is not a string');

    var cookiesArray = cookieString.split(';'),
        cookiesObject = {},
        keyValue;

    cookiesArray.forEach(function(e, i, a) {
        keyValue = e.split('=');
        cookiesObject[keyValue[0].trim()] = keyValue[1];
    });

    return cookiesObject;
}


var actions = module.exports = {
    login: function() {
        this.render('./views/login.html');
    },
    home: function() {
        this.render('./views/deemos.html');
    },
    twitterAuthenticate: function() {
        self = this;
        oa.getOAuthRequestToken(
            function(error, oauth_token, oauth_token_secret, results){
                var oauthCred = [oauth_token, oauth_token_secret].join(":"),
                    sessionid = generateCookie();
                
                if (error) {
                    self.json(error);
                } else {
                    client.hmset(sessionid, 'oauthToken', oauth_token, 'oauthTokenSecret', oauth_token_secret, redis.print);
                    self.response.setHeader("Set-Cookie", ["sessionid="+sessionid+";Path=/"]);
                    self.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
                }
            }
        );
    },
    twitterCallback: function() {
        var self = this,
            verifier = qs.parse(self.request.headers.referer).oauth_verifier,
            sessionid = cookieParser(self.request.headers.cookie)['sessionid']; 
        client.hmget(sessionid, 'oauthToken', 'oauthTokenSecret', function(error, replies) {
            console.log(replies);
            oa.getOAuthAccessToken(replies[0], replies[1], verifier, function(error, accessToken, accessSecret, results) {
                if (error) {
                    console.log(error);
                    self.json(error);
                }
                client.hmset(sessionid, 'accessToken', accessToken, 'accessSecret', accessSecret, redis.print);
                self.redirect('/');
            });
        });
    },
    aggregate: function() {
        var self = this,
            sessionid = cookieParser(self.request.headers.cookie)['sessionid']; 

        client.hmget(sessionid, 'accessToken', 'accessSecret', function(error, replies) {
            if (error) {
                console.log(error);
                self.json(error);
            }

            oa.get("https://api.twitter.com/1/statuses/home_timeline.json", replies[0], replies[1], function(error, data) {
                if (error) {
                    console.log(error);
                    self.json(error);
                }
                self.json(data);
            });
        });
    }
}
