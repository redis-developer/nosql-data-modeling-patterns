## Instructions

First, unzip data.zip to data.json. Then, run the following commands:

Run Redis in Docker:
```shell
docker run -d --name redis-stack -p 6379:6379 redis/redis-stack:latest
```

Copy .env.example to .env:
```shell
cp .env.example .env
```

Install dependencies:
```shell
npm i
```

Run the demo:
```shell
node demo.js
```

You can comment out `await load();` in `demo.js` after the first run to avoid reloading the data.
