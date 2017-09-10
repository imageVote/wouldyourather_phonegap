
var Save = function (poll, $imageDOM, doneCallback, failCallback) {
    console.log("Save()");
    console.log(poll);
    this.poll = poll;
    this.$imageDOM = $imageDOM;
    this.doneCallback = doneCallback;
    this.failCallback = failCallback;
};

Save.prototype.do = function (callback, andShare, add) {
    var _this = this;
    var poll = this.poll;
    console.log(this.poll);

    //CHECK USER NAME
    if (!poll.key || !poll.key.split("_").length) { //if private poll
        //name is mandatory for prevent troll's confusion votes, and disagree results
        var inputName = $("#userNamePoll").val() || localStorage.getItem("userName");
        
        if (inputName) {
            updateUserName(inputName);

        } else if (!this.$imageDOM.find(".publicCheckbox.publicCheck").length) {
            modalBox.input(transl("myName"), "", function (val) {
                updateUserName(val);
                _this.do(callback, andShare, add);
            });
            return;
        }
    }

    //save before to solve any bug: (this can lost user vote)
    _this.saveLocally(add);
    this.andShare = andShare;

    //before change anything
    //if existing votation is public
    console.log("saving key: '" + poll.key + "'");
    if (window.Device && poll.key) {
        if ("_" == poll.key[0]) { //error
            notice(poll.key);

        } else if (!poll.key[0] == "-") { //not private key
            console.log("not private key: " + poll.key);
            //if create poll
            if (!window.publicId) {
                this.notSave(2);

                //can't save votation if not publicId is working
                console.log("ASKING PHONE " + poll.key);
                askPhone();

                //stop
                if (callback) {
                    callback(false);
                }
                return;
            }

            poll.isPublic("true");
            //remove old not-public user
            if (window.phoneId && poll.obj.users[phoneId]) {
                delete poll.obj.users[phoneId];
            }
        }
    }

    //update before ask phone
    var sendJson = pollToCSV(poll.obj);
    if (!sendJson) {
        console.log("ERROR: !sendJson");
        console.log(poll);
        return;
    }

    //is shared before
    if (this.lastSendJson == sendJson) {
        _this.saveCallback();
        return;
    }

    this.lastSendJson = sendJson;
    this.saveEventCallback = callback;

    this.post(sendJson, add);

    //if new
    $("#image").remove();
    var votes = poll.obj.users[window.user.id][1];
    saveDefaultValues(votes);
};

//device calls:
Save.prototype.saveCallback = function (id) {
    console.log("saveCallback " + id);

    if (id) {
        var lang = this.lang();
        var key = keyId(id, lang);
        this.poll.key = key;
    }

    //remove any stored cache
    if (this.poll.key) {
        var urlParts = getPathsFromKeyId(this.poll.key);
        var url = urlParts.realPath + urlParts.realKey;
        //1 DAY with no cache (don't do less, older file could will be cached!)
        var cacheTimeout = (new Date()).getTime() + 86400000;
        localStorage.setItem(url, cacheTimeout);

        if (this.saveEventCallback) {
            this.saveEventCallback();
        }
    }

    //if (this.$sendButton.hasClass("saveAndShare")) {
    if (this.$imageDOM && this.andShare) {
        new Share(this.poll, this.$imageDOM).do();

    } else {
        loaded();
    }
};

Save.prototype.post = function (sendJson, add) {
    var _this = this;

    var params = "userId=" + window.user.id
            + "&data=" + sendJson;

    //on update:    
    if (this.poll.key) {
        var id = idKey(this.poll.key, "Save.post");
        params += "&id=" + id;
    }
    if (add) {
        params += "&add=" + JSON.stringify(add);
    }

    var table = this.lang();
    if (table) {
        params += "&table=" + table.toLowerCase();
    }

    var request = "add.php";
    var callback = "saveCallback";
    if (!Device.simpleRequest) {
        $.post(settings.corePath + request, params, function (res) {
            _this[callback](res);
        }).error(function (res) {
            _this.ajaxError(res);
        });

    } else {
        var global = "saveClass_" + table;
        window[global] = this;
        Device.simpleRequest(request, params, global + "." + callback);
    }
};

Save.prototype.lang = function () {
    var lang;
    if (this.$imageDOM && this.$imageDOM.find(".publicCheckbox.publicCheck").length) {
        lang = localStorage.getItem("userLang");
        flash(transl("pollWillVisible")); //tell user has to wait for next 'sql_sort'
    }

    if (this.poll.key && this.poll.key.split("_").length > 1) {
        lang = this.poll.key.split("_")[0];
    }

    return lang;
};

Save.prototype.ajaxError = function (res) {
    error(res + " (can't connect with ajax)", true);
    error("votationNotSaved");
};


Save.prototype.notSave = function (why) {
    console.log("VotationButtons.notSave: " + why);
    if (this.failCallback) {
        this.failCallback();
    }
};

Save.prototype.saveLocally = function (votes) {
    var key = this.poll.key;
    if (!key) {
        console.log("!key yet");
        return;
    }
    if (key.split("_").length > 1) {
        console.log("not save language game polls");
        return;
    }

    var obj = this.poll.obj;

    //DEPRECATED (if users is array and not object): WARNING WHEN REMOVE THIS!
    if ($.isEmptyObject()) {
        obj.users = {};
        //re-fill users
        if (votes) {
            obj.users[window.user.id] = getUserArray();
            obj.users[window.user.id][1] = votes;
        }
    }

    console.log("saveLocally " + key + ": " + JSON.stringify(obj));
    if (!key) { //check is correct stores query     
        console.log("WRONG KEY TO STORE: " + key);
        return;
    }

    localStorage.setItem("key_" + key, JSON.stringify(obj));
};
