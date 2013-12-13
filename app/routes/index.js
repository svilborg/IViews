'use strict';

exports.index = function (req, res) {    
    res.render('index', {
        title : 'InterViews'
    });
};

exports.login = function (req, res) {
    res.render('login', {
        title : 'InterViews',
        error : req.flash('error')
    });
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/');
};

exports.form = function (req, res) {
    res.render('form', {
        title : 'InterViews Upload',
        id : req.query.id,
        error : req.query.error,
        ok : req.query.ok
    });
};