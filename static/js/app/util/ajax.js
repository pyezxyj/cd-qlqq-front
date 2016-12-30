define(["jquery"], function($) {
    var cache = {};

    function getUrl(code) {
        // if (/^(805)/.test(code) || "802182" == code) {
        //     return '/wxapi';
        // }
        return "/api";
    }

    function clearSessionUser() {
        sessionStorage.removeItem("user"); //userId
        sessionStorage.removeItem("tk"); //token
    }
    return {
        get: function(code, param, cache) {
            if (typeof param == 'undefined' || typeof param == "boolean") {
                cache = param;
                param = {};
            }

            return this.post(code, {
                json: param,
                cache: cache === false ? false : true,
                close: true
            }, true);
        },
        getIp: function(param) {
            return $.ajax({
                type: "get",
                url: getUrl() + '/ip',
                param: param
            });
        },
        post: function(code, options) {
            var param = options.json;

            var token = sessionStorage.getItem("tk") || "",
                userId = sessionStorage.getItem("user") || "";

            token && (param["token"] = token);
            userId && (param["userId"] = userId);
            param["systemCode"] = SYSTEM_CODE;

            var sendUrl = getUrl(code) + "/api";
            var sendParam = {
                code: code,
                json: param
            };
            var cache_url = sendUrl + JSON.stringify(sendParam);
            if (!options.cache) {
                delete cache[cache_url];
            }
            if (!cache[cache_url]) {
                sendParam.json = JSON.stringify(param);
                cache[cache_url] = $.ajax({
                    type: 'post',
                    url: sendUrl,
                    data: sendParam
                });
            }
            return cache[cache_url].then(function(res) {
                if (res.errorCode == "4") {
                    clearSessionUser();
                    // location.href = "../user/login.html?return=" + encodeURIComponent(location.pathname + location.search);
                    // base.showMsg("登录超时");
                }
                var result = {};
                res.errorCode == "0" ? (result.success = true, result.data = res.data) :
                    (result.success = false, result.msg = res.errorInfo);
                return result;
            }, function(obj, error, msg) {
                console.log(msg);
                return msg;
            });
        }
    };
});