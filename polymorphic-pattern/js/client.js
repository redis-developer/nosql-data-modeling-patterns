import { Client } from 'redis-om';
import { config } from 'dotenv';

config();

const clientPromise = new Promise(async (resolve) => {
    const client = new Client();

    await client.open(process.env.REDIS_URL);

    resolve(client);
});

/**
 *
 * @returns {Promise<Client>}
 */
export async function getClient() {
    return clientPromise;
}
