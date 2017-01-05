define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    var code1 = base.getUrlParam("c");
    init();

    function init() {
        var code = base.getUrlParam("code");
        wxLogin({
            code: code,
            companyCode: SYSTEM_CODE
        });
    }

    function wxLogin(param) {
        Ajax.post("805152", { json: param })
            .then(function(res) {
                if (res.success) {
                    base.setSessionUser(res);
                    location.href = "../pay/apply.html?code=" + code1;
                } else {
                    base.showMsg(res.msg);
                }
            }, function(msg) {
                base.showMsg("非常抱歉，微信授权失败!");
            });
    }
});