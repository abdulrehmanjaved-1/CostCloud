import fs from 'fs';
import { accessLog } from './constants.mjs';

export const isArray = function(array) {
    return Array.isArray(array);
};

export const isEmpty = function(object) {
    return isArray(object) ? object.length === 0 : object ? Object.keys(object).length === 0 : true;
};

export const isString = function(string) {
    return typeof string === 'string';
};

export const isTrue = function(value) {
    return value === "true";
};

export const readFile = async function(path, encoding) {
    try {
        return fs.readFileSync(path, !encoding ? 'utf8' : encoding);
    } catch (error) {
        systemLog(`Error reading file ${path}`);
    }
};

/* Logging */
export const httpLog = function(req, resCode, bytesSent) {
    if (accessLog) {
        const { headers, httpVersion, ip, method, originalUrl, socket } = req;
        const entry = `${ip} - [${new Date().toUTCString()}] "${headers['user-agent']}" ${method} ` +
            `"${originalUrl} HTTP/${httpVersion}" ${resCode} ${socket.bytesRead} ${bytesSent}`;
        console.log(entry);
    }
};

export const systemLog = function(entry) {
    console.log(`${new Date().toUTCString()} :: ${entry}`);
};