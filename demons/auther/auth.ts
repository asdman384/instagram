import * as express from 'express';
import * as parser from 'body-parser';
import * as fs from "fs";

let demon = express();
demon.use(parser.json()); // for parsing application/json
demon.post('/login', function (req, res) {
    console.log(req.body)

    res.json({success: true});
});

demon.listen(8083, (err) => {
    if (err) return console.log(err)
    return console.log(`server is listening on 8083`)
})