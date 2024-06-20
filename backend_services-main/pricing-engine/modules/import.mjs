import * as model from './models.mjs';
import { systemLog, toUpperWord } from './system.mjs';

const models = {
    'us-east-1': {
        instance: model.us_east_1_instance,
        price: model.us_east_1_price,
        storage: model.us_east_1_storage,
        transfer: model.us_east_1_transfer
    }
};

const findSku = async function(model, sku) {
    try {
        return await model.findByPk(sku);
    } catch (error) {
        systemLog(`${error} :: sku ${sku}`);
        return;
    }
};

const setArchitecture = function(processor, arch) {
    const match = processor && arch ? processor.match(/(Apple|Graviton|Variable)/) : undefined;
    return match ? (match[0] === 'Apple') ? 'arm64' :
        (match[0] === 'Graviton') ? (arch.match(/32-bit/)) ? 'arm, arm64' : 'arm64' :
        (match[0] === 'Variable') ? 'i386' : 'x86_64' : 'x86_64';
};

const setClockSpeed = function(string) {
    const match = string ? string.match(/(\d+(?:\.\d+)?)\s*GHz/) : undefined;
    return match ? parseFloat(match[1]) : 0;
};

const setDiskIo = function(string) {
    const match = string ? string.match(/\b(\d+)\s*(Mbps|Gbps)\b/) : undefined;
    return match ? (match[2] === 'Gbps') ? parseInt(match[1] * 1000) : parseInt(match[1]) : 1000;
};

const setStorageMaxIops = function(string) {
    const match = string ? string.match(/(\d+)\s*(?:-\s*(\d+))?/) : undefined;
    return match ? match[2] ? parseInt(match[2]) : parseInt(match[1]) : 0;
};

const setStorageMaxMbps = function(string) {
    const match = string ? string.match(/(\d+)\s*(?:-\s*(\d+))?\s*(MiB|MB)\/s/) : undefined;
    return match ? (match[3] === 'MiB') ? parseFloat((match[1] * 8.79609).toFixed(3)) : parseFloat(match[2] * 8) : 0;
};

const setStorageMaxSize = function(string) {
    const match = string ? string.match(/(\d+)\s+TiB/) : undefined;
    return match ? parseInt(match[1] * 1099.51) : 0;
};

const setNetworkIo = function(string) {
    const match = string ? string.match(/\b(\d+)\s*(Megabit|Gigabit)\b/) : undefined;
    return match ? (match[2] === 'Gigabit') ? parseInt(match[1] * 1000) : parseInt(match[1]) :
        (string.match(/^(Very Low|Low)$/)) ? 50 :
        (string.match(/Moderate/)) ? 300 :
        (string.match(/High/)) ? 1000 : 10000;
};

const upsertInstance = async function(model, data) {
    try {
        return await model.upsert({
            sku: data.sku,
            family: data.family,
            type: data.type,
            bare_metal: data.bareMetal,
            processor: data.processor,
            architecture: data.architecture,
            speed: data.speed,
            vcpu: data.vcpu,
            memory: data.memory,
            storage: data.storage,
            disk_io: data.diskIo,
            network_io: data.networkIo,
            gpus: data.gpus,
            os: data.os,
            software: data.software,
            tenancy: data.tenancy,
            usage: data.usage,
            date: data.date
        }).then(function() {
            return true;
        });
    } catch (error) {
        systemLog(`${error} :: sku ${data.sku}`);
        return;
    }
};

const upsertPrice = async function(model, data) {
    try {
        return await model.upsert({
            rate_code: data.rateCode,
            term_code: data.termCode,
            sku: data.sku,
            description: data.description,
            unit: data.unit,
            unit_price: data.unitPrice,
            contract: data.contract,
            purchase_option: data.purchaseOption,
            offering_class: data.offeringClass,
            date: data.date
        }).then(function() {
            return true;
        });
    } catch (error) {
        systemLog(`${error} :: sku ${data.sku}`);
        return;
    }
};

const upsertStorage = async function(model, data) {
    try {
        return await model.upsert({
            sku: data.sku,
            name: data.name,
            volume_type: data.volumeType,
            media_type: data.mediaType,
            group_name: data.group,
            description: data.description,
            max_size: data.maxSize,
            max_iops: data.maxIops,
            max_mbps: data.maxMbps,
            usage: data.usage,
            date: data.date
        }).then(function() {
            return true;
        });
    } catch (error) {
        systemLog(`${error} :: sku ${data.sku}`);
        return;
    }
};

const upsertTransfer = async function(model, data) {
    try {
        return await model.upsert({
            sku: data.sku,
            type: data.type,
            from_location: data.fromLocation,
            from_region: data.fromRegion,
            from_type: data.fromType,
            to_location: data.toLocation,
            to_region: data.toRegion,
            to_type: data.toType,
            operation: data.operation,
            usage: data.usage,
            date: data.date
        }).then(function() {
            return true;
        });
    } catch (error) {
        systemLog(`${error} :: sku ${data.sku}`);
        return;
    }
};

export const importInstance = async function(data, region, date) {
    let records = Object.keys(data).length;
    
    for (const sku in data) {
        const family = data[sku].productFamily;
        const currentGeneration = data[sku].attributes.currentGeneration;
        
        if (family.match(/^Compute Instance/) && currentGeneration !== 'No') {
            const instance = {
                architecture: setArchitecture(data[sku].attributes.physicalProcessor, data[sku].attributes.processorArchitecture),
                bareMetal: data[sku].attributes.instanceType.match(/\.metal/) ? true : false,
                date: date,
                diskIo: setDiskIo(data[sku].attributes.dedicatedEbsThroughput),
                family: toUpperWord(data[sku].attributes.instanceFamily),
                gpus: parseInt(data[sku].attributes.gpu) || 0,
                memory: parseFloat(data[sku].attributes.memory.replace(/ GiB/, '')) || 0,
                networkIo: setNetworkIo(data[sku].attributes.networkPerformance),
                os: data[sku].attributes.operatingSystem,
                processor: data[sku].attributes.physicalProcessor,
                sku: sku,
                software: data[sku].attributes.preInstalledSw,
                speed: setClockSpeed(data[sku].attributes.clockSpeed),
                storage: data[sku].attributes.storage,
                tenancy: data[sku].attributes.tenancy,
                type: data[sku].attributes.instanceType,
                usage: data[sku].attributes.usagetype,
                vcpu: parseInt(data[sku].attributes.vcpu)
            };
            
            if (!(await upsertInstance(models[region].instance, instance))) {
                console.log(instance);
                process.exit(0);
            }
        }
        
        console.log(`Records Remaining: ${records}`);
        records--;
    }
    
    console.log(`Finished...\n`);
};

export const importPrice = async function(data, region, type) {
    let records = Object.keys(data).length;
    
    const model = {
        instance: models[region].instance,
        storage: models[region].storage,
        transfer: models[region].transfer
    };
    
    for (const sku in data) {
        if (await findSku(model[type], sku)) {
            const offerId = Object.keys(data[sku])[0];
            
            for (const dimension of Object.keys(data[sku][offerId].priceDimensions)) {
                const rateCode = data[sku][offerId].priceDimensions[dimension].rateCode;
                const price = {
                    contract: data[sku][offerId].termAttributes.LeaseContractLength || 'NA',
                    date: data[sku][offerId].effectiveDate,
                    description: data[sku][offerId].priceDimensions[rateCode].description,
                    offeringClass: data[sku][offerId].termAttributes.OfferingClass || 'NA',
                    purchaseOption: data[sku][offerId].termAttributes.PurchaseOption || 'NA',
                    rateCode: rateCode,
                    sku: sku,
                    termCode: data[sku][offerId].offerTermCode,
                    unit: data[sku][offerId].priceDimensions[rateCode].unit,
                    unitPrice: parseFloat(data[sku][offerId].priceDimensions[rateCode].pricePerUnit.USD),
                };
                
                if (!(await upsertPrice(models[region].price, price))) {
                    console.log(price);
                    process.exit(0);
                }
            }
        }
        
        console.log(`Records Remaining: ${records}`);
        records--;
    }

    console.log(`Finished...\n`);
};

export const importStorage = async function(data, region, date) {
    let records = Object.keys(data).length;
    
    for (const sku in data) {
        const family = data[sku].productFamily;
        
        if (family.match(/^(Provisioned Throughput|Storage|System Operation)$/)) {
            const storage = {
                date: date,
                description: data[sku].attributes.groupDescription || 'N/A',
                group: data[sku].attributes.group || 'NA',
                maxIops: setStorageMaxIops(data[sku].attributes.maxIopsvolume),
                maxMbps: setStorageMaxMbps(data[sku].attributes.maxThroughputvolume),
                maxSize: setStorageMaxSize(data[sku].attributes.maxVolumeSize),
                mediaType: data[sku].attributes.storageMedia || 'NA',
                name: data[sku].attributes.volumeApiName,
                sku: sku,
                usage: data[sku].attributes.usagetype,
                volumeType: data[sku].attributes.volumeType || 'NA'
            };
            
            if (!(await upsertStorage(models[region].storage, storage))) {
                console.log(storage);
                process.exit(0);
            }
        }
        
        console.log(`Records Remaining: ${records}`);
        records--;
    }
    
    console.log(`Finished...\n`);
};

export const importTransfer = async function(data, region, date) {
    let records = Object.keys(data).length;
    
    for (const sku in data) {
        const transfer = {
            date: date,
            fromLocation: data[sku].attributes.fromLocation,
            fromRegion: data[sku].attributes.fromRegionCode || 'NA',
            fromType: data[sku].attributes.fromLocationType,
            sku: sku,
            toLocation: data[sku].attributes.toLocation,
            toRegion: data[sku].attributes.toRegionCode || 'NA',
            toType: data[sku].attributes.toLocationType,
            type: data[sku].attributes.transferType,
            operation: data[sku].attributes.operation || 'NA',
            usage: data[sku].attributes.usagetype
        };
        
        if (!(await upsertTransfer(models[region].transfer, transfer))) {
            console.log(transfer);
            process.exit(0);
        }
        
        console.log(`Records Remaining: ${records}`);
        records--;
    }
    
    console.log(`Finished...\n`);
};