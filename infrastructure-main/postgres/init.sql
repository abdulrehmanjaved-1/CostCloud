DROP DATABASE IF EXISTS aws WITH (FORCE);
CREATE DATABASE aws;

\c aws

CREATE TABLE us_east_1_instance (
    sku CHARACTER VARYING(16) PRIMARY KEY,
    family CHARACTER VARYING(32) NOT NULL,
    type CHARACTER VARYING(32) NOT NULL,
    bare_metal BOOLEAN NOT NULL,
    processor CHARACTER VARYING(128) NOT NULL,
    architecture CHARACTER VARYING(8) NOT NULL,
    speed FLOAT NOT NULL,
    vcpu SMALLINT NOT NULL,
    memory FLOAT NOT NULL,
    storage CHARACTER VARYING(32) NOT NULL,
    disk_io INTEGER NOT NULL,
    network_io INTEGER NOT NULL,
    gpus INTEGER NOT NULL,
    os CHARACTER VARYING(32) NOT NULL,
    software CHARACTER VARYING(128) NOT NULL,
    tenancy CHARACTER VARYING(16) NOT NULL,
    usage CHARACTER VARYING(64) NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE us_east_1_storage (
    sku CHARACTER VARYING(16) PRIMARY KEY,
    name CHARACTER VARYING(8) NOT NULL,
    volume_type CHARACTER VARYING(32) NOT NULL,
    media_type CHARACTER VARYING(16) NOT NULL,
    group_name CHARACTER VARYING(32) NOT NULL,
    description CHARACTER VARYING(32) NOT NULL,
    max_size INTEGER NOT NULL,
    max_iops INTEGER NOT NULL,
    max_mbps FLOAT NOT NULL,
    usage CHARACTER VARYING(64) NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE us_east_1_on_demand (
    sku CHARACTER VARYING(16) PRIMARY KEY,
    term_code CHARACTER VARYING(16) NOT NULL,
    rate_code CHARACTER VARYING(80) NOT NULL,
    description CHARACTER VARYING(256) NOT NULL,
    unit CHARACTER VARYING(8) NOT NULL,
    unit_price FLOAT NOT NULL,
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL
);


-- Note: azure schema is the following:

-- Drop the database if it exists
DROP DATABASE IF EXISTS azure WITH (FORCE);

-- Create a new database for Azure
CREATE DATABASE azure;

-- Switch to the Azure database
\c azure

-- Create the table to store Azure pricing information
CREATE TABLE azure_southindia_pricing (
    id SERIAL PRIMARY KEY,
    meter_id UUID NOT NULL,
    billing_currency VARCHAR(8) NOT NULL,
    customer_entity_id VARCHAR(32) NOT NULL,
    customer_entity_type VARCHAR(16) NOT NULL,
    currency_code VARCHAR(8) NOT NULL,
    tier_minimum_units INTEGER NOT NULL,
    retail_price FLOAT NOT NULL,
    unit_price FLOAT NOT NULL,
    arm_region_name VARCHAR(32) NOT NULL,
    location VARCHAR(64) NOT NULL,
    effective_start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    meter_name VARCHAR(64) NOT NULL,
    product_id VARCHAR(32) NOT NULL,
    sku_id VARCHAR(64) NOT NULL,
    product_name VARCHAR(128) NOT NULL,
    sku_name VARCHAR(64) NOT NULL,
    service_name VARCHAR(128) NOT NULL,
    service_id VARCHAR(32) NOT NULL,
    service_family VARCHAR(64) NOT NULL,
    unit_of_measure VARCHAR(16) NOT NULL,
    type VARCHAR(32) NOT NULL,
    is_primary_meter_region BOOLEAN NOT NULL,
    arm_sku_name VARCHAR(64) NOT NULL,
    UNIQUE(meter_id, effective_start_date, unit_price, type)
);
