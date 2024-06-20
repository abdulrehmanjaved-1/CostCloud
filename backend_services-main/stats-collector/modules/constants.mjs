import fs from 'fs';
import { isTrue } from './system.mjs';

export const accessLog = !process.env.ACCESS_LOG ? false : isTrue(process.env.ACCESS_LOG);
export const basePath = process.env.BASE_PATH || '/api/v1';
export const httpMessage = {
    200: 'ok',
    201: 'created',
    400: 'bad request',
    401: 'unauthorized',
    403: 'forbidden',
    404: 'not found',
    405: 'method not allowed',
    409: 'conflict',
    415: 'unsupported media type',
    500: 'internal server error'
};

export const metrics = [
    'avg_cpu_util',
    'avg_disk_iops',
    'avg_disk_mbps',
    'avg_memory_util',
    'avg_network_mbps',
    'host_info',
    'max_cpu_util',
    'max_disk_iops',
    'max_disk_mbps',
    'max_memory_util',
    'max_network_mbps',
    'network_gb_recv',
    'network_gb_sent',
    'nvme',
    'total_disk_gib',
    'total_memory_gib'
];

export const queryResolution = process.env.QUERY_RESOLUTION || '5m';
export const tls = {
    ca: process.env.SERVER_CA && fs.existsSync(process.env.SERVER_CA) ?
        fs.readFileSync(process.env.SERVER_CA) : undefined,
    cert: process.env.SERVER_CERT && fs.existsSync(process.env.SERVER_CERT) ?
        fs.readFileSync(process.env.SERVER_CERT) : undefined,
    key: process.env.SERVER_KEY && fs.existsSync(process.env.SERVER_KEY) ?
        fs.readFileSync(process.env.SERVER_KEY) : undefined
};