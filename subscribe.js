const instagram = require('./lib/instagram');
const db = require('./db');
instagram.debug = false;

var tags = ['севастополь', 'sevastopol', 'sebastopol'];

db
.init()
.then(main)
.catch(err => console.error('Unable to connect to the database:', err));

function main() {    
    var tag = encodeURIComponent(tags[Math.floor(Math.random()*10) % tags.length]);
    
    instagram
    .getNews(`/explore/tags/${tag}/`)
    .then(filter)
    .then(data => new Promise(resolve => resolve(likeAndSubsribe(data, []))))
    .then(toSave => db.Users.bulkCreate(toSave))
    .then(() => setTimeout(main, 1000*60*10)) // recursive call
    .catch(e => {
	    console.log(`${new Date().toLocaleString()} got error: `, e);
        if (e.type === 'auth error') {
            throw 'auth error'
        }
        setTimeout(main, 1000*60*10);
    });    
}

function likeAndSubsribe(nodes, toSave) { 
    
    var node = nodes.pop();

    if(!node) return toSave;

    return instagram.like(node.id)
            .then(resp => {        
                return instagram.subscribe(node.owner.id)
                .then(resp => {            
                    toSave.push({
                        id: node.owner.id, 
                        datetime: + new Date(),
                        follow: 1
                    });
                    return likeAndSubsribe(nodes, toSave);
                });
            });
}

function filter(data) {    
    
    var ids = data.entry_data.TagPage[0].tag.media.nodes
                .reduce((r, node) => { r.push(+node.owner.id); return r; }, []);   

    return db.Users.findAll({attributes: ['id'],where: { id: { $in: ids } },raw: true})
            .then(toExlude => {
                //filter subscribed
                var nodes = data.entry_data.TagPage[0].tag.media.nodes
                            .filter(node => !toExlude.find(ex => ex.id == node.owner.id));
                //filter duplicates
                var seen = {};
                nodes = nodes.filter(item => seen.hasOwnProperty(item.owner.id) ? false : (seen[item.owner.id] = true));
                
                return new Promise(resolve => resolve(nodes));
            }); 
}
