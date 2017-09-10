
//globals
var canvas, ctx;

//ON CREATE ONLY!
function getUserArray(user, style) {
    if (empty(user)) {
        console.log("[" + window.user.id + ", '']");
        return [window.user.id, ""];
    }
    console.log("user: '" + JSON.stringify(user) + "'");

    var arr = [user.id, user.vt];
    //like name on private polls    
    //needs to be defined in defaultStyle because is array type stored (not by attr)
    if (style && style.extraValues) {
        for (var i = 0; i < style.extraValues.length; i++) {
            var key = style.extraValues[i];
            if (user[key]) {
                arr.push(user[key]);
            } else {
                arr.push("");
            }
        }
    }

    return arr;
}

function pollToCSV(obj) {
    if(!obj.options){
        return;
    }
    
    var style = window.screenPoll.style;
    if (!style) {
        style = {};
    }
    if (!obj.style) {
        obj.style = style;
        if (!obj.style) {
            obj.style = {};
        }
    }
    if (window.user && window.user.nm) {
        obj.style.owner = window.user.nm;
    }

    //remove default styles
    for (var key in obj.style) {
        if (obj.style[key] == window.defaultStyle[key]) {
            delete obj.style[key];
        }
    }

    if (!obj.question) {
        obj.question = "";
    }

    var options_obj = obj.options;
    var options = [];
    for (var i = 0; i < options_obj.length; i++) {
        if (options_obj[i] && options_obj[i][1]) {
            options.push(options_obj[i][1]);
        } else {
            options.push(options_obj);
        }

    }

    var style = JSON.stringify(obj.style);
    var arr = [obj.question, JSON.stringify(options), style];

    //add user ony if is voting
    var user = getUserArray(window.user, screenPoll.style);
    if (user.vt) {
        user = JSON.stringify(user);
        arr.push(user);
    }

    //like so: [arr,[1,2]]
    var csv = CSV.stringify([arr]);
    console.log("csv: " + csv);
    return csv;
}

//function parseData(value, ignore) {
//    //data errors
//    if (!value) {
//        if (!ignore) {
//            error("e_votationRemoved");
//            reset();
//        }
//        return false;
//    }
//    //not tested rule
//    else if ("null" == value) {
//        if (!ignore) {
//            error("e_connectionLost");
//            reset();
//        }
//        return false;
//    }
//
//    var arr;
////    try {
//    //arr = JSON.parse(value + "]");
//    arr = CSV.parse(value);
////    } catch (e) {
////        console.log(e + " on " + value);
////        //error("e_votationWithErrors", true);
////        return false;
////    }
//    return toObject(arr);
//}

function toObject(arr) {
    console.log(JSON.stringify(arr));
    if (!$.isArray(arr)) {
        console.log("NOT ARRAY on " + JSON.stringify(arr));
        return false;
    }

    var question = arr.shift();
    var options_arr = arr.shift();
    if (!options_arr || !options_arr.length) {
        console.log("!options_arr || !options_arr.length");
        return false;
    }

    var style = arr.shift();

    var users = {};
    for (var i = 0; i < arr.length; i++) {
        var user = arr[i];
        users[user[0]] = user;
    }

    var obj = {
        question: question,
        style: style,
        users: users
    };
    parseOptions(obj, options_arr);

    return obj;
}

function parseOptions(obj, opts) {
    var usrs = obj.users;

    //STORE VALID OPTIONS
    var optionsResult = [];
    for (var i = 0; i < opts.length; i++) {
        if (!opts[i]) {
            break;
        }
        optionsResult.push([
            i, //position
            opts[i], //name
            0 //value
        ]);
    }

    //server pre calculated
    if (usrs && usrs[1] && "done" == usrs[1]["calc"]) {
        for (var i = 0; i < optionsResult.length; i++) {
            var res = usrs[1][i];
            if (!res) {
                res = 0;
            }
            optionsResult[i][2] = res;
        }
        if (usrs[1]["vt"]) {
            obj.users[window.user.id][1] = usrs[1]["vt"];
        }

    } else {
        //COUNT VOTES
        for (var id in usrs) {
            if (!usrs[id][1] && 0 !== usrs[id][1]) {
                console.log(usrs[id]);
                continue;
            }

            var arr = voteArray(usrs[id][1]);
            for (var i = 0; i < arr.length; i++) {
                var option = arr[i];
                //if invalid option
                if (!optionsResult[option]) {
                    continue;
                }
                optionsResult[option][2]++;

                //if only alows 1 vote, break after 1st vote
                if (!obj.style || !obj.style.multipleChoice) {
                    break;
                }
            }
        }
    }

    //SORT
    //if (optionsResult.length > 2) { //more than 2 options // WHY? (how to bold highter option?)
    //optionsResult = sortOptions(optionsResult);
    //}
    //console.log(optionsResult)
    obj.options = optionsResult;
}

function sortOptions(optionsResult) {
    optionsResult.sort(function (a, b) {
        //if not value difference, sort by original creator position! 
        return b[2] - a[2] || a[0] - b[0];
    });
    //}
    //console.log(optionsResult)
    return optionsResult;
}

function hidePollEvent(query, reducedHeight) {
    //let polls hide first
    setTimeout(function () {
        //ONE
        $(document).one("click", function (e) {
            if (!$(e.target).closest(query).length) {
                $(query).addClass("hidden");
                $("#polls .image").css("max-height", reducedHeight);
            }
        });
    }, 1);
}

function voteArray(arr) {
    if (null == arr || "undefined" == typeof arr) {
        return [];
    }

    if ("object" != typeof arr) {
        if (arr || 0 === arr) {
            arr = [arr];
        } else {
            arr = [];
        }
    }

    for (var i = arr.length - 1; i > -1; i--) {
        var value = arr[i];
        if (isNaN(value)) {
            arr.splice(i, 1);
        }
    }

    return arr;
}
