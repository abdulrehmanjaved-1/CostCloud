import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core/core.cjs';
import { currency, endpoint } from './constants.mjs';
import { systemLog } from './system.mjs';

const client = new ApolloClient({
    uri: endpoint.metadata,
    cache: new InMemoryCache()
});

const calculateDiskCost = async function(stats, instance) {
    const { diskType, duration, region } = instance;
    const { maxIops, maxMbps, totalGiB } = stats;
    const instanceMonth = duration / 730;
    
    if (diskType === 'gp2') {
        const { price } = (await queryMetadata(diskCostQuery(region, diskType)))[`${region}_storage`][0];
        const { unit, unit_price } = price[0];
        
        return {
            iops: {
                cost: 0,
                total: 0,
                unit: 'NA',
                unitPrice: 0,
            },
            mbps: {
                cost: 0,
                total: 0,
                unit: 'NA',
                unitPrice: 0,
            },
            size: {
                cost: parseFloat((Math.ceil(totalGiB * 1.07374) * unit_price * instanceMonth).toFixed(2)),
                total: Math.ceil(totalGiB * 1.073740),
                unit: unit,
                unitPrice: unit_price
            },
            total: parseFloat((Math.ceil(totalGiB * 1.07374) * unit_price * instanceMonth).toFixed(2)),
            type: diskType
        };
    } else if (diskType === 'gp3') {
        const gp3 = {};
        const price = (await queryMetadata(diskCostQuery(region, diskType)))[`${region}_storage`];
        
        for (let i = 0; i < price.length; i++) {
            const usage = price[i].usage;
            const { unit, unit_price } = price[i].price[0];
            
            if (usage.match(/IOPS/)) {
                gp3.iops = {
                    provisioned: maxIops,
                    total: (maxIops > 3000) ? parseFloat(((maxIops - 3000) * instanceMonth * unit_price).toFixed(2)) : 0,
                    unit: unit,
                    unitPrice: unit_price
                };
            } else if (usage.match(/Throughput/)) {
                gp3.mbps = {
                    provisioned: maxMbps,
                    total: (maxMbps > 1000)? parseFloat(((maxMbps - 1000) / 8192 * instanceMonth * unit_price).toFixed(2)) : 0,
                    unit: unit,
                    unitPrice: unit_price
                };
            } else if (usage.match(/Usage/)) {
                gp3.size = {
                    provisioned: Math.ceil(totalGiB * 1.07374),
                    total: parseFloat(((Math.ceil(totalGiB * 1.07374) * unit_price * instanceMonth).toFixed(2))),
                    unit: unit,
                    unitPrice: unit_price
                };
            }
        }
        
        gp3.total = gp3.iops.total + gp3.mbps.total + gp3.size.total;
        gp3.type = diskType;
        return gp3;
    }
    
    return;
};

const calculateTransferCost = async function(tiers, total) {
    let price = 0;
    for (const { limit, unitPrice } of tiers.transfer) {
        if (total < limit) {
            price += total * unitPrice;
            break;
        } else {
            price += limit * unitPrice;
            total -= limit;
        }
    }
    
    return parseFloat((price).toFixed(2));
};

const diskCostQuery = function(region, type) {
    return gql`
        query getDiskCost {
            ${region}_storage(where: {
                name: {_eq: "${type}"}
            }) {
                name
                usage
                price {
                    description
                    unit
                    unit_price
                }
            }
        }
    `;
};

const diskTypeQuery = function(region) {
    return gql`
        query getDisk {
            ${region}_storage(where: {
                name: {_like: "gp%"},
                volume_type: {_eq: "General Purpose"}
            }) {
                name
                max_size
                max_iops
                max_mbps
                price {
                    unit
                    unit_price
                }
            }
        }
    `;
};

const instanceQuery = function(instance) {
    return gql`
        query getInstance {
            ${instance.region}_instance(where: {
                os: {_eq: "${instance.os}"},
                software: {_eq: "NA"},
                tenancy: {_eq: "${instance.tenancy}"},
                type: {_eq: "${instance.type}"}
                usage: {_niregex: "(Unused|Reservation)"}
                price: { unit_price: {_gt: 0} }
            }) {
                architecture
                bare_metal
                date
                disk_io
                family
                gpus
                memory
                network_io
                os
                price {
                    unit
                    unit_price
                    description
                }
                processor
                software
                speed
                tenancy
                type
                vcpu
            }
        }
    `;
};

const instanceTypeQuery = function(instance) {
    return gql`
        query getInstanceTypes {
            ${instance.region}_instance(distinct_on: type, where: {
                architecture: {_eq: "${instance.arch}"},
                disk_io: {_eq: ${instance.diskIops}},
                family: {_eq: "${instance.family}"},
                gpus: {${instance.family === 'GPU Instance' ? '_gte' : '_eq'}: ${instance.gpus}},
                memory: {_gte: ${instance.memory}},
                network_io: {_eq: ${instance.networkMbps}},
                speed: {_gte: ${instance.speed}},
                vcpu: {_gte: ${instance.vcpu}}
            }) {
                type
            }
        }
    `;
};

const queryMetadata = async function(query) {
    try {
        const result = await client.query({ query: query });
        return result.data;
    } catch (error) {
        systemLog(error);
        return;
    }
};

export const arrayClosetMatch = function(array, target) {
    array.sort((a, b) => a - b);
    
    for (let i = 0; i < array.length; i++) {
        if (target <= array[i]) {
            return { value: array[i], index: i };
        } else if (target > [i] && target <= array[i+1]) {
            return { value: array[i+1], index: i+1 };
        }
    }
    
    return { values: null, index: -1 };
};

export const arrayMaxValue = function(array) {
    const { value, index } = array.reduce(function(acc, cur, idx) {
        if (cur > acc.value) {
            return { value: cur, index: idx };
        }
        return acc;
    }, { value: array[0], index: 0 });
    
    return { value, index };
};

export const convertDurationToHours = function(string) {
    const [, number, unit] = string.match(/^(\d+)([hdwy]{1})$/);
    const factor = { h: 1, d: 24, w: 168, y: 8760 };
    return factor ? parseInt(number * factor[unit]) : null;
};

export const findInstanceType = async function(field, instance, tiers, init) {
    const types = (await queryMetadata(instanceTypeQuery(instance)))[field].map(function(instance) {
        return instance.type;
    });
    
    /* increase disk iops */
    if (types.length === 0) {
        for (let i = init.disk.index + 1; i < tiers.disk.length; i++) {
            instance.diskIops = tiers.disk[i];
            const types = (await queryMetadata(instanceTypeQuery(instance)))[field].map(function(instance) {
                return instance.type;
            });
            
            if (types.length === 1) {
                return types[0];
            }
        }
        
        /* reset disk iops */
        instance.diskIops = init.disk.value;
    }
    
    /* increase network mbps */
    if (types.length === 0) {
        for (let i = init.network.index + 1; i < tiers.network.length; i++) {
            instance.networkMbps = tiers.network[i];
            const types = (await queryMetadata(instanceTypeQuery(instance)))[field].map(function(instance) {
                return instance.type;
            });
            
            if (types.length === 1) {
                return types[0];
            }
        }
        
        /* reset network mbps */
        instance.networkMbps = init.network.value;
    }
    
    /* increase disk iops */
    if (types.length === 0) {
        for (let i = init.disk.index + 1; i < tiers.disk.length; i++) {
            instance.diskIops = tiers.disk[i];
            const types = (await queryMetadata(instanceTypeQuery(instance)))[field].map(function(instance) {
                return instance.type;
            });
            
            /* increase network mbps */
            if (types.length === 0) {
                for (let i = init.network.index + 1; i < tiers.network.length; i++) {
                    instance.networkMbps = tiers.network[i];
                    const types = (await queryMetadata(instanceTypeQuery(instance)))[field].map(function(instance) {
                        return instance.type;
                    });
                    
                    if (types.length === 1) {
                        return types[0];
                    }
                }
                
                /* reset network mbps */
                instance.networkMbps = init.network.value;
            } else if (types.length === 1) {
                return types[0];
            }
        }
    }
    
    return;
};

export const getInstance = async function(args, stats, tiers, instance) {
    try {
        const { duration, region } = instance;
        const [instances, disk, transfer] = await Promise.all([
            queryMetadata(instanceQuery(instance)), //prividing the instance that we have got recommended
            calculateDiskCost(stats.disk, instance),
            calculateTransferCost(tiers, stats.network.sentGB)
        ]);
        
        return instances[`${region}_instance`].map(function(item) {
            const { unit, unit_price } = item.price[0];
            const instanceTotal = duration * unit_price;

            return {
                ...item,
                cost: {
                    currency: currency,
                    disk: {
                        iops: disk.iops,
                        sizeGB: disk.size,
                        throughputMbps: disk.mbps,
                        total: disk.total,
                        type: disk.type
                    },
                    duration: args.prometheusDuration,
                    instance: {
                        total: parseFloat(instanceTotal.toFixed(2)),
                        unit: unit,
                        unitPrice: unit_price
                    },
                    network: {
                        receivedGB: stats.network.recvGB,
                        sentGB: stats.network.sentGB,
                        total: transfer,
                        unit: 'GB'
                    },
                    total: parseFloat((disk.total + instanceTotal + transfer).toFixed(2))
                }
            };
        });
    } catch (error) {
        systemLog(error);
        return;
    }
};

export const getTiers = async function(region) {
    try {
        const result = await client.query({
            query: gql`
                query getValues {
                    disk: ${region}_instance(distinct_on: disk_io) {
                        disk_io
                    }
                    gpus: ${region}_instance(distinct_on: gpus) {
                        gpus
                    }
                    network: ${region}_instance(distinct_on: network_io) {
                        network_io
                    }
                    transfer: ${region}_transfer(where: {usage: {_eq: "DataTransfer-Out-Bytes"}}) {
                        price { description unit unit_price }
                    }
                    vcpu: ${region}_instance(distinct_on: vcpu) {
                        vcpu
                    }
                }
            `
        });
        
        return {
            disk: result.data.disk.map(tier => tier.disk_io),
            gpus: result.data.gpus.map(tier => tier.gpus),
            network: result.data.network.map(tier => tier.network_io),
            transfer: parseTransferTiers(result.data.transfer[0].price),
            vcpu: result.data.vcpu.map(tier => tier.vcpu)
        };
    } catch (error) {
        systemLog(error);
        return;
    }
};

const parseTransferTiers = function(tiers) {
    return tiers.map(function(tier) {
        const [, limit] = tier.description.match(/(\d+)\s+TB/);
        return { limit: limit * 1024, unit: tier.unit, unitPrice: parseFloat(tier.unit_price) };
    });
};

export const setArchitecture = function(string) {
    if (string.match(/^(i686|x86_64$)/)) {
        return 'x86_64';
    } else if (string.match(/^arm$/)) {
        return 'arm';
    } else if (string.match(/^i386$/)) {
        return 'i386';
    } else {
        return 'arm64';
    }
};

export const setDiskType = async function(stats, region) {
    const disk = {
        gp2: { iops: null, mbps: null, size: null },
        gp3: { iops: null, mbps: null, size: null }
    };
    
    (await queryMetadata(diskTypeQuery(region)))[`${region}_storage`].forEach(function(type) {
        const { name, max_iops, max_mbps, max_size } = type;
        disk[name] = { iops: max_iops, mbps: max_mbps, size: max_size };
    });
    
    if (stats.maxIops < 3000 && stats.maxMbps < 1000) {
        return 'gp3';
    } else if (stats.maxMbps < 2000) {
        return 'gp2';
    } else {
        return 'gp3';
    }
};

export const setFamily = function(stats, gpus) {
    const score = {
        'Compute Optimized': stats.cpu.avgUtil / stats.cpu.maxUtil,
        'Memory Optimized': stats.memory.avgUtil / stats.memory.maxUtil,
        'Storage Optimized': stats.disk.avgMbps / stats.disk.maxMbps
    };
    
    const family = Object.keys(score);
    const scores = Object.values(score);
    
    if (gpus > 0) {
        return 'GPU Instance';
    } else if (arrayMaxValue(scores).value > 0.25)
        return family[arrayMaxValue(scores).index];
    else {
        return 'General Purpose';
    }
};

export const setOperatingSystem = function(string) {
    if (string.match(/Red Hat/i)) {
        return 'RHEL';
    } else if (string.match(/SUSE/i)) {
        return 'SUSE';
    } else if (string.match(/Ubuntu/i)) {
        return 'Ubuntu';
    } else if (string.match(/Windows/i)) {
        return 'Windows';
    } else {
        return 'Linux';
    }
};

export const setSpeed = function(string) {
    const match = string ? string.match(/(\d+(?:\.\d+)?)\s*GHz/) : undefined;
    return match ? parseFloat(match[1]) : 0;
};

export const validateInstance = function(object) {
    for (const key in object) {
        if (object[key] === null || object[key] === undefined) {
            return false;
        }
    }
    
    return true;
};