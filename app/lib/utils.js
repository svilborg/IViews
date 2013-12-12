'use strict';

exports.getUploadDir = function () {
    var dataDir = process.env.OPENSHIFT_DATA_DIR;

    if (typeof dataDir === 'undefined') {
        dataDir = __dirname + '/../../data';
    }
    else {
        dataDir = dataDir + 'uploads';
    }

    return dataDir;
}; 

exports.getUploadFile = function (fileName) {
    var path = require('path'), 
    dataDir = exports.getUploadDir();

    return path.normalize(dataDir + '/' + fileName);
};

exports.getDateYMD = function (date) {
    var d = date || new Date();

    var yyyy = d.getFullYear().toString();                                    
    var mm   = (d.getMonth() + 1).toString();     
    var dd   = d.getDate().toString();             

    return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
};

exports.error = function (code, message) {
    return {'KO' : code, 'message' : message};
};

exports.success = function (record) {
    return {'OK' : 1, 'record' : record};
};

exports.getStatuses = function () {
    return {
        '2' : 'To Call',
        '3' : 'Rejected',
        '4' : 'Done',
        '5' : 'Paid'
    };
};

exports.getStatus = function (statusId) {
    var all = exports.getStatuses();
    if (typeof all[statusId] !== 'undefined') {
        return all[statusId];
    }

    return 'N/A';
};


exports.getStatusClass = function (statusId) {
    var classes = {
        '2' : 'ink-label error',
        '3' : '',
        '4' : 'ink-label success',
        '5' : 'ink-label info'
    };

    return classes[statusId];
};

exports.getButtonBar = function (id) { 
    var res = '<button class="ink-button" data-id="' + id + '" style="margin: 1pt;" onclick="Ink.Comix.IViews.showUpdateForm(\'' + id + '\');"><span class="icon-edit"></span></button>' +
    '<button class="ink-button" data-id="' + id + '" style="margin: 1pt;" onclick="Ink.Comix.IViews.userDelete(\'' + id + '\');"><span class="icon-trash"></span></button>';

    return res;
};