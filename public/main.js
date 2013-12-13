'use strict';
/*global window, document, confirm, EJS, Ink */

var table = "";

Ink.createModule('Ink.Comix.IViews', '1', ['Ink.Dom.Css_1'], function (Css) {
    /**
     * Methods
     *
     * @class Ink.IViews.module
     * @static
     */
    var module = {
        /**
         * Loads Summary Info
         *
         * @method publicMethod
         * @param {String} name Name to be placed in the string
         * @param {Number} number Number to be placed in the string
         * @returns {String} The string correctly parsed.
         */
        loadSummary: function () {

            var params = this.getFilterParams();

            if (Ink.i("summaryBox").style.display === "none") {
                new Ink.Net.Ajax("summary?", {
                    method: 'GET',
                    contentType: 'application/json',
                    parameters: params,
                    sanitizeJSON: true,
                    onSuccess: function (response) {
                        if (response.status === 200) {
                            Ink.i("summaryBox").innerHTML = new EJS({
                                url: 'public/ejs/summary.html'
                            }).render(response.responseJSON);
                        } else {
                            module.showMessage("Error loading summary data !");
                        }
                    }
                });
            }

            this.showHide("summary");
        },

        showHide: function (type) {
            if (type === "create") {
                Ink.i("createForm").reset();

                Css.hide(Ink.i("updateForm"));
                Css.hide(Ink.i("uploadForm"));
                Css.hide(Ink.i("filterForm"));
                Css.hide(Ink.i("summaryBox"));
                Css.toggle(Ink.i("createForm"));

            } else if (type === "summary") {
                Css.hide(Ink.i("updateForm"));
                Css.hide(Ink.i("uploadForm"));
                Css.hide(Ink.i("createForm"));
                Css.hide(Ink.i("filterForm"));
                Css.toggle(Ink.i("summaryBox"));
            } else {
                Css.hide(Ink.i("updateForm"));
                Css.hide(Ink.i("uploadForm"));
                Css.hide(Ink.i("createForm"));
                Css.hide(Ink.i("summaryBox"));
                Css.toggle(Ink.i("filterForm"));
            }
        },

        showUpdateForm: function (id) {
            Css.show(Ink.i("updateForm"));
            Css.hide(Ink.i("uploadForm"));
            Css.hide(Ink.i("createForm"));
            Css.hide(Ink.i("filterForm"));
            Css.hide(Ink.i("summaryBox"));

            new Ink.Net.Ajax("get/", {
                method: 'GET',
                contentType: 'application/json',
                parameters: {
                    id: id
                },
                sanitizeJSON: true,
                onSuccess: function (response) {
                    if (response.status === 200) {
                        var record = response.responseJSON;
                        if (!record.KO) {
                            if (typeof record.status !== "undefined") {
                                record.status = record.status.toString();
                            }

                            if (typeof record.language_skills !== "undefined") {
                                record.language_skills = record.language_skills.toString();
                            }

                            Ink.Dom.FormSerialize.fillIn("updateForm", record);
                        } else {
                            module.showMessage("Error extracting record !");
                        }
                    }
                }
            });
        },

        showUploadForm: function () {
            Css.show(Ink.i("uploadForm"));
            //Css.hide(Ink.i("updateForm"));
            Css.hide(Ink.i("createForm"));
            Css.hide(Ink.i("filterForm"));
            Css.hide(Ink.i("summaryBox"));

            Ink.i('uploadIFrame').src = "form/?id=" + Ink.i("u__id").value;
        },

        downloadFile: function () {
            Ink.i('downloadIFrame').src = "download/?id=" + Ink.i("u__id").value;
        },

        showMessage: function (msg, callback, int) {
            int = int || 5000;

            Ink.i("msgBox").innerHTML = new EJS({
                url: 'public/ejs/message.html'
            }).render({
                "msg": msg
            });



            setTimeout(function () {
                if (typeof callback === "function") {
                    callback();
                }
                Ink.i("msgBox").innerHTML = "";
            }, int);
        },

        userCreate: function () {

            if (!Ink.UI.FormValidator_1.validate(Ink.i("createForm"))) {
                return false;
            }

            new Ink.Net.Ajax("create/", {
                method: 'GET',
                contentType: 'application/json',
                parameters: Ink.Dom.FormSerialize.serialize("createForm"),
                sanitizeJSON: true,
                onSuccess: function (response) {
                    if (response.status === 200) {

                        var record = response.responseJSON;
                        if (record.KO) {
                            module.showMessage("Error Creating the Record");
                        } else {
                            module.filterTable();
                        }
                    }
                }
            });
        },

        userUpdate: function () {

            if (!Ink.UI.FormValidator_1.validate(Ink.i("updateForm"))) {
                return false;
            }

            new Ink.Net.Ajax("update/", {
                method: 'GET',
                contentType: 'application/json',
                parameters: Ink.Dom.FormSerialize.serialize("updateForm"),
                sanitizeJSON: true,
                onSuccess: function (response) {
                    if (response.status === 200) {
                        var record = response.responseJSON;

                        if (record.KO) {
                            module.showMessage("Error Updating the Record");
                        } else {
                            module.filterTable();
                        }
                    }
                }
            });
        },

        userDelete: function (id) {
            var confirmed = confirm('Do you really want to delete the record?');

            if (!confirmed) {
                return false;
            }

            new Ink.Net.Ajax("delete/", {
                method: 'GET',
                contentType: 'application/json',
                parameters: {
                    id: id
                },
                sanitizeJSON: true,
                onSuccess: function (response) {
                    if (response.status === 200) {
                        var record = response.responseJSON;
                        if (record.KO) {
                            module.showMessage("Error Deleting the Record !");
                        } else {
                            module.filterTable();
                        }
                    }
                }
            });
        },

        getFilterParams: function () {
            var filterParams = Ink.Dom.FormSerialize.serialize("filterForm"),
                params = "";

            for (var paramName in filterParams) {
                if (typeof filterParams[paramName] !== "undefined" && filterParams[paramName]) {
                    params += "&" + paramName + "=" + filterParams[paramName];
                }
            }

            return params;
        },

        filterTable: function () {

            var params = this.getFilterParams();
            if (table) {
                table._pagination._element.innerHTML = "";
            }

            //recreate table
            this.initTable(params);
        },

        initTable: function (params) {
            var tdOptions = {
                "id": {
                    "class": "hide-small"
                },
                "name": "",
                "phone": {
                    "class": "hide-small"
                },
                "skills": {
                    "class": "hide-small"
                },
                "minutes": {
                    "class": "hide-small"
                },
                "status": {
                    "class": "hide-small hide-medium"
                },
                "date": {
                    "class": "hide-small hide-medium"
                },
                "action": {
                    "class": ""
                }
            },
                endpoint = "/list?" + (params || "");

            table = new Ink.UI.Table('.ink-table', {
                'endpoint': endpoint,
                'tdOptions': tdOptions
            });
        }

    };

    return module;
});

Ink.requireModules(['Ink.Dom.Loaded_1', 'Ink.Dom.Event_1', 'Ink.Comix.IViews'], function (Loaded, Event, IViews) {

    Loaded.run(function () {
        IViews.initTable();

        Event.observe(Ink.i('menuSummary'), 'click', function (e) {
            Event.stop(e);

            IViews.loadSummary();
        });

        Event.observe(Ink.i('menuNew'), 'click', function (e) {
            Event.stop(e);

            IViews.showHide('create');
        });

        Event.observe(Ink.i('menuFilter'), 'click', function (e) {
            Event.stop(e);

            IViews.showHide();
        });

        Event.observe(Ink.i('formSearch'), 'click', function (e) {
            Event.stop(e);

            IViews.filterTable();
        });

        Event.observe(Ink.i('formSave'), 'click', function (e) {
            Event.stop(e);

            IViews.userCreate();
        });

        Event.observe(Ink.i('formUpdate'), 'click', function (e) {
            Event.stop(e);

            IViews.userUpdate();
        });

        Event.observe(Ink.i('formShowUpload'), 'click', function (e) {
            Event.stop(e);

            IViews.showUploadForm();
        });

        Event.observe(Ink.i('formDownload'), 'click', function (e) {
            Event.stop(e);

            IViews.downloadFile();
        });
    });

});