import * as fs from "fs";
import { IncomingMessage } from "http";
import * as https from "https";
import { InstaFeed } from "./types";

export class Instagram {
    private params = new DefaultParams();
    public isDebug: boolean = false;

    constructor(pathToCookies?: string) {
        if (pathToCookies)
            if (fs.existsSync(pathToCookies)) {
                this.params.headers.cookie = JSON.parse(fs.readFileSync(pathToCookies, 'utf8'));
                this.params.headers['x-csrftoken'] = parseToken(this.params.headers.cookie);
            } else
                console.error("Cookies not found, try to login");
    }

    public auth(login: string, passw: string): Promise<string> {
        let params = new DefaultParams();

        return this.doRequest(params)
            .then((result: InstaResponse) => { params.headers["cookie"] = result.resp.headers["set-cookie"]; })
            .then(() => {
                let data = `username=${login}&password=${passw}`;
                params.method = 'POST';
                params.path = '/accounts/login/ajax/';
                params.headers['Content-Length'] = Buffer.byteLength(data);
                params.headers['x-csrftoken'] = parseToken(params.headers["cookie"]);
                return this.doRequest(params, data).then((result: InstaResponse) => {
                    fs.writeFile('cookies', JSON.stringify(result.resp.headers["set-cookie"]), { encoding: 'utf-8' }, () => { });
                    return result.data;
                });
            })
    }

    public unfollow(id) {
        this.params.path = `/web/friendships/${id}/unfollow/`;
        this.params['method'] = 'POST';

        return this.doRequest(this.params);
    }

    public follow(id) {
        this.params.path = `/web/friendships/${id}/follow/`;
        this.params['method'] = 'POST';

        return this.doRequest(this.params);
    }

    public like(postId) {
        this.params.path = `/web/likes/${postId}/like/`;
        this.params['method'] = 'POST';

        return this.doRequest(this.params);
    }

    public getNews(explore): Promise<InstaFeed> {
        this.params.path = explore + '?__a=1';
        this.params['method'] = 'GET';
        return this.doRequest(this.params).then(response => {
            return new Promise<InstaFeed>(function (resolve, reject) {
                try {
                    resolve(JSON.parse(response.data) as InstaFeed);
                } catch (e) {
                    reject(e);
                }
            })
        });
    }

    private doRequest(params: DefaultParams, postData?: any): Promise<InstaResponse> {
        return new Promise((resolve, reject) => {

            const req = https.request(params, (resp: IncomingMessage) => {
                var data = '';
                resp.on('data', chunk => data += chunk);
                resp.on('end', () => {
                    this.debug(`Instagram.doRequest: ${params.path} : ${resp.statusCode} \n\tdata:[${data}]`, resp.statusCode != 200);
                    if (resp.statusCode != 200)
                        reject({ data, resp });
                    else
                        resolve({ data, resp });
                });
            });

            req.on('error', err => reject(err));

            if (postData)
                req.write(postData);

            req.end();
        });
    }

    private debug(message, assert) {
        if (assert || this.isDebug)
            console.log(`debug: ${new Date().toLocaleString()}`, message);
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

export class InstaResponse {
    data: string;
    resp: IncomingMessage;
}

class DefaultParams {
    protocol = 'https:';
    hostname = 'www.instagram.com';
    method = 'GET';
    path = '';
    headers = {
        'cookie': [],
        'origin': 'https://www.instagram.com',
        'referer': 'https://www.instagram.com/',
        'user-agent': 'Mozilla/5.0 (Linux; U; Android 4.0.3; ko-kr; LG-L160L Build/IML74K) AppleWebkit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
        'x-csrftoken': '',
        'x-instagram-ajax': '1',
        'x-requested-with': 'XMLHttpRequest',
        'content-type': 'application/x-www-form-urlencoded'
    }
}