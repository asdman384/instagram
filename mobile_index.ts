import { Bot } from "./infrastructure/bot";

let bot = new Bot('db.json', 'cookies').init();

if (!!+process.argv[2])
    bot.startFollow();

if (!!+process.argv[3])
    bot.startUnFollow();