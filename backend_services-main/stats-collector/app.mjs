import cors from 'cors';
import express from 'express';
import http from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';

import { basePath, httpMessage } from './modules/constants.mjs';
import { getNodeStatistics } from './modules/statistics.mjs';
import { httpLog, readFile } from './modules/system.mjs';

const queries = JSON.parse(await readFile('./queries.json'));
const typeDefs = await readFile('./schema.gql');
const resolvers = {
    Query: {
        statistics: async function(_, args) {
            return getNodeStatistics(args, queries);
        }
    }
};

const app = express();
const httpServer = http.createServer(app);
const apolloServer = new ApolloServer({ typeDefs, resolvers });
await apolloServer.start();

app.use(`${basePath}/graphql`, cors(), express.json(), expressMiddleware(apolloServer, {
    context: async function({ req, res }) {
        httpLog(req, res.statusCode, '-');
    }
}));

app.all('*', function(req, res) {
    const statusCode = 400;
    const response = {
        errors: [{
            message: "invalid path",
            extensions: {
                code: httpMessage[statusCode]
            }
        }]
    };
    
    res.status(statusCode).json(response);
    httpLog(req, statusCode, JSON.stringify(response).length);
});

await new Promise(function(resolve) {
    httpServer.listen(80, resolve);
});