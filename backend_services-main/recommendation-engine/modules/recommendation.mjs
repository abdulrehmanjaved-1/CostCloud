import { getNodeStatistics } from './statistics.mjs';
import { systemLog } from './system.mjs';
import * as fn from './functions.mjs';

export const getRecommendation = async function(args) {
    const region = args.cloudRegion.replace(/-/g, '_');
    const field = {
        instance: `${region}_instance`,
        price: `${region}_price`,
        storage: `${region}_storage`,
        transfer: `${region}_transfer`
    };
    
    try {
        const [ stats, tiers ] = await Promise.all([
            getNodeStatistics(args), //we have to specify the prometheusApi, prometheusDuration, prometheusInstance, and prometheusJob adn we will get One node stats 
            fn.getTiers(region) //data coming in array format as put in costcloud notes after test suing curl
        ]);
        //folowing is matching the stats with the tiers
        const tier = {
            disk: fn.arrayClosetMatch(tiers.disk, stats.disk.maxMbps),
            gpus: fn.arrayClosetMatch(tiers.gpus, args.gpus),
            network: fn.arrayClosetMatch(tiers.network, stats.network.maxMbps),
            vcpu: fn.arrayClosetMatch(tiers.vcpu, stats.cpu.total)
        };
        //following is the recommeded object but some properties are missing like instance type, duration, diskType
        const instance = {
            arch: fn.setArchitecture(stats.cpu.arch),
            family: fn.setFamily(stats, args.gpus),
            diskIops: tier.disk.value,
            gpus: tier.gpus.value,
            memory: stats.memory.totalGiB,
            networkMbps: tier.network.value,
            nvme: stats.disk.nvme,
            region: region,
            speed: fn.setSpeed(stats.cpu.model),
            tenancy: args.tenancy,
            os: fn.setOperatingSystem(stats.os.type),
            vcpu: tier.vcpu.value
        };
        //checking if the instance is valid,if true then return
        if (!fn.validateInstance(instance)) {
            return;
        }
        //setting the instance type...why we are giving all tiers as parameters to this function? because we need to find the instance type based on the tiers available
        instance.type = await fn.findInstanceType(field.instance, instance, tiers, tier);
        
        if (!instance.type) {
            return;
        }
        
        instance.duration = fn.convertDurationToHours(args.prometheusDuration);
        instance.diskType = await fn.setDiskType(stats.disk, region);
        
        const instances = (await fn.getInstance(args, stats, tiers, instance)).map(function(instance) {
            return {
                cpu: {
                    architecture: instance.architecture,
                    processor: instance.processor,
                    speed: instance.speed,
                    vCPU: instance.vcpu
                },
                baremetal: instance.bare_metal,
                cost: instance.cost,
                date: instance.date,
                disk: {
                    iops: instance.disk_io,
                    totalGiB: instance.cost.disk.sizeGB.provisioned,
                    type: instance.cost.disk.type
                },
                family: instance.family,
                gpus: instance.gpus,
                memory: {
                    totalGiB: instance.memory
                },
                network: {
                    throughputMbps: instance.network_io
                },
                os: instance.os,
                software: instance.software,
                statistics: stats,
                tenancy: instance.tenancy,
                type: instance.type
            };
        });
        
        return instances;
    } catch (error) {
        systemLog(error);
        return;
    }
};