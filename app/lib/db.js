'use strict';

var mongojs = require('mongojs');
var utils   = require('../lib/utils');
var db      = null;

// Gets Connection
var getConnection = function () {
    // default to a 'localhost' configuration:
    var result = '127.0.0.1/iviews';

    // if OPENSHIFT env variables are present, use the available connection
    // info:
    if (process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
        result = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ':' + process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@' + process.env.OPENSHIFT_MONGODB_DB_HOST + ':' + process.env.OPENSHIFT_MONGODB_DB_PORT + '/' + process.env.OPENSHIFT_APP_NAME;
    } else {

    }

    return result;
};

exports.db = function (collection) {
    if (db === null) {
        var connection = getConnection();

        db = mongojs(connection, [ 'candidates', 'users' ]);
    }

    return db;
};

exports.buildFilter = function (object, exact) { 
    for (var i in object) {
        if (object[i] === null || object[i] === undefined || !object[i])  {
            delete object[i];
        }
        else {
            if (typeof exact[i] !== 'undefined') {
                object[i] = object[i];

            }
            else {
                object[i] = new RegExp('' + object[i]);
            }
        }
    }
};

exports.userModel = function (object) { 
    var model = {
        'id'              : parseInt(object.id) || 0, 
        'firstName'       : object.firstName || '',
        'lastName'        : object.lastName || '',
        'phone'           : object.phone || '',
        'language_skills' : parseInt(object.language_skills) || 0,
        'email'           : object.email || '',
        'minutes'         : parseInt(object.minutes) || 0,
        'status'          : parseInt(object.status) || 0,
        'text'            : object.text || '',
        'file'            : '',
        'date_created'    : object.date_created || utils.getDateYMD()
    };

    return model;
};