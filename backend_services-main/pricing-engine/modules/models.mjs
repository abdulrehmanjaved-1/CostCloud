import { DataTypes } from 'sequelize';
import sequelize from './database.mjs';

export const us_east_1_instance = sequelize.define('us_east_1_instance', {
    sku: {
        type: DataTypes.STRING(16),
        primaryKey: true,
        allowNull: false
    },
    family: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    bare_metal: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    processor: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    architecture: {
        type: DataTypes.STRING(8),
        allowNull: false
    },
    speed: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    vcpu: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    memory: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    storage: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    disk_io: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    network_io: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    gpus: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    os: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    software: {
        type: DataTypes.STRING(128),
        allowedNull: false
    },
    tenancy: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    usage: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
});

export const us_east_1_storage = sequelize.define('us_east_1_storage', {
    sku: {
        type: DataTypes.STRING(16),
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(8),
        allowNull: false
    },
    volume_type: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    media_type: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    group_name: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    max_size: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    max_iops: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    max_mbps: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    usage: {
        type: DataTypes.STRING(64),
        allowNull: false
    }
});

export const us_east_1_price = sequelize.define('us_east_1_price', {
    rate_code: {
        type: DataTypes.STRING(128),
        primaryKey: true,
        allowNull: false
    },
    term_code: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    sku: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    description: {
        type: DataTypes.STRING(256),
        allowNull: false
    },
    unit: {
        type: DataTypes.STRING(8),
        allowNull: false
    },
    unit_price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    contract: {
        type: DataTypes.STRING(8),
        allowNull: false
    },
    purchase_option: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    offering_class: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    date : {
        type: DataTypes.DATE,
        allowNull: false
    }
});

export const us_east_1_transfer = sequelize.define('us_east_1_transfer', {
    sku: {
        type: DataTypes.STRING(16),
        primaryKey: true,
        allowNull: false
    },
    type: {
        type: DataTypes.STRING(128),
        allowNull: false
    },
    from_location: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    from_region: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    from_type: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    to_location: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    to_region: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    to_type: {
        type: DataTypes.STRING(32),
        allowNull: false
    },
    operation: {
        type: DataTypes.STRING(16),
        allowNull: false
    },
    usage: {
        type: DataTypes.STRING(64),
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    }
});