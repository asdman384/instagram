import * as express from 'express';
import * as fs from "fs";
import { DataBase, User } from "../../infrastructure/db";
import { Instagram } from "../../infrastructure/instagram";
import { Graphql, Nodee, InstaResp } from '../../infrastructure/types';

let conf = JSON.parse(fs.readFileSync('db.json', 'utf8'));
let demon = express();
let db = new DataBase(conf);
let instagram = new Instagram('cookies')
instagram.isDebug = true;

let state = {
    running: false,
    tags: ['львов', 'львів', 'lviv', 'lvov'],
    timout: 1000 * 60 * 10, // 10min
    timerId: null,
}

demon.get('/state', (req, res) => {
    res.json({ state: state })
})

demon.get('/start', (req, res) => {
    if (!state.running) {
        state.running = true;
        main();
    }
    res.json({ state: state })
})

demon.get('/stop', (req, res) => {
    state.running = false;
    clearTimeout(state.timerId);
    res.json({ state: state })
})

demon.listen(3001, (err) => {
    if (err) return console.log(err)
    return console.log(`server is listening on 3001`)
})

function main() {
    if (!state.running)
        return;

    var tag = encodeURIComponent(state.tags[Math.floor(Math.random() * 10) % state.tags.length]);

    instagram
        .getNews(`/explore/tags/${tag}/`)
        .then(filter)
        .then(likeAndSubsribe)
        .then(() => state.timerId = setTimeout(main, state.timout)) // recursive call
        .catch(e => {
            console.log(`${new Date().toLocaleString()} got error: `, e);
            state.running = false;
        });
}

function likeAndSubsribe(nodes: Nodee[]) {
    let node = nodes.pop();

    if (!node || !state.running)
        return new Promise(resolve => resolve());

    return instagram
        .like(node.node.id)
        .then(pause2_6k)
        .then(r =>
            instagram.subscribe(node.node.owner.id))
        .then(pause2_6k)
        .then(r =>
            db.users.create(new User(+node.node.owner.id, + new Date(), 1)))
        .then(r => likeAndSubsribe(nodes)); // recursive call
}

function pause2_6k() {
    return new Promise(function (resolve, reject) {
        setTimeout(() => resolve('pause done!'), Math.max(2000, (Math.random() * 6000)));
    });
}

function filter(data: InstaResp) {
    let ids = data.graphql.hashtag.edge_hashtag_to_media.edges.map(node => +node.node.owner.id);

    return db.users
        .findAll({ attributes: ['id'], where: { id: { $in: ids } }, raw: true })
        .then((toExlude: { id: number }[]) => {
            //filter subscribed
            let ignore = toExlude.map(x => x.id);
            let nodes: Nodee[] = data.graphql.hashtag.edge_hashtag_to_media.edges
                .filter(node => !~ignore.indexOf(+node.node.owner.id));
            //filter duplicates
            let seen: Set<number> = new Set();
            nodes = nodes.filter(node =>
                seen.has(+node.node.owner.id) ? false : !!(seen.add(+node.node.owner.id))
            );

            return new Promise<Nodee[]>(resolve => resolve(nodes));
        });
}