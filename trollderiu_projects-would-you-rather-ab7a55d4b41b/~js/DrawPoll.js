
function DrawPoll(values) {
    for (var key in values) {
        this[key] = values[key];
    }

    this.style = {};
    if ("object" === typeof this.obj.style) {
        this.style = this.obj.style;
    }
    this.question = this.obj.question;
    this.options = this.obj.options;

    this.maxOptions = 4; //for twitter mobile visualization
}

DrawPoll.prototype.drawCanvas = function (callback) {
    var w = this.width;

    //LOAD INFO:
    var opts = this.options;
    var url = this.url;
    var country = this.country;

    //LOAD SYLE
    for (var key in window.defaultStyle) {
        if (!this.style[key]) {
            this.style[key] = window.defaultStyle[key];
        }
    }

    //START CANVAS
    this.draw = new Draw(w);
    this.ctx = this.draw.ctx;
    this.canvas = this.draw.canvas;

    //cast before drawOption loop
    this.totalVotes = 0;
    for (var i = 0; i < opts.length; i++) {
        this.totalVotes += +opts[i][2];
    }

    this.y_all = this.width * 0.016;

    //BACKGROUND
    this.draw.background(this.style.backgroundColor.toString());

    //OPTIONS SQUARES:
    var width_all = w / 2 - 8;
    var height_all = w * 0.4 - 5;

    var x_red = 5;
    var x_blue = 3 + w / 2;

    var top = w * 0.016;
    this.draw.optionSquare(x_red, top, width_all, height_all, this.style.color1.toString());
    this.draw.optionSquare(x_blue, top, width_all, height_all, this.style.color2.toString());

    //OWNER
    this.style.owner = "prueba"
    if (this.style.owner) {
        this.draw.owner(this.style.owner, w / 24, this.style.questionColor.toString());
        this.h += parseInt(w / 17);
    }

    //OPTIONS (HEIGHT CALCULATION)
    for (var i = 0; i < opts.length; i++) {
        //limit options on image
        if (i == this.maxOptions) {
            break;
        }
        var name = opts[i][1];
        var val = opts[i][2];
        this.drawOption(name, val, i, "LeagueGothic");
        this.h += w / 12; //50
    }

    // 'more'
    if (this.maxOptions < this.options.length) {
        this.draw.more();
    }
    
    if (!this.show) {
        this.draw.clickHere("Hand");
    }

    var margin = w / 70;
    //footer last -> be sure url is visible
    var _this = this;
    this.draw.footer(url, margin, margin * 0.7, country, function () {
        //w8 canvas footer images..
        callback(_this.canvas);
    });
};

DrawPoll.prototype.drawOption = function (optionName, value, pos, font) {
    //console.log(optionName + " : " + value);
    var ctx = this.ctx;
    var w = this.width;

    if (this.obj.users && this.obj.users[window.user.id]) {
        var userVotes = this.obj.users[window.user.id][1];
        if ("undefined" !== typeof userVotes && "" !== userVotes) {
            this.show = true;
        } else {
            //console.log("NOT USER IN POLL: '" + window.user.id + "'");
        }
    }

    var percent = 0;
    if (this.totalVotes) {
        percent = value / this.totalVotes;
    }

    //not add percent background on 100%
    if (percent != 0 && percent != 1 && this.show) {
        //background        
        var y = this.y_all;
        var height = w / 2.39 - 15;
        var width = w / 2 - 8;

        //OPTION GRADIENTS
        if (pos == 0) {
            this.draw.gradient(percent, 5, y, width, height, "0,0,0");
        } else {
            this.draw.gradient(percent, 3 + w / 2, y, width, height, "0,0,0");
        }
    }

    //text
    ctx.textAlign = "center";
    ctx.font = parseInt(w / 17) + "px " + font;
    optionName = decode_uri(optionName);
//    optionName = optionName.split("").join(String.fromCharCode(8202)); //this cause bad width calculations on multiple-line text!!

    var left = 0;
    if (pos == 0) {
        left = w / 4;
    } else {
        left = w / 2 + w / 4;

    }
    left += 2;

    var top = this.y_all;
    if (!this.totalVotes || !this.show) {
        top += w * 0.2;
    } else {
        top += w * 0.17;
    }
    var maxWidth = parseInt(w / 2 - 10);

    ctx.font = parseInt(w / 17) + "px " + font;
    ctx.textAlign = "center";
    this.draw.option(optionName, left, top, this.style.textColor.toString(), maxWidth);

    // STATS:
    if (!this.totalVotes || !this.show) {
        return;
    }

    this.draw.percentage(percent, left, this.y_all + w * 0.31, this.style.percent.toString());

    var textValue = transl("Votes") + ": " + formatNumber(value);
    ctx.textBaseline = "bottom";
    ctx.font = parseInt(this.width / 28) + "px LeagueGothic";
    this.draw.votes(textValue, left, this.y_all + w * 0.36, "gainsboro");

    //CHECK:  
    if (this.obj.users && this.obj.users[window.user.id] && this.obj.users[window.user.id][1] === pos) {
        this.check(left);
    }
};

DrawPoll.prototype.check = function (left) {
    var ctx = this.ctx;
    ctx.beginPath();
    var def = ctx.textBaseline;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "200px FontAwesome";
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    var check_char = String.fromCharCode(parseInt("f00c", 16));
    ctx.fillText(check_char, left, parseInt(this.y_all + this.width * 0.19));

    //reset:
    ctx.textBaseline = def;
};
