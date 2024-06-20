import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core/core.cjs';
import { endpoint } from './constants.mjs';
import { systemLog } from './system.mjs';

const client = new ApolloClient({
    uri: endpoint.statsCollector,
    cache: new InMemoryCache()
});

export const getNodeStatistics = async function(args) {
    try {
        const result = await client.query({
            query: gql`
                query getStatistics {
                    statistics(
                        prometheusApi: "${args.prometheusApi}"
                        prometheusDuration: "${args.prometheusDuration}"
                        prometheusInstance: "${args.prometheusInstance}"
                        prometheusJob: "${args.prometheusJob}"
                    ) {
                        cpu { arch avgUtil maxUtil model total }
                        disk { avgIops avgMbps maxIops maxMbps nvme totalGiB }
                        memory { avgUtil maxUtil totalGiB }
                        network { avgMbps maxMbps recvGB sentGB }
                        os { name type version }
                        timestamp
                    }
                }
            `
        });
        
        return result.data.statistics;
    } catch (error) {
        systemLog(error);
        return;
    }
};