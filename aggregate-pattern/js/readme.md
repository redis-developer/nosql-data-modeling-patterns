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

Import the "before" data:
```shell
node import_before.js
```

Observe that the data is in Redis using [RedisInsight](https://redis.com/redis-enterprise/redis-insight/#insight-form).


Run the "before" demo:
```shell
node before.js
```

Import the "after" data:
```shell
node import_after.js
```

Observe that the data is in Redis using [RedisInsight](https://redis.com/redis-enterprise/redis-insight/#insight-form).

Run the "after" demo:
```shell
node after.js
```
