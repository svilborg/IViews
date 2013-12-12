'use strict';

var mongojs = require('mongojs'),
    utils = require('../lib/utils'),
    config = require('../config'),
    db = null;


exports.db = function (collection) {
    if (db === null) {
        db = mongojs(config.mongo.db, ['candidates', 'users']);
    }

    return db;
};

exports.buildFilter = function (object, exact) {
    for (var i in object) {
        if (object[i] === null || object[i] === undefined || !object[i]) {
            delete object[i];
        } else {
            if (typeof exact[i] !== 'undefined') {
                object[i] = object[i];

            } else {
                object[i] = new RegExp('' + object[i]);
            }
        }
    }
};

exports.userModel = function (object) {
    var model = {
        'id': parseInt(object.id) || 0,
        'firstName': object.firstName || '',
        'lastName': object.lastName || '',
        'phone': object.phone || '',
        'language_skills': parseInt(object.language_skills) || 0,
        'email': object.email || '',
        'minutes': parseInt(object.minutes) || 0,
        'status': parseInt(object.status) || 0,
        'text': object.text || '',
        'file': '',
        'date_created': object.date_created || utils.getDateYMD()
    };

    return model;
};