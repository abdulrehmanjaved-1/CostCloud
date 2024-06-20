import fs from 'fs';
import Sequelize from 'sequelize';
import { logSQL, postgres } from './constants.mjs';
import { sqlLog } from './system.mjs';

const language = 'postgresql';

const options = {
    database: postgres.database,
    dialect: 'postgres',
    dialectOptions: {
        keepAlive: true,
        ...(postgres.ssl && {
            ssl: {
                ca: fs.readFileSync(postgres.ca) }
            })
    },
    host: postgres.host,
    password: postgres.password,
    port: postgres.port,
    schema: postgres.schema,
    username: postgres.username
};

const pool = {
    acquire: 10000,
    idle: 300000,
    max: 5,
    min: 1
};

export const sequelize = new Sequelize({...options, ...{
    define: {
        freezeTableName: true,
        timestamps: false
    },
    logging: function(sql, options) {
        if (logSQL) {
            const regex = /^.*?:.*?\s/;
            sqlLog(sql.replace(regex, ''), options.bind, language);
        }
    },
    logQueryParameters: false,
    pool
}});

export default sequelize;