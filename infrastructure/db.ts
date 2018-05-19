import * as Sequelize from 'sequelize'

export class DataBase {
    public users: Sequelize.Model<{}, {}>;
    public connection: Sequelize.Sequelize;

    private userCols: Sequelize.DefineAttributes = {
        id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true },
        datetime: { type: Sequelize.INTEGER, allowNull: false },
        follow: { type: Sequelize.INTEGER, allowNull: false }
    }

    constructor(conf) {

        this.connection = new Sequelize(conf.database, conf.user, conf.password, {
            host: conf.host,
            dialect: 'mysql',
            logging: false,
            pool: { max: 5, min: 0, idle: 10000 },
        });

        this.connection.authenticate();

        this.users = this.connection.define('users', this.userCols, { timestamps: false });
    }

}

export class User {
    
    constructor(id, dt, f) {
        this.id = id;
        this.datetime = dt;
        this.follow = f;
    }

    id: number;
    datetime: number;
    follow: number;
}





