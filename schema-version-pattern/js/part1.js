// @ts-nocheck
import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';

class User extends Entity {}

const userSchema = new Schema(User, {
    name: { type: 'string' },
    email: { type: 'string' },
});

export async function create(data) {
    const client = await getClient();
    const repo = client.fetchRepository(userSchema);
    const user = repo.createEntity(data);

    await repo.save(user);

    return user.toJSON();
}

export async function read(id) {
    const client = await getClient();
    const repo = client.fetchRepository(userSchema);
    const user = await repo.fetch(id);

    return user.toJSON();
}

export async function update(id, data) {
    const client = await getClient();
    const repo = client.fetchRepository(userSchema);
    const user = await repo.fetch(id);

    user.name = data.name;
    user.email = data.email;

    await repo.save(user);

    return user.toJSON();
}

try {
    const user = await create({
        name: 'Jane Doe',
        email: 'janedoe@gmail.com'
    });

    console.log(user);
    process.exit();
} catch (e) {
    console.log(e);
    process.exit(1);
}
