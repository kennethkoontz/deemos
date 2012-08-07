var crypto = require('crypto'),
    qs = require('querystring'),
    url = require('url'),
    redis = require("redis"),
    client = redis.createClient(),
    request = require('request'),
    moment = require('moment'),
    OAuth = require('oauth').OAuth,
    user = require('./user');

    client.on("error", function(error) {
        console.log("Error: " + err);
    });

var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    "lWc6kG4NPaWYzoKf3M38Ag",
    "at3gb0aWDbzqfIwph8iRnJLGZ37wxwWOLZMRt4Hk",
    "1.0",
    "http://deemos.binaryfootprints.com/auth/twitter/callback",
    "HMAC-SHA1"
);

var fb = {
    base: "https://www.facebook.com/",
    graph: "https://graph.facebook.com/",
    auth: "dialog/oauth",
    accessToken: "oauth/access_token",
    redirect: "http://deemos.binaryfootprints.com/auth/facebook/callback",
    accessRedirect: "http://deemos.binaryfootprints.com/",
    clientId: "450449624976739",
    appSecret: "e856fdd60f0149e0ecc257914590c1e1"
};

var couch = {
    base: 'http://localhost:5984/'
};

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
    try {
        assert(typeof cookieString === 'string', 'Object is not a string');
    } catch(err) {
        return {};
    }

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
    loginSubmit: function() {
        var self = this,
            session = generateCookie();

        user.on('loginValid', function(data) {
            client.sadd('sessions', session, redis.print);
            self.response.writeHead(200, {"Set-Cookie": "session="+session+";Path=/"});
            self.response.end();
        });
        user.on('loginInvalid', function(data) {
            self.statusCode(404);
        });
        user.login(self.postData.email, self.postData.password);
    },
    logout: function() {
        var self = this,
            session = cookieParser(this.request.headers.cookie)['session'];

        client.spop(session, function() {
            self.response.setHeader("Set-Cookie", ["session="+session+";expires="+new Date(1)+";Path=/"]);
            self.redirect('/');
        });
    },
    home: function() {
        var self = this,
            session = cookieParser(this.request.headers.cookie).session;

        if (session) {
            client.sismember('sessions', session, function(error, data) {
                if (data === 1) {
                    self.render('./views/deemos.html');
                } else {
                    self.redirect('/login');
                }
            });
        } else {
            self.redirect('/login');
        }
    },
    tweet: function() {
        var self = this,
            sessionid = cookieParser(self.request.headers.cookie)['sessionid']; 
        client.hmget(sessionid, 'twitter-accessToken', 'twitter-accessSecret', function(error, replies) {
            if (error) {
                console.log(error);
                self.json(error);
            }
            console.log(replies[0], replies[1], self.postData, oa)
            oa.post("https://api.twitter.com/1/statuses/update.json", 
                replies[0], replies[1], {status: self.postData.body},
                function(error, data) {
                    if (error) {
                        console.log(error);
                        self.json(error);
                    }
                    self.json(data);
               }
            );
        });
        console.log(self.postData);
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
                    client.hmset(sessionid, 'twitter-oauthToken', oauth_token, 'twitter-oauthTokenSecret', oauth_token_secret, redis.print);
                    self.response.setHeader("Set-Cookie", ["sessionid="+sessionid+";Path=/"]);
                    self.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
                }
            }
        );
    },
    register: function() {
        var self = this,
            isAjax = true ? this.request['headers']['x-requested-with'] : false;

        if (isAjax && this.request.method === 'POST') {
            var session = generateCookie();
            
            user.on('registrationSuccess', function() {
                client.sadd('sessions', session, redis.print);
                self.response.setHeader("Set-Cookie", ["session="+session+";Path=/"]);
                self.redirect('/');
            });
            user.on('registrationError', function() {
                self.statusCode(404);
            });
            user.register(self.postData);
        } else if (isAjax && this.request.method === 'GET') {
            var email = qs.parse(url.parse(self.request.url).query).email;

            user.on('emailAvailable', function() {
                self.statusCode(200);
            });
            user.on('emailNotAvailable', function() {
                self.statusCode(404);
            });
            user.checkEmail(email);
        } else {
            this.render('./views/register.html');
        }
    },
    facebookAuthenticate: function() {
        this.redirect(fb.base+fb.auth+'?client_id='+fb.clientId+'&redirect_uri='+fb.redirect+'&scope=read_stream');
    },
    facebookCallback: function() {
        var self = this,
            urlString = this.request.url,
            code = qs.parse(url.parse(urlString).query).code,
            sessionid = cookieParser(self.request.headers.cookie)['sessionid'],
            accessUrl = fb.graph+fb.accessToken+'?client_id='+fb.clientId+'&redirect_uri='+fb.redirect+
                        '&client_secret='+fb.appSecret+'&code='+code;

        request(accessUrl, function(error, response, body) {
            if (error) {
                self.json(error);
            } else {
                client.hmset(sessionid, 'fb-accessToken', qs.parse(body).access_token, redis.print);
                self.redirect('http://deemos.binaryfootprints.com/');
            }
        });
    },
    twitterCallback: function() {
        var self = this,
            verifier = qs.parse(self.request.headers.referer).oauth_verifier,
            sessionid = cookieParser(self.request.headers.cookie)['sessionid']; 

        client.hmget(sessionid, 'twitter-oauthToken', 'twitter-oauthTokenSecret', function(error, replies) {
            oa.getOAuthAccessToken(replies[0], replies[1], verifier, function(error, accessToken, accessSecret, results) {
                if (error) {
                    self.json(error);
                }
                client.hmset(sessionid, 'twitter-accessToken', accessToken, 'twitter-accessSecret', accessSecret, redis.print);
                self.redirect('/');
            });
        });
    },
    aggregate: function() {
        var self = this,
            sessionid = cookieParser(self.request.headers.cookie)['sessionid'],
            stream = {unsorted: []};
        if (sessionid) {
            client.hmget(sessionid, 'twitter-accessToken', 'twitter-accessSecret', 'fb-accessToken', function(error, replies) {
                if (error) {
                    self.json(error);
                }

                oa.get("https://api.twitter.com/1/statuses/home_timeline.json", replies[0], replies[1], function(error, twitter) {
                    if (error) {
                        console.log(error);
                        self.json(error);
                    }
                    request("https://graph.facebook.com/me/home?access_token="+replies[2], function(error, response, fb) {
                        if (error) {
                            console.log(error);
                        } else {
                            stream['twitter'] = JSON.parse(twitter) || [];
                            stream['fb'] = JSON.parse(fb).data || [];
                        }
                        for (x in stream.twitter) {
                            stream.twitter[x]['twitter'] = true;
                            stream.twitter[x]['created_on'] = new Date(stream.twitter[x].created_at);
                            stream.twitter[x]['time_ago'] = moment(stream.twitter[x].created_at).fromNow();
                            stream.unsorted.push(stream.twitter[x]);
                        }
                        for (x in stream.fb) {
                            stream.fb[x]['facebook'] = true;
                            stream.fb[x]['created_on'] = new Date(stream.fb[x].created_time);
                            stream.fb[x]['time_ago'] = moment(stream.fb[x].created_time).fromNow();
                            stream.unsorted.push(stream.fb[x]);
                        }
                        self.json(stream.unsorted);
                    });
                });

            });
        } else {
            self.json({});
        }
    }
}
