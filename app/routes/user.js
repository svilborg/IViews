'use strict';


var utils = require('../lib/utils'),
    dbLib = require('../lib/db'),
    db = dbLib.db(),
    fs = require('fs');

exports.get = function (req, res) {
    try {
        var id = db.ObjectId(req.query.id);

        db.candidates.findOne({
            _id: id
        }, function (e, record) {
            if (!e) {
                res.send(record);
            } else {
                res.send(utils.error(1001, e));
            }
        });
    } catch (e) {
        res.send(utils.error(1000));
        return;
    }
};

exports.delete = function (req, res) {
    var id = null;

    try {
        id = db.ObjectId(req.query.id);
    } catch (e) {
        res.send(utils.error(1000));
        return;
    }

    db.candidates.findOne({
        _id: id
    }, function (e, record) {
        if (!e) {

            if (record.file) {

                db.candidates.remove({
                    _id: id
                }, function (e) {
                    if (!e) {

                        var filePath = utils.getUploadFile(record.file);

                        fs.unlink(filePath, function (err) {
                            if (err) {
                                res.send(utils.success());
                            } else {
                                res.send(utils.success());
                            }
                        });
                    } else {
                        res.send(utils.error(2000));
                    }
                });
            } else {
                res.send(utils.success());
            }
        } else {
            res.send(utils.error(1001, e));
        }
    });

};

exports.create = function (req, res) {

    db.candidates.find({}, {
        id: 1
    }).sort({
        id: -1
    }).limit(1, function (e, record) {
        if (record) {
            var object = dbLib.userModel(req.query);

            object.id = parseInt(record[0].id, 10) + 1;

            db.candidates.save(object, function (e, record) {
                if (!e) {
                    res.send(utils.success(record));
                } else {
                    res.send(utils.error(3000, e));
                }
            });
        } else {
            res.send(utils.error(3001, 'Record is not created'));
        }
    });
};

exports.update = function (req, res) {
    var id = req.query._id,
        data = dbLib.userModel(req.query);

    delete data.file; // Remove file from update list

    try {
        id = db.ObjectId(id);

        db.candidates.update({
            _id: id
        }, {
            $set: data
        }, {
            multi: false
        }, function (e, record) {
            if (!e) {
                res.send(utils.success(record));
            } else {
                res.send(utils.error(4001, e));
            }
        });
    } catch (e) {
        res.send(utils.error(4000, 'Wrong Id'));
        return;
    }
};

exports.list = function (req, res) {

    var nPerPage = parseInt(req.query.rows_per_page, 10) || 5;
    var page = parseInt(req.query.page, 10) || 1;
    var total = 100,
        filter = req.query.f || {};

    if (filter.status) {
        filter.status = parseInt(filter.status);
    }
    if (filter.language_skills) {
        filter.language_skills = parseInt(filter.language_skills);
    }

    dbLib.buildFilter(filter, {
        status: 1,
        language_skills: 1
    });

    var excludes = {
        text: 0,
        file: 0,
        address: 0,
        city: 0
    };

    db.candidates.find(filter, excludes).count(function (err, num) {
        if (!err && num) {
            total = num;
        } else if (!num) {
            total = 0;
        }

        db.candidates.find(filter, excludes).sort({
            'id': -1
        }).skip((page - 1) * nPerPage).limit(nPerPage, function (e, rowsArray) {

            var result = {
                headers: {},
                rows: listRows(rowsArray),
                totalRows: total
            };

            res.send(result);
        });
    });
};

exports.summary = function (req, res) {

    var total = 100,
        filter = req.query.f || {};

    if (filter.status) {
        filter.status = parseInt(filter.status);
    }
    if (filter.language_skills) {
        filter.language_skills = parseInt(filter.language_skills);
    }

    dbLib.buildFilter(filter, {
        status: 1,
        language_skills: 1
    });

    var excludes = {
        text: 0,
        file: 0,
        address: 0,
        city: 0
    },
        minutes = 0,
        skilled = 0,
        costsMoney = 0,
        totalPaid = 0,
        totalDone = 0,
        paidMoney = 0,
        doneMoney = 0,
        language_skills = 0,
        perMinute = 0.40,
        moneyPerItem = 5,
        language_skills_avr = 0;

    db.candidates.find(filter, excludes).count(function (err, num) {
        if (!err && num) {
            total = num;
        }

        db.candidates.find(filter, excludes).sort({
            'id': -1
        }, function (e, rowsArray) {

            for (var i = 0; i < rowsArray.length; i++) {
                var row = rowsArray[i];

                minutes += row.minutes || 0;

                if (row.language_skills > 0) {
                    skilled += 1;
                    language_skills += row.language_skills;
                }

                if (row.status === 5) {
                    paidMoney += moneyPerItem;
                } else if (row.status === 4) {
                    doneMoney += moneyPerItem;
                }
            }

            if (language_skills && skilled > 0) {
                language_skills_avr = language_skills / skilled;
            } else {
                language_skills_avr = 0; // 'N/A';
            }

            costsMoney = perMinute * minutes;
            totalPaid = paidMoney + costsMoney;
            totalDone = doneMoney + costsMoney;


            var summary = {
                'skills_avg': language_skills_avr.toFixed(2),
                'minutes': minutes,
                'per_minute': perMinute,

                'costs': costsMoney.toFixed(2),
                'amt_done': doneMoney.toFixed(2),
                'amt_paid': paidMoney.toFixed(2),

                'total_amt_done': totalDone.toFixed(2),
                'total_amt_paid': totalPaid.toFixed(2),
            };

            res.send(summary);
        });

    });
};

exports.upload = function (req, res) {

    fs.readFile(req.files.image.path, function (err, data) {

        var fileName = req.files.image.name,
            id = req.body.id,
            filePath = utils.getUploadFile(fileName);

        if (!fileName) {
            res.redirect('/form?id=' + id + '&error=Missing File');
        } else if (!req.body.id) {
            res.redirect('/form?id=' + id + '&error=Missing Id');
        } else {
            fs.exists(filePath, function (exists) {
                if (exists) {
                    res.redirect('/form?id=' + id + '&error=File name already exists');
                } else {
                    fs.writeFile(filePath, data, function (err) {

                        if (!err) {

                            try {
                                var oid = db.ObjectId(id);

                                db.candidates.update({
                                    _id: oid
                                }, {
                                    $set: {
                                        file: fileName
                                    }
                                }, {
                                    multi: false
                                }, function (e) {
                                    if (!e) {
                                        res.redirect('/form?id=' + id + '&ok=1');
                                    } else {
                                        res.redirect('/form?id=' + id + '&error=' + e.message);

                                    }
                                });
                            } catch (e) {
                                res.redirect('/form?id=' + id + '&error=' + e.message);

                            }
                        } else {
                            console.log(err);
                            res.redirect('/form?id=' + id + '&error=' + err);
                        }
                    });
                }
            });

        }
    });
};

exports.download = function (req, res) {
    var id = req.query.id;

    if (id) {

        try {
            id = db.ObjectId(id);

            db.candidates.findOne({
                _id: id
            }, function (e, record) {

                var filePath = utils.getUploadFile(record.file);

                if (!e && record.file) {
                    try {
                        res.download(filePath, filePath, function (err) {
                            if (err) {
                                res.send(403, 'File not Found : ' + err);
                                res.end();
                            } else {
                                // Success 
                            }
                        });
                    } catch (e) {
                        res.send(403, 'File not Found : ' + e.message);
                        res.end();
                    }
                } else {
                    res.send(403, 'File not Found : Missing File');
                    res.end();
                }
            });
        } catch (e) {
            res.send(403, 'File not Found : Missing id');
            res.end();
        }
    } else {
        res.send(403, 'File not Found : Missing id');
        res.end();
    }
};

function listRows(rows) {
    var result = [],
        len = 0,
        i = 0,
        newRow = {};

    if (rows) {
        len = rows.length;

        for (i = 0; i < len; i++) {
            newRow = {
                'id': parseInt(rows[i].id, 10),
                'name': rows[i].firstName + ' ' + ((rows[i].lastName) ? rows[i].lastName : ''),
                'phone': rows[i].phone,
                'skills': rows[i].language_skills,
                'minutes': rows[i].minutes,
                'status': '<div class="' + utils.getStatusClass(rows[i].status) + '">' + utils.getStatus(rows[i].status) + '</div>',
                'date': rows[i].date_created,
                'action': utils.getButtonBar(rows[i]._id)
            };
            result.push(newRow);
        }
    }

    return result;
}