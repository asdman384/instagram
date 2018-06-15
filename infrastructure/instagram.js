"use strict";
exports.__esModule = true;
var fs = require("fs");
var https = require("https");
var Instagram = /** @class */ (function () {
    function Instagram(pathToCookies) {
        this.params = new DefaultParams();
        this.isDebug = false;
        if (pathToCookies)
            if (fs.existsSync(pathToCookies)) {
                this.params.headers.cookie = JSON.parse(fs.readFileSync(pathToCookies, 'utf8'));
                this.params.headers['x-csrftoken'] = parseToken(this.params.headers.cookie);
            }
            else
                console.error("Cookies not found, try to login");
    }
    Instagram.prototype.auth = function (login, passw) {
        var _this = this;
        var params = new DefaultParams();
        return this.doRequest(params)
            .then(function (result) { params.headers["cookie"] = result.resp.headers["set-cookie"]; })
            .then(function () {
            var data = "username=" + login + "&password=" + passw;
            params.method = 'POST';
            params.path = '/accounts/login/ajax/';
            params.headers['Content-Length'] = Buffer.byteLength(data);
            params.headers['x-csrftoken'] = parseToken(params.headers["cookie"]);
            return _this.doRequest(params, data).then(function (result) {
                fs.writeFile('cookies', JSON.stringify(result.resp.headers["set-cookie"]), { encoding: 'utf-8' }, function () { });
                return result.data;
            });
        });
    };
    Instagram.prototype.unfollow = function (id) {
        this.params.path = "/web/friendships/" + id + "/unfollow/";
        this.params['method'] = 'POST';
        return this.doRequest(this.params);
    };
    Instagram.prototype.follow = function (id) {
        this.params.path = "/web/friendships/" + id + "/follow/";
        this.params['method'] = 'POST';
        return this.doRequest(this.params);
    };
    Instagram.prototype.like = function (postId) {
        this.params.path = "/web/likes/" + postId + "/like/";
        this.params['method'] = 'POST';
        return this.doRequest(this.params);
    };
    Instagram.prototype.getNews = function (explore) {
        this.params.path = explore + '?__a=1';
        this.params['method'] = 'GET';
        return this.doRequest(this.params).then(function (response) {
            return new Promise(function (resolve, reject) {
                try {
                    resolve(JSON.parse(response.data));
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    };
    Instagram.prototype.doRequest = function (params, postData) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var req = https.request(params, function (resp) {
                var data = '';
                resp.on('data', function (chunk) { return data += chunk; });
                resp.on('end', function () {
                    _this.debug("Instagram.doRequest: " + params.path + " : " + resp.statusCode + " \n\tdata:[" + data + "]", resp.statusCode != 200);
                    if (resp.statusCode != 200)
                        reject({ data: data, resp: resp });
                    else
                        resolve({ data: data, resp: resp });
                });
            });
            req.on('error', function (err) { return reject(err); });
            if (postData)
                req.write(postData);
            req.end();
        });
    };
    Instagram.prototype.debug = function (message, assert) {
        if (assert || this.isDebug)
            console.log("debug: " + new Date().toLocaleString(), message);
    };
    return Instagram;
}());
exports.Instagram = Instagram;
function parseToken(cookies) {
    var token = '';
    var tokenSection = cookies.find(function (i) { return i.includes('csrftoken'); });
    if (tokenSection) {
        token = tokenSection.split(";").find(function (i) { return i.includes('csrftoken'); }).split("=")[1];
    }
    return token;
}
var InstaResponse = /** @class */ (function () {
    function InstaResponse() {
    }
    return InstaResponse;
}());
exports.InstaResponse = InstaResponse;
var DefaultParams = /** @class */ (function () {
    function DefaultParams() {
        this.protocol = 'https:';
        this.hostname = 'www.instagram.com';
        this.method = 'GET';
        this.path = '';
        this.headers = {
            'cookie': [],
            'origin': 'https://www.instagram.com',
            'referer': 'https://www.instagram.com/',
            'user-agent': 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
            'x-csrftoken': '',
            'x-instagram-ajax': '1',
            'x-requested-with': 'XMLHttpRequest',
            'content-type': 'application/x-www-form-urlencoded'
        };
    }
    return DefaultParams;
}());
