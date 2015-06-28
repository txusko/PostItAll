// localStorage Manager
var $localStorage = window.localStorage;

var localManager = {
    add: function (obj, callback) { 
        var varname = 'PostIt_' + parseInt(obj.postit.id, 10);
        var testPrefs = JSON.stringify(obj);
        $localStorage.setItem(varname, testPrefs);
        //console.log('Saved', varname, testPrefs);
        if(callback != null) callback();
    },
    get: function (id, callback) { 
        var varname = 'PostIt_' + parseInt(id, 10);
        var varvalue = $localStorage.getItem(varname);
        if(varvalue != null)
            varvalue = JSON.parse(varvalue);
        else
            varvalue = "";
        //console.log('Loaded', varname, varvalue);
        if(callback != null) callback(varvalue);
    },
    remove: function (id, callback) { 
        $localStorage.removeItem('PostIt_' + id);
        if(callback != null) callback();
    },
    clear: function (callback) { 
        $localStorage.clear();
        if(callback != null) callback(); 
    },
    getlength: function (callback) {
        callback($localStorage.length); 
    },
    key: function (i, callback) {
        var name = $localStorage.key(i);
        callback(name);
    }
};

function getStorageManager() {
    return localManager;
}