"use strict";
exports.__esModule = true;
var Sequelize = require("sequelize");
var DataBase = /** @class */ (function () {
    function DataBase(conf) {
        this.userCols = {
            id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true },
            datetime: { type: Sequelize.INTEGER, allowNull: false },
            follow: { type: Sequelize.INTEGER, allowNull: false }
        };
        this.connection = new Sequelize(conf.database, conf.user, conf.password, {
            host: conf.host,
            dialect: 'mysql',
            logging: false,
            pool: { max: 5, min: 0, idle: 10000 }
        });
        this.connection.authenticate();
        this.users = this.connection.define('users', this.userCols, { timestamps: false });
    }
    return DataBase;
}());
exports.DataBase = DataBase;
var User = /** @class */ (function () {
    function User(id, dt, f) {
        this.id = id;
        this.datetime = dt;
        this.follow = f;
    }
    return User;
}());
exports.User = User;
