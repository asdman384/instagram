import * as Sequelize from 'sequelize'

export class DataBase {
    public users: Sequelize.Model<{}, {}>;
    public connection: Sequelize.Sequelize;

    private userCols: Sequelize.DefineAttributes = {
        id: { type: Sequelize.INTEGER, allowNull: false, unique: true, primaryKey: true },
        datetime: { type: Sequelize.INTEGER, allowNull: false },
        follow: { type: Sequelize.INTEGER, allowNull: false }
    }

    constructor() {

        this.connection = new Sequelize('instagram', 'root', 'aspirine1', {
            host: '35.204.83.146',
            dialect: 'mysql',
            logging: false,
            pool: { max: 5, min: 0, idle: 10000 },
        });

        this.connection.authenticate()

        this.users = this.connection.define('users', this.userCols, { timestamps: false });
    }

}







