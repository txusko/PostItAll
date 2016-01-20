const SERVER_URL = "../dist/noteController.php";

var guid = function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
}

// Cookies
function createCookie(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else var expires = "";

    //var fixedName = '<%= Request["formName"] %>';
    //name = fixedName + name;

    document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

var getJsonRequest = function(params, callback) {

    var iduser = readCookie("iduser");
    if(iduser == null) {
        iduser = guid();
        createCookie("iduser", iduser, 365);
    }

    $.ajax({
        url: SERVER_URL + "?iduser=" + iduser, // + "&format=json",
        data: params,
        error: function(data) {
            console.log('An error has occurred', data);
        },
        success: function(data) {
            //console.log(data.message);
            if(data.status == "success") {
                if(callback != null) callback(data.message);
            } else {
                alert('An error has occurred' + data);
                if(callback != null) callback(null);
            }
        },
        type: 'POST'
    });

};

// External Storage Manager via AJAX
var externalManager = {
    test: function(callback) {
        getJsonRequest("option=test", function(retVal) {
            if(retVal !== null) {
                callback(true);
            } else {
                callback(false);
            }
        });
    },
    add: function(obj, callback) {
        var varname = 'PostIt_' + parseInt(obj.id, 10);
        var testPrefs = encodeURIComponent(JSON.stringify(obj));
        //console.log('add', varname, testPrefs);
        getJsonRequest("option=add&key=" + varname + "&content=" + testPrefs, callback);
    },
    get: function(id, callback) {
        var varvalue;
        var varname = 'PostIt_' + parseInt(id, 10);
        getJsonRequest("option=get&key=" + varname, function(retVal) {
            try {
                varvalue = JSON.parse(retVal);
            } catch (e) {
                varvalue = "";
            }
            if(callback != null) callback(varvalue);
        });
    },
    remove: function(varname, callback) {
        //console.log('Remove',varname);
        varname = 'PostIt_' + parseInt(varname, 10);
        getJsonRequest("option=remove&key=" + varname, callback);
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
        var t = this;
        //console.log('hola?', domain, page, $.fn.postitall.globals.filter);
        t.getlength(function(len) {
            if(!len) {
                callback();
                return;
            }
            for (var i = 1; i <= len; i++) {
                t.key(i, function(key) {
                    t.getByKey(key, function(o) {
                        if(o != null) {
                            if($.fn.postitall.globals.filter == "domain")
                                finded = (getUrl(o.domain) === getUrl(domain));
                            else if($.fn.postitall.globals.filter == "page")
                                finded = (getUrl(o.domain) === getUrl(domain) && (o.page === page || page === undefined));
                            else
                                finded = true;
                            //console.log('finded', finded, o.domain, domain);
                            if (finded) {
                                t.remove(o.id);
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
      var t = this;
      t.getlength(function(len) {
          if(!len) {
              callback();
              return;
          }
          for (var i = 1; i <= len; i++) {
            t.key(i, function(key) {
              t.getByKey(key, function(o) {
                if(o != null) {
                    t.remove(o.id);
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
        getJsonRequest("option=getlength", function(total) {
            callback(total);
        });
    },
    key: function (i, callback) {
        i--;
        getJsonRequest("option=key&key="+i, function(retVal) {
            console.log('chromeManager.key ' + i, retVal);
            if(retVal)
                callback(retVal);
            else
                callback("");
        });
    },
    view: function () {
        console.log('view chrome');
        getJsonRequest("option=getByKey&key="+key, function(retVal) {
            console.log(retVal);
        });
    },
    getByKey: function (key, callback) {
          if (key != null && key.slice(0,7) === "PostIt_") {
              key = key.slice(7,key.length);
              getJsonRequest("option=getByKey&key="+key, callback);
          } else {
              if(callback != null) callback(null);
          }
    },
    getAll: function (callback) {
        getJsonRequest("option=getAll", callback);
    }
};
