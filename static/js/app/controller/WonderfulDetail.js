define([
    'app/controller/base',
    'app/util/ajax',
    'swiper'
], function(base, Ajax, Swiper) {

    var code = base.getUrlParam("code");
    var leftSwiper;

    init();

    function init() {
        var contHeight = $(window).height() - 40;
        $("#swiperInner").css({
            "height": contHeight + "px"
        });
        swiperInner();
        addListener();
        code && Ajax.post("616222", {
            json: {
                newsCode: code
            }
        });
    }

    function swiperInner() {
        leftSwiper = new Swiper('#swiperInner', {
            direction: 'vertical',
            slidesPerView: 'auto',
            freeMode: true,
            onTouchEnd: function(swiper) {
                if (swiper.translate > 40) { //判断下拉刷新
                    $('.top-load', $("#swiperInner")).removeClass('hidden');
                    getCont(true);
                }
            },
            onInit: function() {
                code ? getCont() : (base.showMsg("未传入内容编号"), doError("#cont"));
            }
        });
    }

    function addListener() {
        $("#back").on("click", function() {
            location.href = "../activity.html?idx=1";
        });
    }

    function getCont(refresh) {
        Ajax.get("616191", { code: code }, !refresh)
            .then(function(res) {
                $('.top-load', $("#swiperInner")).addClass('hidden');
                if (res.success) {
                    res.data.pic = res.data.pic.split(/\|\|/)[0];
                    var date = new Date(res.data.updateDatetime || res.data.publishDatetime).format("yyyy.MM.dd");
                    var html = '<div class="fs15 plr15 ptb7_5 news-head">' + res.data.title + '</div>' +
                        '<div class="time wp100 plr15 pt3">' +
                        '<div class=" inline_block">' + date + '</div>' +
                        '<div class="inline_block eye pl23 ml20">(' + res.data.scanNum + ')</div>' +
                        '</div>' +
                        '<div class="p-word">' + res.data.content + '</div>';

                    var $cont = $(html);
                    var imgs = $cont.find("img");

                    for (var i = 0; i < imgs.length; i++) {
                        var img = imgs.eq(i);
                        if (img[0].complete) {
                            leftSwiper.update();
                            continue;
                        }
                        (function(img) {
                            img[0].onload = (function() {
                                leftSwiper.update();
                            });
                        })(img);
                    }
                    $("#cont").html($cont);

                    setTimeout(function() {
                        leftSwiper.update();
                    }, 300)
                } else {
                    !refresh && doError("#cont");
                }
            });
    }

    function doError(id) {
        $(id).html('<div class="tc bg_fff" style="line-height: 75px;font-size: 15px;color: #888;">暂时无法获取内容</div>');
    }
});