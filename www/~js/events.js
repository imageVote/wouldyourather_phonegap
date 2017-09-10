
require(["custom_dependencies"], function () {

    //@Overwrite
    VotationButtons.prototype.sendButtonEvent = function () {
        var _this = this;
        console.log("VotationButtons.sendButtonEvent");

        if (!window.Device) {
            shareIntent.checkShareEnvirontment(this.$sendButton);
        }
        this.$sendButton.click(function (e) {
            //prevent double tap save and share ?
            e.stopPropagation();

            // EMPTY OPTIONS
            var options_div = _this.$votation.find(".option_text");
            var options = [];
            for (var i = 0; i < options_div.length; i++) {
                var text = $(options_div[i]).text();
                if ("" == text) {
                    e.preventDefault(); //too late :(
                    flash(transl("min2Options"));
                    return;
                }
                options.push(text);
            }

            // DUPLICATED OPTIONS
            var sorted = options.sort();
            for (var i = 0; i < sorted.length; i++) {
                if (sorted[i + 1] == sorted[i]) {
                    e.preventDefault(); //too late
                    flash(transl("duplicatedOptions"));
                    return;
                }
            }

            //prevent change options
            console.log("removeAttr contenteditable");
            if (_this.$votation.find(".text[contenteditable]").length) {
                _this.$votation.find(".text").removeAttr("contenteditable");
                _this.$votation.find(".option").css("pointer-events", "none");
            }

            loading(null, "VotationButtons.sendButtonEvent");

            if (!checkConnection()) {
                console.log("!checkConnection");
                e.preventDefault();
                loaded();
                return;
            }

            /////

            //screen-poll exists yet for styles, etc..
            var poll = _this.poll;
            if (!poll.obj) {
                poll.obj = {};
            }
            var obj = poll.obj;

            obj.options = [
                [0, $("#creator .option_0 .option_text .text").text(), 0],
                [1, $("#creator .option_1 .option_text .text").text(), 0]
            ];

            if (!obj.users) {
                obj.users = {};
            }
            obj.users[window.user.id] = getUserArray(window.user, poll);

            console.log(_this);
            _this.save.do(function (done) {
                if (false === done) {
                    console.log("false");
                    loaded();
                    return;
                }

                localStorage.setItem("unusedKey", "");
                //not save anymore
                new Share(_this.poll, _this.$imageDOM).do();

                //SAVE OWN CREATED POLLS!
                if (poll.key) {                    
                    localStorage.setItem("key_" + poll.key, JSON.stringify(obj));
                }
            });
        });
    };

    if (location.hash == "#home") {
        hashManager.loadHashData();
    }
});

//global function (can't do this with 'vw' - not parent reference)
function fontSize(div) {
    console.log("fontSize");
    if (!div) {
        div = "body";
    }

    var options = $(div + " .options");

    for (var i = 0; i < options.length; i++) {
        var poll = options[i];
        var option_text = $(poll).find(".option_text");
        var option_width = Math.floor(option_text.width());

        option_text.width(option_width); //firefox needs this dom update (bug)

        var size_option = parseInt((option_width / 9));
        option_text.css("font-size", size_option);

        //only too miniature polls
        var size_optionList = parseInt((option_width / 13));
        $(poll).find(".stored .option_text").css("font-size", size_optionList);

        var percentage_container = $(poll).find(".percentage_container");
        if (percentage_container.css("font-size")) { // >0            
            var size_result = parseInt((option_width / 8));
            $(poll).find(".percentage_container").css("font-size", size_result);
        }

        var votes_container = $(poll).find(".votes_container");
        if (votes_container.css("font-size")) { // >0
            var size_votes = parseInt((option_width / 13));
            $(poll).find(".votes_container").css("font-size", size_votes);
        }

        var size_skip = parseInt((option_width / 16));
        $(poll).find("#gameSkip").css("font-size", size_skip);
    }
}

//FillTable util
function textDivRows(selector) {
    var height = $(selector).height();
    var font_size = $(selector).css('font-size');
    var scale = 1.15;
    var line_height = Math.floor(parseInt(font_size) * scale);
    var rows = height / line_height;
    return Math.round(rows);
}
