const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const db = require('./db');
const port = 80;
// db.connection.options.logging = console.log;
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('./public'));
app.set('views', './views');
app.set('view engine', 'ejs');
// console.dir(db.connection);
db
.init()
.then(() => {
    console.log('database.sqlite has been established successfully.');
    app.listen(port, () => console.log(new Date().toLocaleString(), 'We are live on', port));
})
.catch(err => console.error('Unable to connect to the database:', err));

require('./routes')(app, db);
