"use strict";
exports.__esModule = true;
var fs = require("fs");
var db_1 = require("./db");
var instagram_1 = require("./instagram");
var connectionErrors = [
    'ENOTFOUND',
    'ECONNRESET',
    'ETIMEDOUT'
];
var Bot = /** @class */ (function () {
    function Bot(configPath, cookiesPath) {
        this._state = {
            follow: {
                running: false,
                tags: ['львов', 'львів', 'lviv', 'lvov'],
                timout: 1000 * 60 * 10,
                timerId: null
            },
            unfollow: {
                running: false,
                timout: 1000 * 60 * 1.1,
                timerId: null
            }
        };
        this.dbconf = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    }
    Object.defineProperty(Bot.prototype, "state", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    Bot.prototype.init = function () {
        this.db = new db_1.DataBase(this.dbconf);
        this.instagramServise = new instagram_1.Instagram('cookies');
        this.instagramServise.isDebug = false;
        return this;
    };
    Bot.prototype.startFollow = function () {
        if (!this._state.follow.running) {
            this._state.follow.running = true;
            this.follow();
        }
        return this._state;
    };
    Bot.prototype.stopFollow = function () {
        this._state.follow.running = false;
        clearTimeout(this._state.follow.timerId);
        return this._state;
    };
    Bot.prototype.startUnFollow = function () {
        if (!this._state.unfollow.running) {
            this._state.unfollow.running = true;
            this.unfollow();
        }
        return this._state;
    };
    Bot.prototype.follow = function () {
        var _this = this;
        if (!this._state.follow.running)
            return;
        var tag = encodeURIComponent(this._state.follow.tags[Math.floor(Math.random() * 10) % this._state.follow.tags.length]);
        this.instagramServise
            .getNews("/explore/tags/" + tag + "/")
            .then(this.filter.bind(this))
            .then(this.likeAndSubsribe.bind(this))
            .then(function () { return _this._state.follow.timout; })["catch"](this.errors)
            .then(function (timeout) {
            if (~timeout)
                _this._state.follow.timerId = setTimeout(_this.follow.bind(_this), timeout); // recursive call
            else
                console.log("stop bot");
        });
    };
    Bot.prototype.unfollow = function () {
        var _this = this;
        this.db.users.findAll({ where: { follow: 1 }, limit: 1, order: [['datetime', 'ASC']] })
            .then(function (users) { return users[0]; })
            .then(function (user) { return _this.instagramServise
            .unfollow(user.id)
            .then(function (resp) {
            console.log(new Date().toLocaleString() + " unfollow: \t " + user.id + " \t " + resp.data);
            return user;
        }); })
            .then(function (user) { return user.update({ follow: 0 }); })
            .then(function () { return _this._state.unfollow.timout; })["catch"](this.errors)
            .then(function (timeout) {
            if (~timeout)
                _this._state.unfollow.timerId = setTimeout(_this.unfollow.bind(_this), timeout); // recursive call
            else
                console.log("stop bot");
        });
    };
    Bot.prototype.likeAndSubsribe = function (nodes) {
        var _this = this;
        var node = nodes.pop();
        if (!node || !this._state.follow.running)
            return new Promise(function (resolve) { return resolve(); });
        return this.instagramServise
            .like(node.node.id)
            .then(function (resp) { return console.log(new Date().toLocaleString() + " like: \t " + node.node.id + " \t " + resp.data); })
            .then(this.pause2_6k)
            .then(function (r) { return _this.instagramServise
            .follow(node.node.owner.id)
            .then(function (resp) { return console.log(new Date().toLocaleString() + " subscr: \t " + node.node.owner.id + " \t " + resp.data); }); })
            .then(this.pause2_6k)
            .then(function (r) {
            return _this.db.users.create(new db_1.User(+node.node.owner.id, +new Date(), 1));
        })
            .then(function (r) { return _this.likeAndSubsribe(nodes); }); // recursive call
    };
    Bot.prototype.pause2_6k = function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () { return resolve('pause done!'); }, Math.max(2000, (Math.random() * 6000)));
        });
    };
    Bot.prototype.filter = function (data) {
        var ids = data.graphql.hashtag.edge_hashtag_to_media.edges.map(function (node) { return +node.node.owner.id; });
        return this.db.users
            .findAll({ attributes: ['id'], where: { id: { $in: ids } }, raw: true })
            .then(function (toExlude) {
            var seen = new Set();
            var subscribed = toExlude.map(function (x) { return x.id; });
            var nodes = data.graphql.hashtag.edge_hashtag_to_media.edges
                .filter(function (node) { return !~subscribed.indexOf(+node.node.owner.id); }) //filter subscribed
                .filter(function (node) { return seen.has(+node.node.owner.id) ? false : !!(seen.add(+node.node.owner.id)); }); //filter duplicates
            return new Promise(function (resolve) { return resolve(nodes.slice(-15)); }); // max 15 at the time
        });
    };
    Bot.prototype.errors = function (e) {
        var error = e;
        if (error && error.resp) {
            console.log(new Date().toLocaleString() + " instagram error: ", error.data);
            if (error.resp.statusCode === 403 && error.data == "Please wait a few minutes before you try again.") {
                return 1000 * 60 * 60; // resume after 1 hour
            }
            else if (error.resp.statusCode === 400 && error.data == "This action was blocked. Please try again later.") {
                return 1000 * 60 * 60; // resume after 1 hour
            }
            else if (error.resp.statusCode === 400 && error.data == "missing media") {
                return 10000; // resume after 10 sec
            }
            else {
                return -1;
            }
        }
        else if (e.code && !!~connectionErrors.indexOf(e.code)) {
            console.log(new Date().toLocaleString() + " connection lost, try again after 10 min");
            return 1000 * 60 * 10; // resume after 10 min
        }
        else {
            console.log(new Date().toLocaleString() + " unknown error: ", e);
            return -1;
        }
    };
    return Bot;
}());
exports.Bot = Bot;
