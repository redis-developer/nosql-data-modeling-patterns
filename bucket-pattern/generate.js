import fs from 'fs';

const MIN_TEMP = 40;
const MAX_TEMP = 50;
const TOTAL_TIME_MS = 365 * 24 * 60 * 60 * 1000;
const START_DATE = new Date(Date.now() - TOTAL_TIME_MS);
START_DATE.setHours(0, 0, 0, 0);
const START_DATE_MS = START_DATE.getTime();
const data = [];
const months = [
    { low: 36, high: 47 },
    { low: 37, high: 51 },
    { low: 40, high: 56 },
    { low: 43, high: 61 },
    { low: 49, high: 68 },
    { low: 54, high: 73 },
    { low: 58, high: 81 },
    { low: 58, high: 81 },
    { low: 54, high: 76 },
    { low: 47, high: 64 },
    { low: 41, high: 53 },
    { low: 36, high: 46 },
];
let currentMin = MIN_TEMP;
let currentMax = MAX_TEMP;

for (let i = 0; i < TOTAL_TIME_MS; i += 6000) {
    const date = new Date(START_DATE_MS + i);
    const month = date.getMonth();
    const low = months[month].low;
    const high = months[month].high;
    const temp = Math.floor(Math.random() * (high - low) + low);
    data.push({
        date: date,
        temp: temp,
    });
}

fs.writeFileSync('data.json', JSON.stringify(data), { encoding: 'utf8' });
console.log('Done');
process.exit();
