# Benchmark Databases

This project benchmarks MySQL and PostgreSQL databases using Node.js. It utilizes popular libraries for database connections and performs benchmark queries to evaluate performance.

## Results Summary

```
Mysql Benchmark Results:
Query 1: Latest 10 transactions with account and block details - Average Execution Time: 1.42 ms
Query 2: Top 5 accounts with the highest balance and their transaction count - Average Execution Time: 14889.86 ms
Query 3: Latest 10 created contracts with their creator's address and creation block number - Average Execution Time: 0.95 ms
Query 4: Total transaction value and gas used for each block in the last 100 blocks - Average Execution Time: 147.35 ms
Query 5: Top 10 contracts by transaction count - Average Execution Time: 40.59 ms
Query 6: Average transaction value and gas used for each hour in the last 24 hours - Average Execution Time: 134.72 ms
Query 7: Accounts involved in the highest value transaction for each of the last 10 blocks - Average Execution Time: 3.49 ms

PostgreSQL Benchmark Results:
Query 1: Latest 10 transactions with account and block details - Average Execution Time: 31.28 ms
Query 2: Top 5 accounts with the highest balance and their transaction count - Average Execution Time: 3666.47 ms
Query 3: Latest 10 created contracts with their creator's address and creation block number - Average Execution Time: 1.46 ms
Query 4: Total transaction value and gas used for each block in the last 100 blocks - Average Execution Time: 24.57 ms
Query 5: Top 10 contracts by transaction count - Average Execution Time: 18.59 ms
Query 6: Average transaction value and gas used for each hour in the last 24 hours - Average Execution Time: 25.71 ms
Query 7: Accounts involved in the highest value transaction for each of the last 10 blocks - Average Execution Time: 83.48 ms
```
