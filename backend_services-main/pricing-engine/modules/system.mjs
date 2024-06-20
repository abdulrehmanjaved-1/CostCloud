import fs from 'fs';
import { format } from 'sql-formatter';

export const isTrue = function(value) {
    return value === "true";
};

export const readFile = async function(path, encoding) {
    try {
        return fs.readFileSync(path, !encoding ? 'utf8' : encoding);
    } catch (error) {
        systemLog(`Error reading file ${path}`);
        process.exit(0);
    }
};

export const toUpperWord = function(string) {
    return string.split(' ').map(function(word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
};

/* Logging */
export const sqlLog = function(sql, bind, language) {
    const timestamp = new Date().toUTCString();
    const options = {
        language: language,
        params: bind ? bind.map(String) : undefined
    };
    
    const formatted = format(sql, options);
    console.log(`${timestamp} :: Raw SQL\n${formatted.replace(/^/gm, '  ')}`);
};

export const systemLog = function(entry) {
    console.log(`\n  ${entry}\n`);
};

export const writeFile = async function(path, data, encoding) {
    try {
        fs.writeFileSync(path, data, !encoding ? 'utf8' : encoding);
    } catch (error) {
        systemLog(`Error writing file to ${path}`);
        process.exit();
    }
};