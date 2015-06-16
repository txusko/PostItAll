// chrome storage Manager
var chromeManager = {
    add: function(obj, callback) {
        var varname = 'PostIt_' + parseInt(obj.id, 10);
        var testPrefs = JSON.stringify(obj);
        var jsonfile = {};
        jsonfile[varname] = testPrefs;
        chrome.storage.sync.set(jsonfile, function () {
            console.log('Saved', varname, testPrefs);
            if(callback != null) callback();
        });
    },
    get: function(id, callback) {
        var varvalue;
        var varname = 'PostIt_' + parseInt(id, 10);
        chrome.storage.sync.get(null, function(retVal) {
            //Recover vars
            if(retVal[varname] !== undefined)
                varvalue = JSON.parse(retVal[varname]);
            else
                varvalue = "";
            console.log('Loaded', varname, varvalue);
            if(callback != null) callback(varvalue);
        });
    },
    remove: function(varname, callback) {
        chrome.storage.sync.remove(varname, function() {
            console.log('Removed',varname);
            if(callback != null) callback();
        });
    },
    clear: function(callback) {
        chrome.storage.sync.clear(function() {
            console.log('Clear chrome storage');
            if(callback != null) callback();
        });
    },
    getlength: function(callback) {
        var total = 0;
        chrome.storage.sync.get(null,function(data) {
            total = Object.keys(data).length;
            console.log('Chrome storage length ' + total);
            if(callback != null) callback(total);
        });
    },
    key: function (i, callback) {
        //var name = $localStorage.key(i);
        //callback(name);
    }
};

function getStorageManager() {
    return chromeManager;
}