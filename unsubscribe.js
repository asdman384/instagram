const instagram = require('./lib/instagram');
const db = require('./db');
instagram.debug = false;

db
.init()
.then(main)
.catch(err => console.error('Unable to connect to the database:', err));

const oneFollowedOldest = {where: {follow: 1}, limit: 1, order: [['datetime', 'ASC']]};

function main() {
    db.Users.findAll(oneFollowedOldest)
    .then(user => {
        instagram.unsubscribe(user[0].id)
        .then(resp => {            
            user[0].update({follow : 0})
            .then(() => setTimeout(main, 1000*60*3)) // recursive call
        });  
    });
}
