'use strict';

var passport = require('passport'),
LocalStrategy = require('passport-local').Strategy,
dbLib = require('./db'),
db = dbLib.db();

passport.use(new LocalStrategy(function (username, password, done) {

    db.users.findOne({
        username : username
    }, function (e, record) {
        if (!e && record) {
            if (record.password === password) {
                record.password = "---";

                return done(null, record);
            }
            else {
                return done(null, false, { message: 'Incorrect password.' });
            }
        } else {
            return done(null, false, { message: 'Incorrect username/password.' });
        }
    });
}));

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

module.exports = passport;