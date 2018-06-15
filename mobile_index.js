"use strict";
exports.__esModule = true;
var bot_1 = require("./infrastructure/bot");
var bot = new bot_1.Bot('db.json', 'cookies').init();
if (process.argv[2])
    bot.startFollow();
if (process.argv[3])
    bot.startUnFollow();
