const statRoutes = require('./stat_routes');
const rootRoutes = require('./root_routes');
module.exports = function(app, db) {
    statRoutes(app, db);
    rootRoutes(app, db);    
};