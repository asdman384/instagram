import * as fs from "fs";
import { DataBase, User } from "./db";
import { Instagram, InstaResponse } from "./instagram";
import { State, Nodee, InstaFeed } from "./types";

var connectionErrors = [
    'ENOTFOUND',
    'ECONNRESET',
    'ETIMEDOUT'
]

export class Bot {

    private instagramServise: Instagram;
    private db: DataBase
    private dbconf: any;
    private _state: State = {
        follow: {
            running: false,
            tags: ['львов', 'львів', 'lviv', 'lvov'],
            timout: 1000 * 60 * 10, // 10min
            timerId: null,
        },

        unfollow: {
            running: false,
            timout: 1000 * 60 * 1.1, // 10min
            timerId: null,
        }
    }


    constructor(configPath: string, cookiesPath: string) {
        this.dbconf = JSON.parse(fs.readFileSync('db.json', 'utf8'));

    }

    public get state(): State { return this._state }

    public init(): Bot {
        this.db = new DataBase(this.dbconf);
        this.instagramServise = new Instagram('cookies')
        this.instagramServise.isDebug = false;
        return this;
    }

    public startFollow(): State {
        if (!this._state.follow.running) {
            this._state.follow.running = true;
            this.follow();
        }

        return this._state;
    }

    public stopFollow() {
        this._state.follow.running = false;
        clearTimeout(this._state.follow.timerId);

        return this._state;
    }

    public startUnFollow(): State {
        if (!this._state.unfollow.running) {
            this._state.unfollow.running = true;
            this.unfollow();
        }

        return this._state;
    }


    private follow() {
        if (!this._state.follow.running)
            return;

        var tag = encodeURIComponent(this._state.follow.tags[Math.floor(Math.random() * 10) % this._state.follow.tags.length]);

        this.instagramServise
            .getNews(`/explore/tags/${tag}/`)
            .then(this.filter.bind(this))
            .then(this.likeAndSubsribe.bind(this))
            .then(() => this._state.follow.timout)
            .catch(this.errors)
            .then(timeout => { // finally
                if (~timeout)
                    this._state.follow.timerId = setTimeout(this.follow.bind(this), timeout); // recursive call
                else
                    console.log("stop bot");
            })
    }

    private unfollow() {
        this.db.users.findAll<any>({ where: { follow: 1 }, limit: 1, order: [['datetime', 'ASC']] })
            .then((users: any[]) => users[0])
            .then(user => this.instagramServise
                .unfollow(user.id)
                .then(resp => {
                    console.log(`${new Date().toLocaleString()} unfollow: \t ${user.id} \t ${resp.data}`)
                    return user;
                })
            )
            .then(user => user.update({ follow: 0 }))
            .then(() => this._state.unfollow.timout)
            .catch(this.errors)
            .then(timeout => { // finally
                if (~timeout)
                    this._state.unfollow.timerId = setTimeout(this.unfollow.bind(this), timeout); // recursive call
                else
                    console.log("stop bot");
            })
    }

    private likeAndSubsribe(nodes: Nodee[]) {
        let node = nodes.pop();

        if (!node || !this._state.follow.running)
            return new Promise(resolve => resolve());

        return this.instagramServise
            .like(node.node.id)
            .then(resp => console.log(`${new Date().toLocaleString()} like: \t ${node.node.id} \t ${resp.data}`))
            .then(this.pause2_6k)
            .then(r => this.instagramServise
                .follow(node.node.owner.id)
                .then(resp => console.log(`${new Date().toLocaleString()} subscr: \t ${node.node.owner.id} \t ${resp.data}`)))
            .then(this.pause2_6k)
            .then(r =>
                this.db.users.create(new User(+node.node.owner.id, + new Date(), 1)))
            .then(r => this.likeAndSubsribe(nodes)); // recursive call
    }

    private pause2_6k() { //pause random from 2 to 6
        return new Promise(function (resolve, reject) {
            setTimeout(() => resolve('pause done!'), Math.max(2000, (Math.random() * 6000)));
        });
    }

    private filter(data: InstaFeed) {
        let ids = data.graphql.hashtag.edge_hashtag_to_media.edges.map(node => +node.node.owner.id);

        return this.db.users
            .findAll({ attributes: ['id'], where: { id: { $in: ids } }, raw: true })
            .then((toExlude: { id: number }[]) => {
                let seen: Set<number> = new Set();
                let subscribed = toExlude.map(x => x.id);

                let nodes: Nodee[] = data.graphql.hashtag.edge_hashtag_to_media.edges
                    .filter(node => !~subscribed.indexOf(+node.node.owner.id))  //filter subscribed
                    .filter(node => seen.has(+node.node.owner.id) ? false : !!(seen.add(+node.node.owner.id))); //filter duplicates

                return new Promise<Nodee[]>(resolve => resolve(nodes.slice(-15))); // max 15 at the time
            });
    }

    private errors(e): number {
        let error = <InstaResponse>e;
        if (error && error.resp) {
            console.log(`${new Date().toLocaleString()} instagram error: `, error.data);

            if (error.resp.statusCode === 403 && error.data == "Please wait a few minutes before you try again.") {
                return 1000 * 60 * 60;// resume after 1 hour
            } else if (error.resp.statusCode === 400 && error.data == "This action was blocked. Please try again later.") {
                return 1000 * 60 * 60;// resume after 1 hour
            } else if (error.resp.statusCode === 400 && error.data == "missing media") {
                return 10000; // resume after 10 sec
            } else {
                return -1;
            }

        } else if (e.code && !!~connectionErrors.indexOf(e.code)) {

            console.log(`${new Date().toLocaleString()} connection lost, try again after 10 min`);
            return 1000 * 60 * 10; // resume after 10 min
        }
        else {
            console.log(`${new Date().toLocaleString()} unknown error: `, e);
            return -1;
        }
    }
}