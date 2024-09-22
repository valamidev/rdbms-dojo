import { Client } from "pg";
import crypto from "crypto";

// PostgreSQL connection configuration
const client = new Client({
  user: process.env.POSTGRES_USER || "postgres",
  host: "localhost",
  database: process.env.POSTGRES_DB || "benchmark_db",
  password: process.env.POSTGRES_PASSWORD || "root",
  port: Number(process.env.POSTGRES_PORT) || 45432,
});

// Function to generate a random Ethereum address
function randomAddress(): string {
  return "0x" + crypto.randomBytes(20).toString("hex");
}

// Function to generate a random hash (e.g., tx hash)
function randomHash(): string {
  return "0x" + crypto.randomBytes(32).toString("hex");
}

// Insert accounts into the database
async function insertAccounts(
  accounts: { address: string; balance: string; nonce: number }[]
) {
  const batchSize = 100;
  for (let i = 0; i < accounts.length; i += batchSize) {
    const batch = accounts.slice(i, i + batchSize);
    const accountValues: string[] = [];
    const accountParams: any[] = [];
    batch.forEach((account, index) => {
      accountValues.push(
        `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
      );
      accountParams.push(account.address, account.balance, account.nonce);
    });

    const insertAccountsQuery = `
      INSERT INTO Accounts (address, balance, nonce)
      VALUES ${accountValues.join(",")}
    `;
    await client.query(insertAccountsQuery, accountParams);
  }
}

// Insert blocks into the database
async function insertBlocks(
  blocks: { block_number: number; timestamp: Date }[]
) {
  const batchSize = 100;
  for (let i = 0; i < blocks.length; i += batchSize) {
    const batch = blocks.slice(i, i + batchSize);
    const blockValues: string[] = [];
    const blockParams: any[] = [];
    batch.forEach((block, index) => {
      blockValues.push(`($${index * 2 + 1}, $${index * 2 + 2})`);
      blockParams.push(block.block_number, block.timestamp);
    });

    const insertBlocksQuery = `
      INSERT INTO Blocks (block_number, timestamp)
      VALUES ${blockValues.join(",")}
    `;
    await client.query(insertBlocksQuery, blockParams);
  }
}

// Insert contracts into the database
async function insertContracts(
  contracts: {
    address: string;
    creator_account_id: number;
    creation_block_id: number;
    code_hash: string;
  }[]
) {
  const batchSize = 100;
  for (let i = 0; i < contracts.length; i += batchSize) {
    const batch = contracts.slice(i, i + batchSize);
    const contractValues: string[] = [];
    const contractParams: any[] = [];
    batch.forEach((contract, index) => {
      contractValues.push(
        `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${
          index * 4 + 4
        })`
      );
      contractParams.push(
        contract.address,
        contract.creator_account_id,
        contract.creation_block_id,
        contract.code_hash
      );
    });

    const insertContractsQuery = `
      INSERT INTO Contracts (address, creator_account_id, creation_block_id, code_hash)
      VALUES ${contractValues.join(",")}
    `;
    await client.query(insertContractsQuery, contractParams);
  }
}

// Insert transactions into the database
async function insertTransactions() {
  const batchSize = 1000;
  for (let i = 0; i < 100000; i += batchSize) {
    const batchSizeAdjusted = Math.min(batchSize, 100000 - i);
    const txValues: string[] = [];
    const txParams: any[] = [];

    for (let j = 0; j < batchSizeAdjusted; j++) {
      const tx_hash = randomHash();
      const block_id = Math.floor(Math.random() * 1000) + 1; // Block IDs from 1 to 1000
      const from_account_id = Math.floor(Math.random() * 1000) + 1;
      const to_account_id = Math.floor(Math.random() * 1000) + 1;
      const contract_id = Math.floor(Math.random() * 1000) + 1;
      const value = Math.floor(Math.random() * 100000).toString();
      const gas_used = Math.floor(Math.random() * 100000);

      txValues.push(
        `($${j * 7 + 1}, $${j * 7 + 2}, $${j * 7 + 3}, $${j * 7 + 4}, $${
          j * 7 + 5
        }, $${j * 7 + 6}, $${j * 7 + 7})`
      );
      txParams.push(
        tx_hash,
        block_id,
        from_account_id,
        to_account_id,
        contract_id,
        value,
        gas_used
      );
    }

    const insertTxQuery = `
      INSERT INTO Transactions (tx_hash, block_id, from_account_id, to_account_id, contract_id, value, gas_used)
      VALUES ${txValues.join(",")}
    `;
    await client.query(insertTxQuery, txParams);
    console.log(`Inserted ${i + batchSizeAdjusted} / 100000 transactions`);
  }
}

export async function psqlBootstrap() {
  try {
    await client.connect();

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS Accounts (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        balance NUMERIC(30, 0),
        nonce INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Blocks (
        id SERIAL PRIMARY KEY,
        block_number INTEGER UNIQUE NOT NULL,
        timestamp TIMESTAMP NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Contracts (
        id SERIAL PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        creator_account_id INTEGER REFERENCES Accounts(id),
        creation_block_id INTEGER REFERENCES Blocks(id),
        code_hash VARCHAR(66)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Transactions (
        id SERIAL PRIMARY KEY,
        tx_hash VARCHAR(66) UNIQUE NOT NULL,
        block_id INTEGER REFERENCES Blocks(id),
        from_account_id INTEGER REFERENCES Accounts(id),
        to_account_id INTEGER REFERENCES Accounts(id),
        contract_id INTEGER REFERENCES Contracts(id),
        value NUMERIC(30, 0),
        gas_used INTEGER
      );
    `);

    // Indexes
    await client.query(`
      CREATE INDEX idx_transactions_from_account_id ON Transactions(from_account_id);
      CREATE INDEX idx_transactions_to_account_id ON Transactions(to_account_id);
      CREATE INDEX idx_transactions_block_id ON Transactions(block_id);
      CREATE INDEX idx_transactions_contract_id ON Transactions(contract_id);
      CREATE INDEX idx_transactions_block_id_value_desc ON Transactions(block_id, value DESC);
       CREATE INDEX idx_accounts_balance_desc ON Accounts(balance DESC);
       CREATE INDEX idx_contracts_creator_account_id ON Contracts(creator_account_id);
       CREATE INDEX idx_contracts_creation_block_id ON Contracts(creation_block_id);
       CREATE INDEX idx_blocks_timestamp ON Blocks(timestamp);
    `);

    // Generate and insert data

    // Accounts
    const accounts: { address: string; balance: string; nonce: number }[] = [];

    for (let i = 0; i < 1000; i++) {
      accounts.push({
        address: randomAddress(),
        balance: Math.floor(Math.random() * 100000).toString(),
        nonce: Math.floor(Math.random() * 100),
      });
    }

    await insertAccounts(accounts);
    console.log("Inserted Accounts");

    // Blocks
    const blocks: { block_number: number; timestamp: Date }[] = [];

    for (let i = 0; i < 1000; i++) {
      blocks.push({
        block_number: i + 1,
        timestamp: new Date(Date.now() - (1000 - i) * 60000),
      });
    }

    await insertBlocks(blocks);
    console.log("Inserted Blocks");

    // Contracts
    const contracts: {
      address: string;
      creator_account_id: number;
      creation_block_id: number;
      code_hash: string;
    }[] = [];

    for (let i = 0; i < 1000; i++) {
      contracts.push({
        address: randomAddress(),
        creator_account_id: Math.floor(Math.random() * 1000) + 1, // Account IDs from 1 to 1000
        creation_block_id: Math.floor(Math.random() * 1000) + 1, // Block IDs from 1 to 1000
        code_hash: randomHash(),
      });
    }

    await insertContracts(contracts);
    console.log("Inserted Contracts");

    // Transactions
    await insertTransactions();
    console.log("Inserted Transactions");

    // Close connection
    await client.end();
  } catch (err) {
    console.error(err);
  }
}
