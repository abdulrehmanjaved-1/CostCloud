import { importInstance, importPrice, importStorage, importTransfer } from './modules/import.mjs';
import * as fn from './modules/system.mjs';

let ec2, region, transfer;

for (let i = 2; i < process.argv.length; i++) {
    ec2 = (process.argv[i] === '--ec2') ? process.argv[i+1] : ec2;
    region = (process.argv[i] === '--region') ? process.argv[i+1] : region;
    transfer = (process.argv[i] === '--data-transfer') ? process.argv[i+1] : transfer;
}

if (!ec2 || !region || !transfer) {
    fn.systemLog(`Usage: node app.mjs --data-transfer <path_to_file> --ec2 <path_to_file> --region <region>`);
    process.exit(0);
}

ec2 = JSON.parse(await fn.readFile(ec2))
transfer = JSON.parse(await fn.readFile(transfer));

await importInstance(ec2.products, region, ec2.publicationDate);
await importPrice(ec2.terms.OnDemand, region, 'instance');
// await importPrice(ec2.terms.Reserved, region, 'instance');

await importStorage(ec2.products, region, ec2.publicationDate);
await importPrice(ec2.terms.OnDemand, region, 'storage')

await importTransfer(transfer.products, region, transfer.publicationDate);
await importPrice(transfer.terms.OnDemand, region, 'transfer');

console.log('Exiting...\n');
process.exit(0);