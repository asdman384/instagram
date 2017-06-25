var https = require('https');
var fs = require('fs');
var I = {
    debug: true,
    params: {
        protocol: 'https:',
        hostname: 'www.instagram.com',
        path: '',
        headers: {
            'cookie': '',
            'origin': 'https://www.instagram.com',
            'referer': 'https://www.instagram.com/',
            'user-agent': 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
            'x-csrftoken': '',
            'x-instagram-ajax': '1',
            'x-requested-with': 'XMLHttpRequest',
            'content-type': 'application/x-www-form-urlencoded'
        }
    },
    init: function(token) {
        if (!fs.existsSync('cookies')) {
            console.error("try to login");
            return;
        }
        this.params.headers.cookie = JSON.parse(fs.readFileSync('cookies', 'utf8'));
        this.params.headers['x-csrftoken'] = parseToken(this.params.headers.cookie);
    },
    auth: function(login, passw) {
        var params = this._copy(this.params);
        params['method'] = 'GET';
        const req = https.request(params, resp => {
            var data = '';
            resp.on('data', chunk => data += chunk);
            resp.on('end', () => {
                params.headers["cookie"] = resp.headers["set-cookie"];
                enter(params, login, passw)
            })
        });
        req.on('error', console.error);
        req.end();

        function enter(params, login, passw) {
            var postData = `username=${login}&password=${passw}`;
            params['method'] = 'POST';
            params.path = '/accounts/login/ajax/';
            params.headers['Content-Length'] = Buffer.byteLength(postData);
            params.headers['x-csrftoken'] = parseToken(params.headers["cookie"]);
            const loginReq = https.request(params, loginResp => {
                var cookies = loginResp.headers["set-cookie"];
                var data = '';
                loginResp.on('data', chunk => data += chunk);
                loginResp.on('end', () => {
                    if (loginResp.statusCode != 200) throw data;
                    fs.writeFile('cookies', JSON.stringify(cookies));
                    console.log(data);
                });
            });
            loginReq.on('error', console.error);
            loginReq.write(postData);
            loginReq.end();
        }
    },
    unsubscribe: function(id) {
        // return new Promise(resolve => resolve('subscribe: ' + id));
        var params = this._copy(this.params);
        params.path = `/web/friendships/${id}/unfollow/`;
        params['method'] = 'POST';

        return this._doRequest(params);
    },
    subscribe: function(id) {
        // return new Promise(resolve => resolve('subscribe: ' + id));
        var params = this._copy(this.params);
        params.path = `/web/friendships/${id}/follow/`;
        params['method'] = 'POST';
        
        return this._doRequest(params);
    },
    like: function(postId) {
        // return new Promise(resolve => resolve('like: ' + postId));
        var params = this._copy(this.params);
        params.path = `/web/likes/${postId}/like/`;
        params['method'] = 'POST';
        
        return this._doRequest(params);
    },
    getNews: function(explore) {
        var params = this._copy(this.params);
        params.path = explore;
        params['method'] = 'GET';
        
        return this._doRequest(params).then(body => {
            var content = body.match(/\<script type\=\"text\/javascript\"\>window\.\_sharedData \= (.+);<\/script>/);
            return new Promise(function(resolve, reject) {
                if (!content) {
                    reject({type: 'getNews error', data: body});
                } else {
                    resolve(JSON.parse(content[1]));
                }
            })
        });
    },
    _doRequest: function(params, postData) {        
        return new Promise((resolve, reject) => {
            const req = https.request(params, httpResp => {
                var data = '';
                httpResp.on('data', chunk => data += chunk);
                httpResp.on('end', () => {
                    this._debug(`${params.path}\t:\t${httpResp.statusCode}`);
                    this._debug(`${params.path} : ${httpResp.statusCode} \ndata:\n${data}`, httpResp.statusCode != 200);
                    if (httpResp.statusCode == 403) {
                        reject({type: 'auth error', data: data});
                        return;
                    }
                    resolve(data);
                });
            });
            req.on('error', function(err) {
                reject(err);
            });
            if (postData) {
                req.write(postData);
            }
            req.end();
        });
    },
    _debug: function(message, assert) {
        if (assert === undefined & this.debug) {
            console.log(`${new Date().toLocaleString()}`, message);
        } else {
            if (assert) {
                console.error(`${new Date().toLocaleString()}`, message);
            }
        }
    },
    _copy: function(origin) {
        return JSON.parse(JSON.stringify(origin));
    }
}

function parseToken(cookies) {
    var token = '';
    var tokenSection = cookies.find(i => i.includes('csrftoken'));
    if (tokenSection) {
        token = tokenSection.split(";").find(i => i.includes('csrftoken')).split("=")[1];
    }
    return token;
}
I.init();
module.exports = I;