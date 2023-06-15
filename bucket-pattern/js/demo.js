import { TimeSeriesAggregationType, TimeSeriesDuplicatePolicies } from 'redis';
import { getClient } from './client.js';
const data = (await import('./data.json', { assert: { type: 'json' } }))
    .default;

async function createTimeSeries() {
    const client = await getClient();
    const exists = await client.exists('temperature:raw');

    if (exists === 1) {
        return;
    }

    // TS.CREATE temperature:raw DUPLICATE_POLICY LAST
    await client.ts.create('temperature:raw', {
        DUPLICATE_POLICY: TimeSeriesDuplicatePolicies.LAST,
    });

    // TS.CREATE temperature:daily DUPLICATE_POLICY LAST
    await client.ts.create('temperature:daily', {
        DUPLICATE_POLICY: TimeSeriesDuplicatePolicies.LAST,
    });

    // TS.CREATE temperature:monthly DUPLICATE_POLICY LAST
    await client.ts.create('temperature:monthly', {
        DUPLICATE_POLICY: TimeSeriesDuplicatePolicies.LAST,
    });

    // TS.CREATERULE temperature:raw temperature:daily AGGREGATION twa 86400000
    await client.ts.createRule(
        'temperature:raw',
        'temperature:daily',
        TimeSeriesAggregationType.TWA,
        86400000
    );

    // TS.CREATERULE temperature:raw temperature:monthly AGGREGATION twa 2629800000
    await client.ts.createRule(
        'temperature:raw',
        'temperature:monthly',
        TimeSeriesAggregationType.TWA,
        2629800000
    );
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
                {
                    key: 'temperature:raw',
                    timestamp: new Date(value.date).getTime(),
                    value: value.temp,
                },
            ]);
        }, []);

        // TS.MADD temperature:raw timestamp temp temperature:raw timestamp temp ...
        await client.ts.mAdd(series);
    }

    console.log('\n');
}

async function load() {
    const client = await getClient();
    client.flushDb();
    await createTimeSeries();
    await add(data);
}

async function perf() {
    const client = await getClient();
    const start = Date.now();
    const results = [];
    const addResult = (command) => {
        const time = Date.now() - start;
        results.push({
            command,
            time,
        });
    };

    // Equivalent monthly temperature aggregate queries
    {
        // TS.RANGE temperature:monthly 0 +
        await client.ts.range('temperature:monthly', 0, '+');
        addResult('TS.RANGE temperature:monthly 0 +');

        // TS.RANGE temperature:daily 0 + AGGREGATION twa 2629800000
        await client.ts.range('temperature:daily', 0, '+', {
            AGGREGATION: {
                type: TimeSeriesAggregationType.TWA,
                timeBucket: 2629800000,
            },
        });
        addResult('TS.RANGE temperature:daily 0 + AGGREGATION twa 2629800000');

        // TS.RANGE temperature:raw 0 + AGGREGATION twa 2629800000
        await client.ts.range('temperature:raw', 0, '+', {
            AGGREGATION: {
                type: TimeSeriesAggregationType.TWA,
                timeBucket: 2629800000,
            },
        });
        addResult('TS.RANGE temperature:raw 0 + AGGREGATION twa 2629800000');
    }

    // Equivalent daily temperature aggregate queries
    {
        // TS.RANGE temperature:daily 0 +
        await client.ts.range('temperature:daily', 0, '+');
        addResult('TS.RANGE temperature:daily 0 +');

        // TS.RANGE temperature:raw 0 + AGGREGATION twa 86400000
        await client.ts.range('temperature:raw', 0, '+', {
            AGGREGATION: {
                type: TimeSeriesAggregationType.TWA,
                timeBucket: 86400000,
            },
        });
        addResult('TS.RANGE temperature:raw 0 + AGGREGATION twa 86400000');
    }

    for (let { time, command } of results) {
        console.log(`[${time}ms]\t${command}`);
    }
}

try {
    // Run the load function to populate the database
    // await load();

    // Run the perf function to compare the performance of the queries
    await perf();
    process.exit();
} catch (e) {
    console.error(e);
    process.exit(1);
}
