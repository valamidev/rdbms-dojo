# Benchmark Databases

This project benchmarks MySQL and PostgreSQL databases using Node.js. It utilizes popular libraries for database connections and performs benchmark queries to evaluate performance.

## Results With Indices Summary

```
Mysql Benchmark Results:
Query 1: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 1.29 ms
Query 2: JOINED SELECT WITH GROUP BY 3 COLUMN ORDER BY NON-INDEXED COLUMN - Average Execution Time: 87.67 ms
Query 3: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 0.96 ms
Query 4: JOINED SELECT WITH GROUP BY AND SUM ORDER BY NON-INDEXED COLUMN - Average Execution Time: 24.01 ms
Query 5: JOINED SELECT WITH GROUP BY AND COUNT ORDER BY - Average Execution Time: 18.10 ms
Query 6: JOINED SELECT GROUP AVG AND ORDER BY - Average Execution Time: 25.84 ms
Query 7: WITH JOINED SELECT TO JOINED SELECT AND ORDER - Average Execution Time: 60.98 ms

PostgreSQL Benchmark Results:
Query 1: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 1.29 ms
Query 2: JOINED SELECT WITH GROUP BY 3 COLUMN ORDER BY NON-INDEXED COLUMN - Average Execution Time: 87.67 ms
Query 3: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 0.96 ms
Query 4: JOINED SELECT WITH GROUP BY AND SUM ORDER BY NON-INDEXED COLUMN - Average Execution Time: 24.01 ms
Query 5: JOINED SELECT WITH GROUP BY AND COUNT ORDER BY - Average Execution Time: 18.10 ms
Query 6: JOINED SELECT GROUP AVG AND ORDER BY - Average Execution Time: 25.84 ms
Query 7: WITH JOINED SELECT TO JOINED SELECT AND ORDER - Average Execution Time: 60.98 ms
```

## Results Without Indices Summary

```
Mysql Benchmark Results:
Query 1: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 3.19 ms
Query 2: JOINED SELECT WITH GROUP BY ORDER BY BALANCE - Average Execution Time: 15110.57 ms
Query 3: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 1.99 ms
Query 4: JOINED SELECT WITH GROUP BY AND SUM ORDER BY NON-INDEXED COLUMN - Average Execution Time: 145.61 ms
Query 5: JOINED SELECT WITH GROUP BY AND COUNT ORDER BY - Average Execution Time: 39.70 ms
Query 6: JOINED SELECT GROUP AVG AND ORDER BY - Average Execution Time: 137.77 ms
Query 7: WITH JOINED SELECT TO JOINED SELECT AND ORDER - Average Execution Time: 8.76 ms

PostgreSQL Benchmark Results:
Query 1: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 30.62 ms
Query 2: JOINED SELECT WITH GROUP BY ORDER BY BALANCE - Average Execution Time: 3598.88 ms
Query 3: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN - Average Execution Time: 1.56 ms
Query 4: JOINED SELECT WITH GROUP BY AND SUM ORDER BY NON-INDEXED COLUMN - Average Execution Time: 26.36 ms
Query 5: JOINED SELECT WITH GROUP BY AND COUNT ORDER BY - Average Execution Time: 20.78 ms
Query 6: JOINED SELECT GROUP AVG AND ORDER BY - Average Execution Time: 27.67 ms
Query 7: WITH JOINED SELECT TO JOINED SELECT AND ORDER - Average Execution Time: 81.08 ms
```
