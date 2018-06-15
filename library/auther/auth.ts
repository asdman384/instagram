import * as express from 'express';
import * as parser from 'body-parser';
import * as fs from "fs";
import { Instagram } from '../../infrastructure/instagram';

let demon = express();
demon.use(parser.json()); // for parsing application/json


demon.post('/login', function (req, res) {
    let instagram = new Instagram();
    instagram
        .auth(req.body.login, req.body.password)
        .then(result => res.json(JSON.parse(result)))
        .catch(res.send);
});

demon.get('/logout', (req, res) => {
    fs.unlink('cookies', () => { })
    res.json({ status: !fs.existsSync('cookies') })
})

demon.listen(8083, (err) => {
    if (err) return console.log(err)
    return console.log(`auther is listening on 8083`)
})