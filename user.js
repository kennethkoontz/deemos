var util = require('util'),
    request = require('request'),
    redis = require("redis"),
    client = redis.createClient(),
    events = require('events');

    client.on("error", function(error) {
        console.log("Error: " + err);
    });

var couch = {
    base: 'http://localhost:5984/'
};

var User = function() {
    events.EventEmitter.call(this);

    this.register = function(user) {
        var self = this;

        request.post({url: couch.base+'users', json: user}, function(error, response, body) {
            if (error) {
                self.emit('registrationError');
            } else {
                self.emit('registrationSuccess');
            }
        });
    };

    this.checkEmail = function(email) {
        var self = this;

        request(couch.base+'users/_design/user_email/_view/by_email?key="'+email+'"', function(error, response, body) {
            if (error) {
                self.emit('emailNotAvailable');
            } else {
                if (JSON.parse(body).rows.length === 1) {
                    self.emit('emailNotAvailable');
                } else {
                    self.emit('emailAvailable');
                }
            }
        });
    };

    this.login = function(email, password) {
        var self = this;

        request(couch.base+'users/_design/user_email/_view/by_email?key="'+email+'"', function(error, response, body) {
            var doc = JSON.parse(body).rows[0];

            if (!error) {

                // Doc is undefined when the query returns no rows.
                if (doc === undefined) {
                    self.emit('loginInvalid');
                } else if (password === doc.value.password && email === doc.value.email) {
                    self.emit('loginValid');
                } else {
                // For all other cases.
                    self.emit('loginInvalid');
                }
            } else {
                throw error;
            }
        });
    };

};

util.inherits(User, events.EventEmitter);
module.exports = new User();
