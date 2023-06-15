import { Schema, Repository } from 'redis-om';
import { getClient } from './client.js';

const productSchema = new Schema('Product', {
    name: { type: 'string' },
    numReviews: { type: 'number' },
    sumRatings: { type: 'number' },
});

const productReviewSchema = new Schema('ProductReview', {
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'number' },
});

async function addReview(productId, author, rating) {
    const client = await getClient();
    const productRepo = new Repository(productSchema, client);
    const productReviewRepo = new Repository(productReviewSchema, client);
    const productEntity = await productRepo.fetch(productId);

    // @ts-ignore
    productEntity.numReviews += 1;
    productEntity.sumRatings += rating;

    return Promise.all([
        productRepo.save(productEntity),
        productReviewRepo.save({
            productId,
            author,
            rating,
        }),
    ]);
}

async function getProducts() {
    const client = await getClient();
    const productRepo = new Repository(productSchema, client);

    return productRepo.search().return.all();
}

console.log(await getProducts());

process.exit(1);
