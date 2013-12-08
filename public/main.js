'use strict';
/*global window, document, confirm, EJS, Ink */

var Css = Ink.Dom.Css;

function showHide(type) {
    if (type === "create") {
        Ink.i("createForm").reset();

        Css.hide(Ink.i("updateForm"));
        Css.hide(Ink.i("uploadForm"));
        Css.hide(Ink.i("filterForm"));
        Css.hide(Ink.i("summaryBox"));
        Css.toggle(Ink.i("createForm"));

    }
    else if (type === "summary") {
        Css.hide(Ink.i("updateForm"));
        Css.hide(Ink.i("uploadForm"));
        Css.hide(Ink.i("createForm"));
        Css.hide(Ink.i("filterForm"));
        Css.toggle(Ink.i("summaryBox"));
    } 
    else {
        Css.hide(Ink.i("updateForm"));
        Css.hide(Ink.i("uploadForm"));
        Css.hide(Ink.i("createForm"));
        Css.hide(Ink.i("summaryBox"));
        Css.toggle(Ink.i("filterForm"));
    }
}

function showUpdateForm(id) {
    Css.show(Ink.i("updateForm"));
    Css.hide(Ink.i("uploadForm"));
    Css.hide(Ink.i("createForm"));
    Css.hide(Ink.i("filterForm"));
    Css.hide(Ink.i("summaryBox"));

    new Ink.Net.Ajax("get/", { 
        method: 'GET',
        contentType: 'application/json',
        parameters : {id : id}, 
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
                }
                else {
                    showMessage("Error extracting record !");
                }
            }
        }
    }
    );   
}

function showUploadForm() {
    Css.show(Ink.i("uploadForm"));
    //Css.hide(Ink.i("updateForm"));
    Css.hide(Ink.i("createForm"));
    Css.hide(Ink.i("filterForm"));
    Css.hide(Ink.i("summaryBox"));

    document.getElementById('uploadIFrame').src = "form/?id=" + Ink.i("u__id").value;
}

function downloadFile() {
    document.getElementById('downloadIFrame').src = "download/?id=" + Ink.i("u__id").value;
}

function loadSummary() {

    var params = getFilterParams();

    if (Ink.i("summaryBox").style.display === "none") {
        new Ink.Net.Ajax("summary?", { 
            method: 'GET',
            contentType: 'application/json',
            parameters : params, 
            sanitizeJSON: true,
            onSuccess: function (response) {
                if (response.status === 200) {
                    Ink.i("summaryBox").innerHTML = new EJS({url: 'public/ejs/summary.html'}).render(response.responseJSON);
                } 
                else {
                    showMessage("Error loading summary data !");
                }
            }
        }
        );      
    }

    showHide("summary");
}

function showMessage(msg, callback, int) {
    int = int || 5000;

    Ink.i("msgBox").innerHTML = new EJS({url : 'public/ejs/message.html'}).render({"msg" : msg});

    setTimeout(function () {
        if (typeof callback === "function") {
            callback();
        }
        Ink.i("msgBox").innerHTML = "";
    }, int);
}

function userCreate() {

    if (!Ink.UI.FormValidator_1.validate(Ink.i("createForm"))) {
        return false;
    }

    new Ink.Net.Ajax("create/", {
        method: 'GET',
        contentType: 'application/json',
        parameters : Ink.Dom.FormSerialize.serialize("createForm"),
        sanitizeJSON: true,
        onSuccess: function (response) {
            if (response.status === 200) {
                var record = response.responseJSON;
                if (record.KO) {
                    showMessage("Error Creating the Record");
                }
                else {
                    filterTable();
                }
            }
        }
    }
    );
}

function userUpdate() { 

    if (!Ink.UI.FormValidator_1.validate(Ink.i("updateForm"))) {
        return false;
    }

    new Ink.Net.Ajax("update/", {
        method: 'GET',
        contentType: 'application/json',
        parameters : Ink.Dom.FormSerialize.serialize("updateForm"),
        sanitizeJSON: true,
        onSuccess: function (response) {
            if (response.status === 200) {
                var record = response.responseJSON;
                if (record.KO) {
                    showMessage("Error Updating the Record");
                }
                else { 
                    filterTable();
                }
            }
        }
    }
    );
}

function userDelete(id) { 
    var confirmed = confirm('Do you really want to delete the record?');

    if (!confirmed) {
        return false;
    }

    new Ink.Net.Ajax("delete/", {
        method: 'GET',
        contentType: 'application/json',
        parameters : {id : id}, 
        sanitizeJSON: true,
        onSuccess: function (response) {
            if (response.status === 200) {
                var record = response.responseJSON;
                if (record.KO) {
                    showMessage("Error Deleting the Record !");
                }
                else { 
                    filterTable();
                }                
            }
        }
    }
    );
}

function getFilterParams() {
    var filterParams = Ink.Dom.FormSerialize.serialize("filterForm"), params = "";

    for (var paramName in filterParams) {
        if (typeof filterParams[paramName] !== "undefined" && filterParams[paramName]) {
            params += "&" + paramName + "=" + filterParams[paramName];
        }
    }

    return params;
}

function filterTable2() {
    var params  = getFilterParams();
    table._getData("/list?" + params);
}

function filterTable() {

    var params  = getFilterParams();
    if (table) {
        table._pagination._element.innerHTML = "";
    }
    
    //recreate table
    initTable(params);
}

var table = "";

function initTable(params) {
    var tdOptions = { 
        "id" : {"class" : "hide-small"},
        "name" : "",
        "phone" : {"class" : "hide-small"},
        "skills" : {"class" : "hide-small"},
        "minutes"  : {"class" : "hide-small"},
        "status"  : {"class" : "hide-small hide-medium"},
        "date" : {"class" : "hide-small hide-medium"},
        "action" : {"class" : ""}
    },
    endpoint = "/list?" + (params || "");

    table = new Ink.UI.Table('.ink-table', {'endpoint' : endpoint, 'tdOptions' : tdOptions});
}

window.onload = function () { initTable(); };