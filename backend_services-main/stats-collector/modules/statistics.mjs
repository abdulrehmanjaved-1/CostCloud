import querystring from 'querystring';
import { queryResolution, metrics, tls } from './constants.mjs';
import { buildUrl, httpReqBody } from './http.mjs';
import { systemLog } from './system.mjs';

export const buildQuery = function(queries, args, type) {
    return querystring.stringify({ query: queries[type]
        .replace(/\${duration}/g, args.prometheusDuration)
        .replace(/\${instance}/g, args.prometheusInstance)
        .replace(/\${job}/g, args.prometheusJob)
        .replace(/\${queryRes}/g, queryResolution) });
};

export const parseResponse = function(array) {
    const data = { cpu: {}, disk: {}, memory: {}, network:{}, os: {}, timestamp: new Date().toUTCString() };
    
    for (let i = 0; i < array.length; i++) {
        if (Object.prototype.hasOwnProperty.call(array[i], 'data') && array[i].data.status === 'success') {
            switch (metrics[i]) {
                case 'avg_cpu_util':
                    data.cpu.avgUtil = parseFloat(array[i].data.data.result[0].value[1]).toFixed(2);
                    break;
                case 'avg_disk_iops':
                    data.disk.avgIops = Math.round(array[i].data.data.result[0].value[1]);
                    break;
                case 'avg_disk_mbps':
                    data.disk.avgMbps = parseFloat(array[i].data.data.result[0].value[1]).toFixed(3);
                    break;
                case 'avg_memory_util':
                    data.memory.avgUtil = parseFloat(array[i].data.data.result[0].value[1]).toFixed(2);
                    break;
                case 'avg_network_mbps':
                    data.network.avgMbps = parseFloat(array[i].data.data.result[0].value[1]).toFixed(3);
                    break;
                case 'host_info':
                    data.cpu.arch = array[i].data.data.result[1].metric.machine;
                    data.cpu.model = array[i].data.data.result[2].metric.model_name;
                    data.cpu.total = array[i].data.data.result.length - 2;
                    data.os.name = array[i].data.data.result[0].metric.name;
                    data.os.type = array[i].data.data.result[1].metric.sysname;
                    data.os.version = array[i].data.data.result[0].metric.version_id;
                    break;
                case 'max_cpu_util':
                    data.cpu.maxUtil = parseFloat(array[i].data.data.result[0].value[1]).toFixed(2);
                    break;
                case 'max_disk_iops':
                    data.disk.maxIops = Math.round(array[i].data.data.result[0].value[1]);
                    break;
                case 'max_disk_mbps':
                    data.disk.maxMbps = parseFloat(array[i].data.data.result[0].value[1]).toFixed(3);
                    break;
                case 'max_memory_util':
                    data.memory.maxUtil = parseFloat(array[i].data.data.result[0].value[1]).toFixed(2);
                    break;
                case 'max_network_mbps':
                    data.network.maxMbps = parseFloat(array[i].data.data.result[0].value[1]).toFixed(3);
                    break;
                case 'network_gb_recv':
                    data.network.recvGB = parseFloat(array[i].data.data.result[0].value[1]).toFixed(3);
                    break;
                case 'network_gb_sent':
                    data.network.sentGB = parseFloat(array[i].data.data.result[0].value[1]).toFixed(3);
                    break;
                case 'nvme':
                    data.disk.nvme = array[i].data.data.result.length > 0 ? true : false;
                    break;
                case 'total_disk_gib':
                    data.disk.totalGiB = Math.round(array[i].data.data.result[0].value[1]);
                    break;
                case 'total_memory_gib':
                    data.memory.totalGiB = Math.ceil(array[i].data.data.result[0].value[1]);
                    break;
            }
        }
    }
    
    return data;
};

export const getNodeStatistics = async function(args, queries) {
    try {
        const options = {
            ca: tls.ca,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            method: 'POST'
        };
        
        return parseResponse(await Promise.all(metrics.map(function(type) {
            return httpReqBody(buildUrl(args.prometheusApi), options, buildQuery(queries, args, type));
        })));
    } catch (error) {
        systemLog(error);
        return;
    }
};