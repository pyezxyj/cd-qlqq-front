define([
    'app/controller/base',
    'app/util/ajax',
    'app/module/validate/validate',
    'app/module/addSub/addSub'
], function(base, Ajax, Validate, addSub) {

    var code = base.getUrlParam("code");

    init();

    function init() {
        if (code) {
            getCont();
            getActTip();
            base.getUser()
                .then(function(res) {
                    if (res.success) {
                        res.data.idNo && $("#idNo").val(res.data.idNo);
                        res.data.realName && $("#realName").val(res.data.realName);
                        res.data.mobile && $("#mobile").val(res.data.mobile);
                    }
                });
            addListener();
        } else {
            $("#loading").hide();
            base.showMsg("未传入活动编号");
        }
    }

    function getActTip() {
        Ajax.get("616913", {
            "ckey": "actTip"
        }).then(function(res) {
            if (res.success) {
                $("#actTip").html(res.data.cvalue);
            }
        });
    }

    function addListener() {
        $("#applyForm").validate({
            'rules': {
                realName: {
                    required: true,
                    isNotFace: true
                },
                idNo: {
                    required: true,
                    isIdCardNo: true
                },
                mobile: {
                    required: true,
                    mobile: true
                },
                bookNum: {
                    required: true,
                    "Z+": true
                },
                hotelName: {
                    required: false,
                    isNotFace: true
                }
            }
        });
        $("#back").on("click", function() {
            location.href = "../activity.html";
        });
        $("#applyBtn").on("click", function() {
            if ($("#applyForm").valid()) {
                $("#loading").show();
                var userId = base.getUserId();
                if (!userId) {
                    base.showMsg("登录超时，请重新登录");
                    setTimeout(function() {
                        location.href = "../activity.html";
                    }, 2000);
                } else {
                    $("#applyUser").val(userId);
                    applyOrder(userId);
                }
            }
        });
        $("#hotelName").on("keyup", function() {
            var me = $(this),
                value = me.val();
            if (value == undefined || value == "") {
                me.siblings(".prompt").removeClass("hidden");
            } else {
                me.siblings(".prompt").addClass("hidden");
            }
        });
        addSub.createByEle({
            sub: $("#subCount"),
            add: $("#addCount"),
            input: $("#bookNum"),
            changeFn: function() {
                var unit = +$("#fee").val();
                var value = +this.value;
                $("#count1").html((+unit / 1000) + "*" + value);
                $("#count2").html((unit * value) / 1000 + "元");
            }
        });
    }

    function getCont() {
        Ajax.get("616121", { code: code })
            .then(function(res) {
                $("#loading").hide();
                if (res.success) {
                    $("#productCode").val(res.data.code);
                    $("#fee").val(res.data.fee);
                    $("#bookNum").val("1").trigger("change");
                } else {
                    base.showMsg("订单信息获取失败");
                }
            });
    }

    function applyOrder(userId) {
        Ajax.post("616130", { json: $("#applyForm").serializeObject() })
            .then(function(res) {
                if (res.success) {
                    var code = res.data.code;
                    payOrder(code, userId);
                } else {
                    $("#loading").hide();
                    base.showMsg("订单提交失败");
                }
            });
    }

    function payOrder(code, userId) {
        Ajax.getIp()
            .then(function(res) {
                Ajax.post("616131", {
                    json: {
                        code: code,
                        ip: res.ip
                    }
                }).then(wxPay, function() {
                    $("#loading").hide();
                    base.showMsg("非常抱歉，活动订单提交失败");
                });
            }, function() {
                base.showMsg("ip获取失败");
                $("#loading").hide();
            });

    }
    var response = {};

    function onBridgeReady() {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest', {
                "appId": response.data.appId, //公众号名称，由商户传入     
                "timeStamp": response.data.timeStamp, //时间戳，自1970年以来的秒数     
                "nonceStr": response.data.nonceStr, //随机串     
                "package": response.data.wechatPackage,
                "signType": response.data.signType, //微信签名方式：     
                "paySign": response.data.paySign //微信签名 
            },
            function(res) {
                $("#loading").hide();
                if (res.err_msg == "get_brand_wcpay_request:ok") { // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
                    base.showMsg("支付成功");
                    setTimeout(function() {
                        location.href = "../activity.html";
                    }, 2000);
                } else {
                    base.showMsg("支付失败");
                }
            }
        );
    }

    function wxPay(response1) {
        response = response1;
        if (response.data && response.data.signType) {
            if (typeof WeixinJSBridge == "undefined") {
                if (document.addEventListener) {
                    document.removeEventListener("WeixinJSBridgeReady", onBridgeReady);
                    document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
                } else if (document.attachEvent) {
                    document.detachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.detachEvent('onWeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
                    document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
                }
            } else {
                onBridgeReady();
            }
        } else {
            base.showMsg("微信支付失败");
        }
    }
});