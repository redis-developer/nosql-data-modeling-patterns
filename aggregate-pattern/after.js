import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';

class Product extends Entity {}
class ProductReview extends Entity {}

const productSchema = new Schema(Product, {
    name: { type: 'string' },
    numReviews: { type: 'number' },
    sumRatings: { type: 'number' },
});
const productReviewSchema = new Schema(ProductReview, {
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'number' },
});

async function addReview(productId, author, rating) {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);
    const productReviewRepo = client.fetchRepository(productReviewSchema);
    const productEntity = await productRepo.fetch(productId);
    // @ts-ignore
    productEntity.entityData.numReviews += 1;
    productEntity.entityData.sumRatings += rating;

    return Promise.all([
        productRepo.save(productEntity),
        productReviewRepo.createAndSave({
            productId,
            author,
            rating,
        }),
    ]);
}

async function getProducts() {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);

    return productRepo.search().return.all();
}
