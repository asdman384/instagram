const Sequelize = require('sequelize'); // http://docs.sequelizejs.com/manual/tutorial/raw-queries.html
const sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  pool: {    max: 5,    min: 0,    idle: 10000  },
  storage: 'database.sqlite'
});

const Users = sequelize.define('users', {
        id:         { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true },
        datetime:   { type: Sequelize.INTEGER, allowNull: false},
        follow :    { type: Sequelize.INTEGER, allowNull: false}
    }, { timestamps: false }
);

module.exports = {
    Users: Users,
    init: () => sequelize.authenticate(),
    connection: sequelize
}
