"use strict";
exports.__esModule = true;
var instagram_1 = require("../../infrastructure/instagram");
var login = process.argv[2];
var passw = process.argv[3];
var instagram = new instagram_1.Instagram();
instagram
    .auth(login, passw)
    .then(console.log)["catch"](console.log);
