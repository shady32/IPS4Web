var map, uid, psd;
var Err;
var pomelo = window.pomelo;
var CallType;
var lists = new Array();
$(document).ready(function () {
    //wait message from the server.
    pomelo.on('onChat', function (data) {
        addMessage(data.from, data.target, data.msg);
    });

    //update user list
    pomelo.on('onAdd', function (data) {
        var user = data.user;
        // tip('online', user);
        //addUser(user);
    });

    //update user list
    pomelo.on('onLeave', function (data) {
        var user = data.user;
        //tip('offline', user);
        //removeUser(user);
    });


    //handle disconect message, occours when the client is disconnect with servers
    pomelo.on('disconnect', function (reason) {
        alert(reason);
        window.location.href("about:blank");
    });

    uid = getUrlParam("uid");
    map = getUrlParam("map");
    psd = getUrlParam("psd");
    CheckLogin();

});
var _mapres;
function addMessage(from, target, text, time) {
    if (typeof (_mapres) == "undefined") {
        _mapres = eval('(' + text + ')');
    }
    else {
        var _text = text.split("$");
        try {
            delegate(_text[0], _text[1], _text[2], _text[4], _text[3], _text[5], _text[6], _text[7], _text
[8]);
        }
        catch (e) {
            lists.push(_text);
            cc.log(e);
        }
    }
}

//获取URL参数
function getUrlParam(name) {
    var reg = new RegExp("[?&]" + name + "=([^?&]*)[&]?", "i");
    var match = location.search.match(reg);
    return match == null ? "" : match[1];
}

//Check uid&psd,find map
function CheckLogin() {

    if (uid == "" || psd == "" || map == "") {
        this.Err = "Error Param";
        return;
    }
    if (Permission(uid, psd, map)) {
        queryEntry(uid, function (host, port) {
            pomelo.init({
                host: host,
                port: port,
                log: true
            }, function () {
                var route = "connector.entryHandler.enter";
                pomelo.request(route, {
                    username: uid,
                    rid: map
                }, function (data) {
                    if (data.error) {
                        return;
                    }
                    initLocation(data)
                });
            });
        });
    }
    else {
        this.Err = "Error Permission";
    }
}

//Check Permission
function Permission(uid, psd, map) {
    return true;
}

// query connector
function queryEntry(uid, callback) {
    var route = 'gate.gateHandler.queryEntry';
    pomelo.init({
        host: window.location.hostname,
        port: 3014,
        log: true
    }, function () {
        pomelo.request(route, {
            uid: uid
        }, function (data) {
            //pomelo.disconnect();
            if (data.code === 500) {
                return;
            }
            callback(data.host, data.port);
        });
    });
};

// init user list
function initLocation(data) {

};

