import { Instagram } from "./infrastructure/instagram";
import { DataBase } from "./db";

let db = new DataBase();
// let instagram = new Instagram('cookies')

db.users
    .findAll({ attributes: ['id'], where: { id: { $in: [1, 2] } }, raw: true })
    .then(console.log)

// instagram.isDebug = false;

// var tags = ['львов', 'львів', 'lviv', 'lvov'];

// db
// .init()
// .then(main)
// .catch(err => console.error('Unable to connect to the database:', err));

// function main() {    
//     var tag = encodeURIComponent(tags[Math.floor(Math.random()*10) % tags.length]);

//     instagram
//     .getNews(`/explore/tags/${tag}/`)
//     .then(filter)
//     .then(likeAndSubsribe)
//     .then(toSave => db.Users.bulkCreate(toSave))
//     .then(() => setTimeout(main, 1000*60*10)) // recursive call
//     .catch(e => {
// 	    console.log(`${new Date().toLocaleString()} got error: `, e);
//         if (e.type === 'auth error') {
//             throw 'auth error'
//         }
//         setTimeout(main, 1000*60*10);
//     });    
// }

// function likeAndSubsribe(nodes, toSave) { 

//     toSave = toSave || [];
//     var node = nodes.pop();

//     if(!node) return new Promise(resolve => resolve(toSave));

//     return instagram
//     .like(node.id)
//     .then(pause2000)
//     .then(r => instagram.subscribe(node.owner.id))
//     .then(pause2000)
//     .then(r => {        
//         toSave.push({ 
//             id: node.owner.id, 
//             datetime: + new Date(),
//             follow: 1
//         });               
//     })
//     .then(r => likeAndSubsribe(nodes, toSave));    
// }

// function pause2000(){
//     return new Promise(function(resolve, reject) {
//         setTimeout(() => resolve('pause done!'), 2000);
//     });
// }

// function filter(data) {    

//     var ids = data.entry_data.TagPage[0].tag.media.nodes
//                 .reduce((r, node) => { r.push(+node.owner.id); return r; }, []);   

//     return db.Users.findAll({attributes: ['id'],where: { id: { $in: ids } },raw: true})
//             .then(toExlude => {
//                 //filter subscribed
//                 var nodes = data.entry_data.TagPage[0].tag.media.nodes
//                             .filter(node => !toExlude.find(ex => ex.id == node.owner.id));
//                 //filter duplicates
//                 var seen = {};
//                 nodes = nodes.filter(item => seen.hasOwnProperty(item.owner.id) ? false : (seen[item.owner.id] = true));

//                 return new Promise(resolve => resolve(nodes));
//             }); 
// }
