import { isTrue } from './system.mjs';

export const accessLog = !process.env.ACCESS_LOG ? false : isTrue(process.env.ACCESS_LOG);
export const basePath = process.env.BASE_PATH || '/api/v1';
export const currency = process.env.CURRENCY || 'USD';
export const endpoint = {
    metadata: process.env.ENDPOINT_METADATA || 'http://costcloud.igraphql.co/metadata/v1/graphql',
    statsCollector: process.env.ENDPOINT_STATS_COLLECTOR || 'https://costcloud.igrapqhl.co/stats/v1/graphql'
};

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