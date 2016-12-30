define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax, Swiper) {
    var wrapSwiper, rightSwiper, leftSwiper;
    var config = {
        leftConfig: {
            start: 1,
            limit: 1,
            status: 1,
            first: true
        },
        rightConfig: {
            start: 1,
            limit: 4,
            status: 1,
            first: true,
            type: 4
        }
    }
    var isEnd, canScrolling;
    var contHeight = $(window).height() - 80;
    var activeIdx = base.getUrlParam("idx") || 0;

    init();

    function init() {
        //$("#rightWrap").height(contHeight);
        addListener();
        $("#pagination").find("li:eq(" + activeIdx + ")").click();
    }

    function addListener() {
        $("#pagination").on("click", "li", function() {
            var me = $(this),
                index = me.index();
            me.siblings(".active").removeClass("active");
            me.addClass("active");
            if (index == 0) {
                document.title = '精选活动';
                $("#leftWrap").show();
                $("#rightWrap").hide();
                $("#leftCont").html('<div class="loading"></div>');
                getLeftCont(true);
            } else {
                document.title = '往日精彩';
                $("#leftWrap").hide();
                $("#rightWrap").show();
                $("#rightCont").html('<li class="loading"></li>');
                getRightCont(true);
            }
            var $iframe = $('<iframe src="/favicon.ico" style="visibility: hidden;"></iframe>');
            $iframe.on('load', function() {
                setTimeout(function() {
                    $iframe.off('load').remove();
                }, 0);
            }).appendTo($('body'));
        });
        $("#applyBtn").on("click", function() {
            var code = "";
            if (code = $("#leftCode").val()) {
                if (base.isLogin()) {
                    location.href = "../pay/apply.html?code=" + code;
                } else {
                    var appid = APPID;
                    var redirect_uri = base.getDomain() + "/cont/redirect.html?c=" + code;
                    location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" + appid + "&redirect_uri=" + redirect_uri + "&response_type=code&scope=snsapi_userinfo#wechat_redirect";
                }
            }
        });
        $("#rightCont").on("click", "li[data-code]", function() {
            var code = $(this).attr("data-code");
            if (code) {
                location.href = "./wonderful-detail.html?code=" + code;
            }
        });
        $(window).on("scroll", function() {
            var me = $(this);
            if (canScrolling && !isEnd && ($(document).height() - $(window).height() - 40 <= $(document).scrollTop())) {
                canScrolling = false;
                addLoading();
                getRightCont();
            }
        });
    }

    function getLeftCont(refresh) {
        refresh && (config.leftConfig.start = 1, config.leftConfig.first = true);
        Ajax.get("616120", $.extend({}, config.leftConfig), !refresh)
            .then(function(res) {
                $("#leftCont").find(".loading").remove();
                if (res.success && res.data.list.length) {
                    refresh && $("#leftCont").empty();
                    addLeftCont(res.data.list[0]);
                } else {
                    config.leftConfig.first && doLeftError("#leftCont");
                }
                config.leftConfig.first = false;
            });
    }

    function addLeftCont(data) {
        data.pic1 = data.pic1.split(/\|\|/)[0];
        var html = '<img class="plr16  pt20 wp100" src="' + data.pic1 + '">' +
            '<div class="fs30 plr30 ptb15 news-head">' + data.title + '</div>' +
            '<div class="p-word">' + data.description + '</div>';

        $("#leftCont").html(html);
        $("#leftCode").val(data.code);
    }

    function getRightCont(refresh) {
        refresh && (config.rightConfig.start = 1, config.rightConfig.first = true);
        Ajax.get("616190", $.extend({}, config.rightConfig), !refresh)
            .then(function(res) {
                $("#rightCont").find(".loading").remove();
                if (res.success && res.data.list.length) {
                    refresh && $("#rightCont").empty();
                    var data = res.data,
                        totalCount = data.totalCount,
                        curList = data.list
                    if (totalCount < config.rightConfig.limit || curList.length < config.rightConfig.limit) {
                        isEnd = true;
                    }
                    addRightCont(curList);
                    config.rightConfig.start++;
                    canScrolling = true;
                } else {
                    config.rightConfig.first && doRightError("#rightCont");
                }
                config.rightConfig.first = false;
            });
    }

    function addRightCont(data) {
        for (var i = 0, html = ""; i < data.length; i++) {
            data[i].pic = data[i].pic.split(/\|\|/)[0];
            html += '<li data-code="' + data[i].code + '" class="p-r mb20 pt20">' +
                '<img class="plr16 wp100 " src="' + data[i].pic + '">' +
                '<div class="wp100 pr52 pos">' +
                '<div class="heading">' + data[i].title + '</div>' +
                '</div>' +
                '</li>';
        }
        $("#rightCont").append(html);
    }

    function doLeftError(id) {
        $(id).html('<div class="tc bg_fff" style="line-height: 150px;font-size: 30px;color: #888;">暂无相关活动</div>');
    }

    function doRightError(id) {
        $(id).html('<li class="tc bg_fff" style="line-height: 150px;font-size: 30px;color: #888;">暂无往日精彩</li>');
    }

    function addLoading() {
        $("#rightCont").append('<li class="loading"></li>');
    }
});