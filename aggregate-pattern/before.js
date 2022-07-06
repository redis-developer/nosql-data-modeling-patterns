import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';

class Product extends Entity {}
class ProductReview extends Entity {}

const productSchema = new Schema(Product, {
    name: { type: 'string' },
});
const productReviewSchema = new Schema(ProductReview, {
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'number' },
});

async function addReview(productId, author, rating) {
    const client = await getClient();
    const productReviewRepo = client.fetchRepository(productReviewSchema);
    await productReviewRepo.createAndSave({
        productId,
        author,
        rating,
    });
}

async function getProducts() {
    const client = await getClient();
    const productRepo = client.fetchRepository(productSchema);
    const productEntities = await productRepo.search().return.all();
    const results = await client.execute(
        'FT.AGGREGATE ProductReview:index * GROUPBY 1 @productId REDUCE AVG 1 @rating REDUCE COUNT 0'.split(
            /\s+/
        )
    );

    const products = {};
    for (let result of results.slice(1)) {
        const [, productId, , avgRating, , numReviews] = result;
        products[productId] = {
            avgRating: Number(avgRating),
            numReviews: Number(numReviews),
        };
    }

    return productEntities.map((entity) => {
        return {
            ...entity.entityData,
            ...products[entity.entityId],
        };
    });
}
