import { Client } from "pg";

// PostgreSQL connection configuration
const client = new Client({
  user: process.env.POSTGRES_USER || "postgres",
  host: "localhost",
  database: process.env.POSTGRES_DB || "benchmark_db",
  password: process.env.POSTGRES_PASSWORD || "root",
  port: Number(process.env.POSTGRES_PORT) || 45432,
});

// Define the queries
const queries = [
  {
    name: "Query 1: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN",
    text: `
      SELECT t.tx_hash, a_from.address AS from_address, a_to.address AS to_address, 
             t.value, b.block_number, b.timestamp
      FROM Transactions t
      JOIN Accounts a_from ON t.from_account_id = a_from.id
      JOIN Accounts a_to ON t.to_account_id = a_to.id
      JOIN Blocks b ON t.block_id = b.id
      ORDER BY b.timestamp DESC
      LIMIT 10;
    `,
  },
  {
    name: "Query 2: JOINED SELECT WITH GROUP BY ORDER BY BALANCE",
    text: `
      SELECT a.address, a.balance, COUNT(t.id) AS transaction_count
      FROM Accounts a
      LEFT JOIN Transactions t ON a.id = t.from_account_id OR a.id = t.to_account_id
      GROUP BY a.id, a.address, a.balance
      ORDER BY a.balance DESC
      LIMIT 5;
    `,
  },
  {
    name: "Query 3: JOINED SELECT WITH ORDER BY NON-INDEXED COLUMN",
    text: `
      SELECT c.address AS contract_address, a.address AS creator_address, 
             b.block_number AS creation_block_number
      FROM Contracts c
      JOIN Accounts a ON c.creator_account_id = a.id
      JOIN Blocks b ON c.creation_block_id = b.id
      ORDER BY b.block_number DESC
      LIMIT 10;
    `,
  },
  {
    name: "Query 4: JOINED SELECT WITH GROUP BY AND SUM ORDER BY NON-INDEXED COLUMN",
    text: `
      SELECT b.block_number, b.timestamp, 
             SUM(t.value) AS total_value, SUM(t.gas_used) AS total_gas_used
      FROM Blocks b
      LEFT JOIN Transactions t ON b.id = t.block_id
      GROUP BY b.id, b.block_number, b.timestamp
      ORDER BY b.block_number DESC
      LIMIT 100;
    `,
  },
  {
    name: "Query 5: JOINED SELECT WITH GROUP BY AND COUNT ORDER BY",
    text: `
      SELECT c.address AS contract_address, COUNT(t.id) AS transaction_count
      FROM Contracts c
      JOIN Transactions t ON c.id = t.contract_id
      GROUP BY c.id, c.address
      ORDER BY transaction_count DESC
      LIMIT 10;
    `,
  },
  {
    name: "Query 6: JOINED SELECT GROUP AVG AND ORDER BY",
    text: `
      SELECT DATE_TRUNC('hour', b.timestamp) AS hour,
             AVG(t.value) AS avg_value,
             AVG(t.gas_used) AS avg_gas_used
      FROM Transactions t
      JOIN Blocks b ON t.block_id = b.id
      WHERE b.timestamp >= NOW() - INTERVAL '24 hours'
      GROUP BY DATE_TRUNC('hour', b.timestamp)
      ORDER BY hour DESC;
    `,
  },
  {
    name: "Query 7: WITH JOINED SELECT TO JOINED SELECT AND ORDER",
    text: `
      WITH RankedTransactions AS (
        SELECT t.*, b.block_number,
               ROW_NUMBER() OVER (PARTITION BY b.id ORDER BY t.value DESC) AS rank
        FROM Transactions t
        JOIN Blocks b ON t.block_id = b.id
        ORDER BY b.block_number DESC
        LIMIT 10
      )
      SELECT r.block_number, a_from.address AS from_address, a_to.address AS to_address, r.value
      FROM RankedTransactions r
      JOIN Accounts a_from ON r.from_account_id = a_from.id
      JOIN Accounts a_to ON r.to_account_id = a_to.id
      WHERE r.rank = 1
      ORDER BY r.block_number DESC;
    `,
  },
];

// Helper function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  return array
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

// Benchmark function
export async function benchmarkPsql() {
  try {
    await client.connect();

    // Initialize counters and results
    const executionCounts: { [key: string]: number } = {};
    const executionTimes: { [key: string]: number[] } = {};
    queries.forEach((query, index) => {
      executionCounts[index] = 0;
      executionTimes[index] = [];
    });

    const totalExecutions = queries.length * 10;
    let executionsLeft = totalExecutions;

    while (executionsLeft > 0) {
      // Shuffle the queries
      const shuffledIndexes = shuffleArray(queries.map((_, index) => index));

      for (const index of shuffledIndexes) {
        if (executionCounts[index] < 10) {
          const query = queries[index];
          const start = process.hrtime();

          await client.query(query.text);

          const elapsed = process.hrtime(start);
          const elapsedTimeInMs = elapsed[0] * 1000 + elapsed[1] / 1e6;
          executionTimes[index].push(elapsedTimeInMs);

          executionCounts[index]++;
          executionsLeft--;

          console.log(
            `${query.name} - Execution ${
              executionCounts[index]
            } completed in ${elapsedTimeInMs.toFixed(2)} ms`
          );
        }
      }
    }

    // Display the results
    console.log("\nBenchmark Results:");
    queries.forEach((query, index) => {
      const times = executionTimes[index];
      const averageTime =
        times.reduce((acc, curr) => acc + curr, 0) / times.length;
      console.log(
        `${query.name} - Average Execution Time: ${averageTime.toFixed(2)} ms`
      );
    });

    await client.end();
  } catch (err) {
    console.error("Error during benchmarking:", err);
  }
}
