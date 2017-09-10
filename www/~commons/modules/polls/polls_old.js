
function resetPollList() {
    //start from empty to show
    lastPoll = 0;
    appCache.pollsList = [];
    $("#totalPolls span").html("");
    $("#totalPolls small").html("");
}

function loadDefault(callback) {
    window.allCountries = false;
    resetPollList();

    getUrlPolls(null, function () {
        //load country array 1st
        getCountryArray(function () {
            //load other country polls
            var haveCountry = loadCountryPolls();
            if (false === haveCountry) {
                loadScreenPolls();
            }
            if (callback) {
                callback();
            }
        });
    });
}

function loadCountryPolls() {
    console.log("loadCountryPolls");

    if ("undefined" == typeof userCountryArray || !userCountryArray) {
        return false;
    }

    var loaded = 0;
    for (var i = 0; i < window.userCountryArray.length; i++) {
        lastPoll = 0;
        var country = userCountryArray[i];
        getUrlPolls(country, function () {
            loaded++;
            console.log(loaded + "==" + userCountryArray.length);
            if (loaded == userCountryArray.length) {
                //show
                loadScreenPolls();
            }
        });
    }
}

function getUrlPolls(country, callback) {
    console.log("get polls from " + country);

    var upperCountry = null;
    if (country) {
        upperCountry = country.toUpperCase();
    }

    if (!appCache.urlPolls[upperCountry]) {
        appCache.urlPolls[upperCountry] = [];
    } else {
        listPolls(country);
        callback();
        return;
    }

    var _args = arguments;
    var url = settings.keysPath + "public/";

    if (country) {
        url += "~" + country.toLowerCase() + "/";
    }

    //ajax accurate response
    var xhr;
    var _orgAjax = jQuery.ajaxSettings.xhr;
    jQuery.ajaxSettings.xhr = function () {
        xhr = _orgAjax();
        return xhr;
    };

    console.log('url: ' + url);
    $.ajax({
        crossOrigin: true,
        url: url,
        success: function (data) {
            var full_domain = xhr.responseURL.split("/")
            full_domain.pop();
            console.log("full_domain: " + full_domain.join("/"));
            if (full_domain.join("/") != url) {
                callback();
                return;
            }

            var table = $(data).find("tr").slice(2);

            for (var i = 0; i < table.length; i++) {
                var tds = $(table[i]).find("td");
                var size = +tds.eq(3).text();

                //if is folder like
                if (!size) {
                    continue;
                }

                var key = tds.eq(1).text();
                if (key[0] == "_") {
                    continue;
                }
                var lastModified = tds.eq(2).text();

                //store apache list data
                var poll = [key, size, lastModified, url, country];
                console.log(poll);
                appCache.urlPolls[upperCountry].push(poll);
            }

            listPolls(country);
            callback();
        },
        cache: false
    }).fail(function (xhr, status, error) {
        //if trying read country folder maybe not exists
        if (country) {
            return;
        }
        //else main public folder change server
        if (alternative.keysPath && settings.keysPath != alternative.keysPath) {
            settings.keysPath = alternative.keysPath;
            getUrlPolls.apply(this, _args);
        } else {
            $("#polls").html("<span class='log'>" + transl("e_publicPolls") + "</span>");
        }
    });
}

function listPolls(country) {

//        for (var j = pollsList.length - 1; j >= 0; j--) {
//            if (pollsList[j] && pollsList[j][0] == key) {
//                pollsList.splice(j, 1);
//            }
//        }

    var upperCountry = null;
    if (country) {
        upperCountry = country.toUpperCase();
    }

    var pollsCount = appCache.urlPolls[upperCountry].length;
    for (var i = 0; i < pollsCount; i++) {
        var poll = appCache.urlPolls[upperCountry][i];

        //remove old
        for (var j = 0; j < appCache.pollsList.length; j++) {
            if (appCache.pollsList[j][0] == poll[0]) {
                appCache.pollsList.splice(j, 1);
                break;
                ;
            }
        }
        //add
        appCache.pollsList.push(poll);
    }

    $("#totalPolls").css("display", "inline-block");
    $("#totalPolls > span").html(transl("total") + ": " + appCache.pollsList.length);

    if (country && pollsCount) {
        var img = $("<img>");
        var src = "~img/flags/48/" + upperCountry + ".png"

        var id = "totalPolls_" + country.toLowerCase();
        $("#" + id).remove();
        var span = $("<span id='" + id + "'>");

        span.text(pollsCount);
        img.load(function () {
            span.append(img);
            span.append(",");
            $("#totalPolls small").append(span);

        }).error(function () {
            span.append(" " + country.toLowerCase() + ",");
            $("#totalPolls small").append(span);
        });
        img.attr("src", src);
    }

    //to edit this result use 'allCountries' value
    var func = showAll, text = "showAll";
    if (allCountries) {
        func = loadDefault, text = "showMine";
    }
    $("#showAll").text(transl(text));
    $("#showAll").off(".polls");
    $("#showAll").on("click.polls", function () {
        stopPollsRequests();
        func();
    });

    appCache.pollsList.sort(function (a, b) {
        //TODO last modified on [2] array not checked
        return b[1] - a[1];
    });
}

//load all countries
function showAll() {
    console.log("showAll");
    window.allCountries = true;

    if (appCache.publicPathTable) {
        done(appCache.publicPathTable);
        return;
    }

    //resetPollList(); //in stopPollsRequests
    var url = settings.keysPath + "public/";

    $.ajax({
        crossOrigin: true,
        url: url,
        success: function (data) {
            var trs = $(data).find("tr").slice(2);
            for (var i = 0; i < trs.length; i++) {
                var tds = $(trs[i]).find("td");
                trs[i] = {
                    name: tds.eq(1).text(),
                    date: tds.eq(2).text(),
                    size: tds.eq(3).text()
                };
            }
            console.log(trs)
            appCache.publicPathTable = trs;
            done(trs);
        },
        cache: false
    }).fail(function (xhr, status, error) {
        console.log(xhr.responseText);
    });

    function done(trs) {
        var loaded = 0;
        for (var i = 0; i < trs.length; i++) {

            var name = trs[i].name;
            console.log(name);
            if ("~" == name[0]) {
                var country = name.replace("~", "").replace("/", "");
                if (userCountryArray.indexOf(country.toUpperCase()) > -1) {
                    loaded++;
                    continue;
                }
                //console.log(country);
                getUrlPolls(country, function () {
                    loaded++;
                    if (loaded == trs.length) {
                        loadScreenPolls();
                    }
                });

            } else {
                loaded++;
                if (loaded == trs.length) {
                    loadScreenPolls();
                }
            }
        }
        console.log("DONE");
    }
}

function stopPollsRequests() {
    for (var i = 0; i < pollRequests.length; i++) {
        pollRequests[i].abort();
    }
    pollRequests = [];
    resetPollList();
}

function morePolls() {
    var pollsList = appCache.pollsList;
    // +5 polls
    var limit = lastPoll + 5;

    //console.log(lastPoll + " : " + pollsList.length)
    if (pollsList.length <= lastPoll) {
        return;
    }

    for (; lastPoll < pollsList.length; lastPoll++) {
        //limit
        if (lastPoll == limit - 1) {
            var poll = pollsList[lastPoll];
            getJson(poll, function () {
                checkEndPollScroll();
            });

            //add separator
            if (pollsList.length > limit) {
                $("#polls").append("<div class='numberPoll'>" + limit + "</div><hr/>");
            }

            lastPoll++;
            return;
        }

        var poll = pollsList[lastPoll];
        getJson(poll);
    }
}

function getJson(poll, callback) {

    if (!poll) {
        console.log("not poll on " + poll[0]);
        return;
    }

    var key = poll[0];
    var keyPath = poll[3];
    var country = poll[4];

    var keyPaths = getPathsFromRealKey(key, true, country);
    var keyId = keyPaths.keyId;

    //prevent duplicated id's
    if ($("#poll_" + keyId).length) {
        console.log("was defined: " + $("#poll_" + keyId).html());
        //pollError(keyId, transl("duplicatedKey") + ": " + keyId, true);
        return;
    }

    //add sorted poll
    $("#polls").append("<div id='poll_" + keyId + "' class='key'><img src='~commons/img/ajax-loader.gif'/></div>");

    // if was loaded
    if (appCache.downPolls[keyId]) {
        loadJsonPoll(keyPaths, country);
        return;
    }

    // jquery not allows overrideMimeType

    var xhr = new XMLHttpRequest();
    pollRequests.push(xhr);
    //allow cache every different day
    var url = keyPath + key;

    xhr.open('GET', url + "?nocache=" + getUrlCache(url));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                appCache.downPolls[keyId] = xhr.responseText;
                loadJsonPoll(keyPaths, country);
                if (callback) {
                    callback();
                }
            } else {
                console.log(keyId + " key error");
            }
        }
    };
    // important 4 accents and, ñ, etc..
    xhr.overrideMimeType('text/plain; charset=ISO-8859-1');
    xhr.send();
}

//let any country load
var canvasWith = null;
function loadJsonPoll(keyPaths, country) {
    var keyId = keyPaths.keyId;

    console.log("keyId = " + keyId + "; country = " + country)
    var data = appCache.downPolls[keyId];
    data += "]";
    var error = "";

    var arr;
    try {
        arr = JSON.parse(data);
    } catch (e) {
        console.log("can't parse: " + data + " on key " + keyPaths.key + "; country " + country);
        error = "error on get data";
        //return;
    }

    //and translate
    var obj = toObject(arr);
    if (!obj) {
        pollError(keyId, "wrong data");
        return;
    }

    //static total width
    var totalWidth = $("#pollsPage").width();
    $("#poll_" + keyId).css("max-width", totalWidth);

    var countryISO = country;
    if (!countryISO) {
        countryISO = "World";
    }

    var countryName = getCountryName(countryISO, userLanguage);
    var onerror = "country='" + countryName + "' onerror='imageNotFound(this)'";
    var imgFlag = "<img src='~img/flags/48/" + countryISO.toUpperCase() + ".png' " + onerror + " title='" + countryName + "'/>";

    $("#poll_" + keyId).html("<div class='info'>"
            + "<div class='key'>"
            + "<div>" + keyId.toLowerCase() + "</div>"
            + "<p class='flag'>" + imgFlag + "</p>"
            + "</div>"
            + "</div>"
            //
            + "<div class='canvas'></div>");

    $("#poll_" + keyId + " .flag").click(function () {
        stopPollsRequests();
        getUrlPolls(country, function () {
            loadScreenPolls();
        });
        //like showing by countries
        allCountries = true;
    });

    if (error) {
        $("#poll_" + keyId).addClass("error");
        $("#poll_" + keyId + " .canvas").text(error);
        return;
    }

    if (!canvasWith) {
        canvasWith = $("#poll_" + keyId + " .canvas").width() - 10 - 17; //borders and scroll-bar
        console.log("canvas width = " + canvasWith);
    }

    getCanvasImage("#poll_" + keyId + " .canvas", obj, keyId, canvasWith, "list", function (canvas) {
        //wait canvas load to specify poll height on click
        var simpleUrl = settings.appPath + "/" + keyId;
        clickablePoll("#poll_" + keyId + " .canvas", keyId, simpleUrl);
    });

    if (arr[2]) {
        var link = arr[2].link;

        if (link) {
            var linkUrl, text;
            if (link.substr(4) == "http") {
                linkUrl = link;
                text = link.split("//").pop();
            } else {
                linkUrl = "http://" + link;
                text = link;
            }

            $("#poll_" + keyId).append("<a href='" + linkUrl + "'>" + text + "</a>");
        }
    }
}

function imageNotFound(image) {
    var country = $(image).attr("country");
    $(image).replaceWith(country);
}

function pollError(key, error, append) {
    var html = "<div class='info'><div class='key'><div>" + key + "</div></div></div>"
            + "<div class='canvas'>" + error + "</div>"
    if (append) {
        $("#polls").append("<div class='error'>" + html + "</div>");
    } else {
        $("#poll_" + key).html(html);
        $("#poll_" + key).addClass("error");
    }
}

$(window).on("scroll.temp", function () {
    checkEndPollScroll();
});

function checkEndPollScroll() {
    if ((window.innerHeight + window.scrollY) >= $(document).height() - 10) {
        morePolls();
    }
}

function getDocumentHeight() {
    return Math.max(
            Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
            Math.max(document.body.offsetHeight, document.documentElement.offsetHeight),
            Math.max(document.body.clientHeight, document.documentElement.clientHeight)
            );
}

function loadScreenPolls() {
    console.log("loadScreenPolls");
    //first polls load - restart
    $("#polls").html("");
    lastPoll = 0;
    morePolls();
}
