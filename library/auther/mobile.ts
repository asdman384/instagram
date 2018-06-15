import { Instagram } from "../../infrastructure/instagram";

let login = process.argv[2];
let passw = process.argv[3];

let instagram = new Instagram();
instagram
    .auth(login, passw)
    .then(console.log)
    .catch(console.log);