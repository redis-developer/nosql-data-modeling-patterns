import { Schema, Repository, EntityId } from 'redis-om';
import { getClient } from './client.js';
import { AggregateGroupByReducers, AggregateSteps } from 'redis';

const productSchema = new Schema('Product', {
    name: { type: 'string' },
});

const productReviewSchema = new Schema('ProductReview', {
    productId: { type: 'string' },
    author: { type: 'string' },
    rating: { type: 'number' },
});

async function addReview(productId, author, rating) {
    const client = await getClient();
    const productReviews = new Repository(productReviewSchema, client);
    await productReviews.save({
        productId,
        author,
        rating,
    });
}

async function getProducts() {
    const client = await getClient();
    const productRepo = new Repository(productSchema, client);
    const productEntities = await productRepo.search().return.all();
    const { results } = await client.ft.aggregate(
        'ProductReview:index',
        '*',
        {
            STEPS: [
                {
                    type: AggregateSteps.GROUPBY,
                    properties: '@productId',
                    REDUCE: [{
                        property: '@rating',
                        type: AggregateGroupByReducers.AVG,
                        AS: 'avgRating'
                    }, {
                        type: AggregateGroupByReducers.COUNT,
                        AS: 'numReviews'
                    }],
                }
            ],
        }
    );

    const products = {};
    for (let { productId, avgRating, numReviews } of results) {
        products[productId] = {
            avgRating: Number(avgRating),
            numReviews: Number(numReviews),
        };
    }

    return productEntities.map((entity) => {
        return {
            id: entity[EntityId],
            ...entity,
            ...products[entity[EntityId]],
        };
    });
}

console.log(await getProducts());

process.exit(1);