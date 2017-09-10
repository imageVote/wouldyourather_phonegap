
//poll url loading
$(document).ready(function () {
    setTimeout(function () {
        var keyId;
        var poll;

        //can't find url from device!
        if (window.screenPoll && "#polls" != location.hash) {
            poll = screenPoll;
            keyId = poll.key;
        } else {
            poll = new LoadedPoll("GamePoll");
            console.log("!screenPoll in GamePoll setTimeout");
        }

        if (!keyId) {
            console.log("!keyId");
            return;
        }
        
        var parse = false;
        var only = ["en", "es", "pt", "it", "fr", "de"];
        var lang = keyId.split("_")[0];
        if (only.indexOf(lang) > -1) {
            parse = true;
        }

        console.log("GamePoll setTimeout " + keyId);
        var urlParts = getPathsFromKeyId(keyId);
        console.log(urlParts);

        if ("_" == urlParts.symbol) {
            console.log("'_' detected as GamePoll");
            window.gamePoll = new GamePoll("#pollsPage", keyId, parse);
            //$("html").removeClass("withoutHeader");
            $("#body").addClass("pollsView");
        }
    }, 1);
});

var GamePoll = function (query, keyId, parse) {
    console.log("GamePoll() " + keyId);
    this.parse = parse;

    this.coreSelect = "select.php";
    if (parse) {
        this.coreSelect = "parseSelect.php";
    }

    this.construct(query, keyId);
};

GamePoll.prototype.parsePolls = function (obj) {
    console.log(obj);
    var polls = [];
    
    if (this.parse) {
        if (!obj.results) {
            var err = "error !polls.results";
            console.log(err);
            return err;
        }

        var arr = obj.results;

        for (var i = 0; i < arr.length; i++) {
            polls.push({
                //key: arr[i].objectId,
                id: arr[i].idQ,
                a0: arr[i].first,
                a1: arr[i].second,
                v0: arr[i].first_nvotes,
                v1: arr[i].second_nvotes
            });
        }

    } else { 
        //parse
        for (var i = 0; i < obj.length; i++) {
            var row = obj[i];
            var data = row.data;
            var res = CSV.parseFirst(data);
            //all[row.id] = [row.id, row.id, res[1][0], res[1][1], row.answer0, row.answer1];
            //var key = keyId(row.id, );
            
            polls.push({
                //key: key,
                id: row.id,
                t: row.timestamp,
                a0: res[1][0],
                a1: res[1][1],
                v0: row.v0 || 0,
                v1: row.v1 || 0
            });
        }
    }

    return polls;
};


//DEVICE CALLBACK FUNCTION:
GamePoll.prototype.game_configCallback = function (json) {
    var data;
    if ("string" == typeof json) {
        try {
            data = JSON.parse(json);
        } catch (e) {
            console.log(json);
            console.log(e);
            return;
        }
    } else {
        data = json;
    }
    console.log("game_configCallback " + json);

    for (var key in data) {
        window[key] = data[key];
    }
};

//
extend(GamePoll, window.Polls);
