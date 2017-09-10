
$(window).on("resize hashchange", function (e) {
    e.preventDefault();
    setTimeout(function () {
        fontSize();
        var focus = $('.option :focus');
        if (focus.length) {
            new OptionResize(focus);
        }
    }, 1);
});

var OptionResize = function (div) {
    this.option = div.closest(".option");

    this.marginTop = this.option[0].style.marginTop;
    this.marginLeft = this.option[0].style.marginLeft;
    this.width = this.option[0].style.width;
    this.height = this.option[0].style.height;

    var window_height = $(window).height();
    console.log("height: " + window_height);
    if (window_height < 200) {
        this.input_focus();
    }
};

OptionResize.prototype.input_focus = function () {
    var _this = this;

    var top = this.option.offset().top;
    $("html").animate({
        scrollTop: top
    }, function () {
        disableScroll();
        var position = _this.optionPosition();
        _this.option.addClass("full_screen");
        setTimeout(function () {
            _this.option.css(position);
        }, 1);
    });

    $(window).on("resize.optionOut hashchange.optionOut", function (e) {
        if ($(window).height() >= 200) {
            $(window).off(".optionOut");
            _this.input_focusout();
        }
    });
};

OptionResize.prototype.input_focusout = function () {
    var _this = this;

    enableScroll();
    this.option.css({
        'margin-top': this.marginTop,
        'margin-left': this.marginLeft,
        width: this.width,
        height: this.height
    });

    setTimeout(function () {
        _this.option.removeClass("full_screen");
    }, 300);
};

OptionResize.prototype.optionPosition = function () {
    var offset = this.option.offset();
    console.log("focus.scrollTop(): " + $("body").scrollTop());
    return {
        'margin-left': -offset.left,
        'margin-top': -offset.top + $("body").scrollTop(),
        width: $(window).width(),
        height: $(window).height()
    };
};
