import fetch from 'node-fetch';
import pkg from 'pg';
const { Client } = pkg;

// Function to fetch data from the Azure API
async function fetchAzurePricing() {
    const response = await fetch('https://prices.azure.com/api/retail/prices?api-version=2023-01-01-preview&meterRegion=primary');
    const data = await response.json();
    return data.Items;
}

// Function to insert data into PostgreSQL
async function insertDataIntoPostgres(items) {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'azure',
        password: 'pgpassword',
        port: 5432,
    });

    await client.connect();

    const query = `
        INSERT INTO azure_southindia_pricing (
            meter_id, billing_currency, customer_entity_id, customer_entity_type, currency_code,
            tier_minimum_units, retail_price, unit_price, arm_region_name, location,
            effective_start_date, meter_name, product_id, sku_id, product_name,
            sku_name, service_name, service_id, service_family, unit_of_measure,
            type, is_primary_meter_region, arm_sku_name
        ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15,
            $16, $17, $18, $19, $20,
            $21, $22, $23
        )
        ON CONFLICT (meter_id, effective_start_date, unit_price, type) DO NOTHING;
    `;

    try {
        for (const item of items) {
            if (item.armRegionName === 'southindia') {
                await client.query(query, [
                    item.meterId, 'USD', 'Default', 'Retail', item.currencyCode,
                    item.tierMinimumUnits, item.retailPrice, item.unitPrice, item.armRegionName, item.location,
                    item.effectiveStartDate, item.meterName, item.productId, item.skuId, item.productName,
                    item.skuName, item.serviceName, item.serviceId, item.serviceFamily, item.unitOfMeasure,
                    item.type, item.isPrimaryMeterRegion, item.armSkuName
                ]);
            }
        }
    } catch (err) {
        console.error('Error inserting data into PostgreSQL:', err);
    } finally {
        await client.end();
    }
}

// Main function to execute the script
(async () => {
    try {
        const items = await fetchAzurePricing();
        await insertDataIntoPostgres(items);
        console.log('Data inserted successfully');
    } catch (err) {
        console.error('Error:', err);
    }
})();
