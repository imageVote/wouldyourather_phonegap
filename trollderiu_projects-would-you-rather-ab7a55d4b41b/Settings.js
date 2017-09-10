
//http://stackoverflow.com/questions/118884/how-to-force-browser-to-reload-cached-css-js-files
//add ?version='' after settings.js to update on all cached clients


var Settings = function () {
    //NEEDS:

    //settings.appName = "Would you Rather";

    //settings.app_package = "at.wouldyourather"; //package is a js reserved word
    //settings.androidURL = "https://play.google.com/store/apps/details?id=" + this.app_package;
    //settings.iosURL = "https://itunes.apple.com/us/app/would-you-rather-friends/id1226455878";

    //settings.imagesURL = "images.would-you-rather.tk";

    this.load();
};

//settings.load("wouldyourather.co");
Settings.prototype.load = function (defaultAppPath, corePath) {
    //if developement in builder
//    if("would-you-rather-builder.tk" == location.host){
//        corePath = defaultAppPath;
//    }

    if (!defaultAppPath) {
        console.log("ERROR: not defaultAppPath");
        return;
    }
    this.appPath = defaultAppPath;
    
    //LOCALHOST TESTING:
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
        var arr_path = location.pathname.split("/~")[0].split("/");
        arr_path.pop();
        this.appPath = location.host + arr_path.join("/");
    }

    this.urlPath = "http://" + this.appPath;
    this.corePath = "http://" + corePath + "/core/";
//    this.keysPath = "http://keys." + this.appPath + "/";    
//    this.keysPath = this.urlPath + "/core/data/";

    this.loadSharedUrl(this.appPath);
};

//TODO: from Language()
Settings.prototype.loadSharedUrl = function (url) {
    //TODO:
    var pathArray = url.split("www.");
    this.sharePath = pathArray[pathArray.length - 1];
};
