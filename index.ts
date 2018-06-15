import * as express from 'express';
import * as util from "util";
import { Bot } from './infrastructure/bot';
import * as stringify from 'json-stringify-safe';


let demon = express();
let bot = new Bot('db.json', 'cookies').init();

demon.get('/state', (req, res) => {
    res.send(stringify(bot.state, null, 2));
})
demon.get('/startfollow', (req, res) => {
    res.send(stringify(bot.startFollow(), null, 2));
})
demon.get('/stopfollow', (req, res) => {
    res.send(stringify(bot.stopFollow(), null, 2));
})
demon.get('/startunfollow', (req, res) => {
    res.send(stringify(bot.startUnFollow(), null, 2));
})


demon.listen(8081, (err) => {
    if (err) return console.log(err);
    return console.log(`subscriber is listening on 8081`, "go http://localhost:8081/");
})
