// Chrome Storage Manager Global Var
var chromeManager = {
    add: function(obj, callback) {
        var varname = 'PostIt_' + parseInt(obj.postit.id, 10);
        var testPrefs = JSON.stringify(obj);
        var jsonfile = {};
        jsonfile[varname] = testPrefs;
        if(Object.size(jsonfile[varname]) >= chrome.storage.sync.QUOTA_BYTES_PER_ITEM) {
            callback("The note cannot be saved because the quota bytes per item is exceeded!\n\nQUOTA_BYTES_PER_ITEM: " + chrome.storage.sync.QUOTA_BYTES_PER_ITEM + "Bytes\nNOTE_SIZE: " + Object.size(jsonfile[varname]) + "Bytes");
        } else {
            chrome.storage.sync.set(jsonfile, function () {
                if(callback != null) callback("");
            });
        }
    },
    get: function(id, callback) {
        var varvalue;
        var varname = 'PostIt_' + parseInt(id, 10);
        //console.log('chromeManager.get', varname);
        chrome.storage.sync.get(null, function(retVal) {
            //Recover vars
            if(retVal[varname] !== undefined)
                varvalue = JSON.parse(retVal[varname]);
            else
                varvalue = "";
            if(callback != null) callback(varvalue);
        });
    },
    remove: function(varname, callback) {
        console.log('Remove',varname);
        varname = 'PostIt_' + parseInt(varname, 10);
        chrome.storage.sync.remove(varname, function() {
            //console.log('Removed',varname);
            if(callback != null) callback();
        });
    },
    removeDom: function(options, callback) {
        var len = -1;
        var iteration = 0;
        var finded = false;
        if(options === undefined || typeof options === "function") {
            callback = options;
            options = {
                domain : window.location.origin,
                page : window.location.pathname
            };
        }
        var domain = options.domain;
        var page = options.page;
        console.log('hola?', domain, page, $.fn.postitall.globals.filter);
        storageManager.getlength(function(len) {
            if(!len) {
                callback();
                return;
            }
            for (var i = 1; i <= len; i++) {
                storageManager.key(i, function(key) {
                    storageManager.getByKey(key, function(o) {
                        if(o != null) {
                            if($.fn.postitall.globals.filter == "domain")
                                finded = (getUrl(o.postit.domain) === getUrl(domain));
                            else if($.fn.postitall.globals.filter == "page")
                                finded = (getUrl(o.postit.domain) === getUrl(domain) && (o.postit.page === page || page === undefined));
                            else
                                finded = true;
                            console.log('finded', finded, o.postit.domain, domain);
                            if (finded) {
                                storageManager.remove(o.postit.id);
                            }
                        }
                        if(iteration == (len - 1) && callback != null) {
                            callback();
                            callback = null;
                        }
                        iteration++;
                    });
                });
            }
        });
    },
    clear: function(callback) {
      var len = -1;
      var iteration = 0;
      var finded = false;
      storageManager.getlength(function(len) {
          if(!len) {
              callback();
              return;
          }
          for (var i = 1; i <= len; i++) {
            storageManager.key(i, function(key) {
              storageManager.getByKey(key, function(o) {
                if(o != null) {
                    storageManager.remove(o.postit.id);
                }
                if(iteration == (len - 1) && callback != null) {
                    callback();
                    callback = null;
                }
                iteration++;
              });
            });
          }
      });
    },
    getlength: function(callback) {
        var total = 0;
        //console.log('chromeManager.getlength');
        chrome.storage.sync.get(null,function(data) {
            total = Object.keys(data).length;
            //console.log('chromeManager.getlength', total);
            callback(total);
        });
    },
    key: function (i, callback) {
        var varname = 'PostIt_' + parseInt(i, 10);
        chrome.storage.sync.get(null,function(retVal) {
            //console.log('chromeManager.key ' + varname, retVal);
            if(retVal[varname] !== undefined)
                callback(varname);
            else
                callback("");
        });
    },
    view: function () {
        console.log('view chrome');
        chrome.storage.sync.get(null,function(retVal) {
            console.log(retVal);
        });
    },
    getAll: function (callback) {
      var len = -1;
      var iteration = 0;
      var results = [];
      storageManager.getlength(function(len) {
          if(!len) {
              callback(results);
              return;
          }
          for (var i = 1; i <= len; i++) {
            storageManager.key(i, function(key) {
              storageManager.getByKey(key, function(o) {
                  results[o.postit.id] = o;
                  if(iteration == (len - 1) && callback != null) {
                      callback(results);
                      callback = null;
                  }
                  iteration++;
              });
            });
          }
      });
    }
};
