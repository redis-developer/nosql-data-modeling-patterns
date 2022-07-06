Use the [RedisGraph bulk loader](https://github.com/redisgraph/redisgraph-bulk-loader) to perform the following command in the `data` directory.

```
redisgraph-bulk-insert Org -n Location.csv -n Employee.csv -r REPORTS_TO.csv -r WORKS_AT.csv
```

Then look at `queries.redis` for some example queries to run in RedisInsight.
