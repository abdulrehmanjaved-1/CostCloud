import http from 'http';
import https from 'https';
import { isEmpty, isString, systemLog } from './system.mjs';

export const buildUrl = function(url, query) {
    const queryString = new URLSearchParams();
    
    for (const key in query) {
        if (Object.prototype.hasOwnProperty.call(query, key)) {
            query[key] = isString(query[key]) ? [query[key]] : query[key];
            query[key].forEach(function(value) {
                queryString.append(key, value);
            });
        }
    }
    
    return new URL(!isEmpty(query) ? `${url}?${queryString.toString()}` : url);
};

export const httpReq = async function(url, options) {
    return new Promise(function(resolve) {
        let data = '';
        options.headers = {...options.headers, ...{ 'User-Agent': 'stats-collector' }};
        
        if (url.protocol === 'http:') {
            http.request(url, options, function(res) {
                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', function() {
                    try {
                        resolve({ code: res.statusCode, data: JSON.parse(data) });
                    } catch (error) {
                        resolve({ code: 400 });
                    }
                });
            }).on('error', function(error) {
                systemLog(error);
                resolve({ code: 400 });
            }).end();
        } else {
            https.request(url, options, function(res) {
                res.on('data', function(chunk) {
                    data += chunk;
                });
                res.on('end', function() {
                    try {
                        resolve({ code: res.statusCode, data: JSON.parse(data) });
                    } catch (error) {
                        resolve({ code: 400 });
                    }
                });
            }).on('error', function(error) {
                systemLog(error);
                resolve({ code: 400 });
            }).end();
        }
    });
};

export const httpReqBody = async function(url, options, body) {
    return new Promise(function(resolve) {
        let data = '';
        options.headers = {
            ...options.headers,
            ...{ 'Content-Length': Buffer.byteLength(body) },
            ...{ 'User-Agent': 'stats-collector' }
        };
        
        if (url.protocol === 'http:') {
            const req = http.request(url, options, function(res) {
                res.on('data', function(chunk) {
                    data += chunk;
                });
                
                res.on('end', function() {
                    try {
                        resolve({ code: res.statusCode, data: JSON.parse(data) });
                    } catch (error) {
                        resolve({ code: 400 });
                    }
                });
            }).on('error', function(error) {
                systemLog(error);
                resolve({ code: 400 });
            });
            
            req.write(body);
            req.end();
        } else {
            const req = https.request(url, options, function(res) {
                res.on('data', function(chunk) {
                    data += chunk;
                });
                
                res.on('end', function() {
                    try {
                        resolve({ code: res.statusCode, data: JSON.parse(data) });
                    } catch (error) {
                        resolve({ code: 400 });
                    }
                });
            }).on('error', function(error) {
                systemLog(error);
                resolve({ code: 400 });
            });
            
            req.write(body);
            req.end();
        }
    });
};