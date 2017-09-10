
FillTable.prototype.emptyPoll = function () {
    var _this = this;
    console.log("empty poll");

    var answer1 = this.addCell(0);
    answer1.find(".option_text .text").attr("contenteditable", "true");
    this.$div.find(".options").append(answer1);

    var answer2 = this.addCell(1);
    answer2.find(".option_text .text").attr("contenteditable", "true");
    this.$div.find(".options").append(answer2);

    this.$div.find(".option").click(function () {
        $(this).find(".text").focus();
    });

    //view
//        $("#buttons").show();
//        $("#showPolls").show();

    //try to prevent scroll move on focus:
    this.$div.find(".option_text").on('focusin focus', function (e) {
        e.preventDefault();
    });
    this.$div.find(".option_text").keyup(function () {
        _this.checkTextLength(this);
    });
};

FillTable.prototype.checkTextLength = function (div) {
    var rows = textDivRows(div);
    if (rows > 10) {
        var str = $(div).text();
        $(div).text(str.substring(0, str.length - 1));
        this.checkTextLength(div);
    }
};
