import { Bot } from "./infrastructure/bot";

let bot = new Bot('db.json', 'cookies').init();
bot.startFollow();
bot.startUnFollow();