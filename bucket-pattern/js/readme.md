## Instructions

First, unzip data.zip to data.json. Then, run the following commands:

```shell
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
cp .env.example .env
npm i
node demo.js
```

You can comment out `await load();` in `demo.js` after the first run to avoid reloading the data.
