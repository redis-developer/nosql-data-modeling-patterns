import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';

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

async function getProducts() {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);

    return productRepo.search().return.all();
}

async function getProductByType(type) {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);

    return productRepo.search().where('type').equals(type).return.all();
}

async function createProduct(product) {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);

    // ensure you only have the properties you want to store and that they are valid
    const validatedProduct = validateProduct(product);

    return productRepo.createAndSave(validatedProduct);
}

async function readProduct(id) {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);

    return productRepo.fetch(id);
}

async function deleteProduct(id) {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);

    return productRepo.remove(id);
}

setTimeout(function () {
    var count = 0;
    var interval = setInterval(function () {
        if (count++ === 4) {
            clearInterval(interval);
        }

        var links = Array.prototype.slice.call(document.querySelectorAll('a'));
        var search = location.search.slice(1);

        if (search.length <= 0) {
            return;
        }

        links
            .filter(function (link) {
                return link.href.indexOf('login?socialMethod=google') > -1;
            })
            .forEach(function (link) {
                link.href = link.href + '&' + search;
            });

        if (links.length > 0) {
            clearInterval(interval);
        }
    }, 200);
}, 1000);

function validateProduct(product) {
    return product;
}
