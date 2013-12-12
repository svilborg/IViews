#!/bin/env node

'use strict';

var express = require('express'),
    passport = require('./app/lib/passport.js'),
    flash = require('connect-flash'),
    config = require('./app/config');

// Define the application.
var IViewsApp = function () {

    // Scope.
    var self = this;


    /* ================================================================ */
    /* Helper functions. */
    /* ================================================================ */

    // Set up server IP address and port # using env variables/defaults.
    self.setupVariables = function () {
        // Set the environment variables we need.
        self.ipaddress = config.host;
        self.port = config.port;

        if (typeof self.ipaddress === 'undefined') {
            // Log errors on OpenShift but continue w/ 127.0.0.1 - this
            // allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = '127.0.0.1';
        }
    };


    /** terminator === the termination handler Terminate server on receipt of the
     * specified signal.
     *
     * @param {string}
     *            sig Signal to terminate on.
     */
    self.terminator = function (sig) {
        if (typeof sig === 'string') {
            console.log('%s: Received %s - terminating app ...', Date(Date.now()), sig);
            process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()));
    };


    // Setup termination handlers (for exit and a list of signals).

    self.setupTerminationHandlers = function () {
        // Process on exit and signals.
        process.on('exit', function () {
            self.terminator();
        });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
            'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function (element, index, array) {
            process.on(element, function () {
                self.terminator(element);
            });
        });
    };

    self.checkAuthentication = function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }

        req.logout();
        res.redirect('/login');
    };


    self.getAppPath = function (subPath) {
        return __dirname + '/app/' + subPath;
    };


    // ================================================================ //
    // App server functions (main app logic here). //
    // ================================================================ //

    //Initialize the server (express) and create the routes and register the
    // handlers.
    self.initializeServer = function () {

        self.app = express();

        self.app.use('/public', express.static(__dirname + '/public'));

        self.app.set('views', self.getAppPath('views'));
        self.app.set('view engine', 'ejs');
        self.app.engine('ejs', require('ejs-locals'));

        self.app.use(express.cookieParser());
        self.app.use(express.session({
            name: config.session.name,
            secret: config.session.secret,
            key : config.session.key
        }));

        self.app.use(passport.initialize());       
        self.app.use(passport.session());

        self.app.use(express.bodyParser());
        self.app.use(express.methodOverride());
        self.app.use(flash());
        //self.app.use(express.logger('dev'));

        // Routes
        ////////////////

        self.app.get('/', self.checkAuthentication, require(self.getAppPath('routes')).index);

        self.app.get('/login', require(self.getAppPath('routes')).login);
        self.app.post('/login', passport.authenticate('local', {
            successRedirect: '/',
            failureRedirect: '/login',
            failureFlash: true
        }));

        self.app.get('/logout', require(self.getAppPath('routes')).logout);

        self.app.get('/get', self.checkAuthentication, require(self.getAppPath('routes/user')).get);
        self.app.get('/create', self.checkAuthentication, require(self.getAppPath('routes/user')).create);
        self.app.get('/update', self.checkAuthentication, require(self.getAppPath('routes/user')).update);
        self.app.get('/delete', self.checkAuthentication, require(self.getAppPath('routes/user')).delete);
        self.app.get('/list', self.checkAuthentication, require(self.getAppPath('routes/user')).list);
        self.app.get('/summary', self.checkAuthentication, require(self.getAppPath('routes/user')).summary);

        self.app.get('/form', self.checkAuthentication, require(self.getAppPath('routes')).form);
        self.app.post('/upload', self.checkAuthentication, require(self.getAppPath('routes/user')).upload);
        self.app.get('/download', self.checkAuthentication, require(self.getAppPath('routes/user')).download);

        self.app.get('/author', self.checkAuthentication, function (req, res) {
            res.render('author');
        });
    };

    //Initializes the application.

    self.initialize = function () {
        self.setupVariables();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };

    // Start the server (starts up the application).
    self.start = function () {
        // Start the app on the specific interface (and port).
        self.app.listen(self.port, self.ipaddress, function () {
            console.log('%s: Node server started on %s:%d ...',
                Date(Date.now()), self.ipaddress, self.port);
        });
    };

}; /* Application. */

var app = new IViewsApp();

app.initialize();
app.start();