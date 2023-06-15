import { createClient } from 'redis';
import { config } from 'dotenv';

config();

const clientPromise = new Promise(async (resolve) => {
    const client = createClient({
        url: process.env.REDIS_URL,
    });

    client.on('error', (err) => console.log('Redis Client Error', err));
    await client.connect();

    resolve(client);
});

/**
 *
 * @returns {Promise<import('redis').RedisClientType>}
 */
export async function getClient() {
    return clientPromise;
}
