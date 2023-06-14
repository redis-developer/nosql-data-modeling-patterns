// @ts-nocheck
import { Schema, Entity } from 'redis-om';
import { getClient } from './client.js';

class User extends Entity {}

const userSchema = new Schema(User, {
    schema: { type: 'string' },
    name: { type: 'string' },
    email: { type: 'string' },
    contact: { type: 'string' },
    emails: { type: 'string[]' },
});

function translate(data, schema = '1') {
    // Ignore data if using the old schema
    if (schema === '1') {
        return data;
    }

    // Ignore data if already using schema '2'
    if (schema === '2' && data.schema === '2') {
        return data;
    }

    // Migrate old data to new schema
    data.schema = schema;
    data.emails = [data.email];
    data.contact = data.email;
    data.email = null;

    return data;
}

export async function create(data, schema = '1') {
    const client = await getClient();
    const repo = client.fetchRepository(userSchema);
    const user = repo.createEntity(translate(data, schema));

    await repo.save(user);

    return user.toJSON();
}

export async function update(id, data, schema = '1') {
    const client = await getClient();
    const repo = client.fetchRepository(userSchema);
    const user = await repo.fetch(id);

    data = translate(data, schema);

    if (schema === '1') {
        user.schema = schema;
        user.name = data.name;
        user.email = data.email;
    } else {
        user.schema = data.schema;
        user.name = data.name;
        user.email = data.email;
        user.contact = data.contact;
        user.emails = data.emails;
    }

    await repo.save(user);

    return user.toJSON();
}
