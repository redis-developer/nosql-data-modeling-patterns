import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';
const { default: data } = await import('./data.json', {
    assert: { type: 'json' },
});

class Product extends Entity {}

const productSchema = new Schema(Product, {
    type: { type: 'string' },
    name: { type: 'string' },
    brand: { type: 'string' },
    sku: { type: 'string' },
    model: { type: 'string' },
    batteryLife: { type: 'string' },
    connectionType: { type: 'string' },
    fit: { type: 'string' },
    usbPorts: { type: 'number' },
    hdmiPorts: { type: 'number' },
    storageType: { type: 'string' },
});

const client = await getClient();
await client.execute(['FLUSHDB']);
const products = client.fetchRepository(productSchema);
await products.createIndex();

let productId = '';
for (let product of data) {
    const productEntity = await products.createAndSave(product);
    productId = productEntity.entityId;
}


process.exit(1);
