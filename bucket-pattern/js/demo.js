import { getClient } from './client.js';
const data = (await import('./data.json', { assert: { type: 'json' } }))
    .default;

async function createTimeSeries() {
    const client = await getClient();
    const exists = await client.execute('EXISTS temperature:raw'.split(' '));

    if (exists === 1) {
        return;
    }

    const commands = [
        'TS.CREATE temperature:raw DUPLICATE_POLICY LAST',
        'TS.CREATE temperature:daily DUPLICATE_POLICY LAST',
        'TS.CREATE temperature:monthly DUPLICATE_POLICY LAST',
        'TS.CREATERULE temperature:raw temperature:daily AGGREGATION avg 86400000',
        'TS.CREATERULE temperature:raw temperature:monthly AGGREGATION avg 2629800000',
    ];

    for (let command of commands) {
        await client.execute(command.split(' '));
    }
}

async function add(values) {
    const client = await getClient();
    const chunkSize = 10000;

    for (let i = 0; i < values.length; i += chunkSize) {
        const percent = Math.round(((i + chunkSize) / values.length) * 100);
        const progress = new Array(100);
        progress.fill('=', 0, percent);
        process.stdout.write(
            `[${i + chunkSize}/${values.length}] [${progress
                .slice(0, percent)
                .join('')}>${progress.slice(percent).join(' ')}] ${Math.round(
                ((i + chunkSize) / values.length) * 100
            )}%\r`
        );
        const chunk = values.slice(i, i + chunkSize);
        const series = chunk.reduce((arr, value) => {
            return arr.concat([
                'temperature:raw',
                new Date(value.date).getTime(),
                value.temp,
            ]);
        }, []);

        // TS.MADD temperature:raw timestamp temp temperature:raw timestamp temp ...
        await client.execute(['TS.MADD', ...series]);
    }

    console.log('\n');
}

async function load() {
    await createTimeSeries();
    await add(data);
}

async function perf() {
    const client = await getClient();
    const start = Date.now();
    const results = [];
    const commands = [
        // Equivalent monthly temperature aggregate queries
        'TS.RANGE temperature:monthly 0 +',
        'TS.RANGE temperature:daily 0 + AGGREGATION avg 2629800000',
        'TS.RANGE temperature:raw 0 + AGGREGATION avg 2629800000',

        // Equivalent daily temperature aggregate queries
        'TS.RANGE temperature:daily 0 +',
        'TS.RANGE temperature:raw 0 + AGGREGATION avg 86400000',
    ];
    for (let command of commands) {
        await client.execute(command.split(' '));
        console.log(`[${Date.now() - start}ms] ${command}`);
        results.push({
            command: command,
            time: Date.now() - start,
        });
    }
}

try {
    await load();
    process.exit();
} catch (e) {
    console.error(e);
    process.exit(1);
}
