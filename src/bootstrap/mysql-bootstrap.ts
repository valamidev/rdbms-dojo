import mysql from "mysql2/promise";
import crypto from "crypto";

let connection: mysql.Connection;

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
    const placeholders: string[] = [];
    const accountParams: any[] = [];
    batch.forEach((account) => {
      placeholders.push("(?, ?, ?)");
      accountParams.push(account.address, account.balance, account.nonce);
    });

    const insertAccountsQuery = `
      INSERT INTO Accounts (address, balance, nonce)
      VALUES ${placeholders.join(",")}
    `;
    await connection.execute(insertAccountsQuery, accountParams);
  }
}

// Insert blocks into the database
async function insertBlocks(
  blocks: { block_number: number; timestamp: Date }[]
) {
  const batchSize = 100;
  for (let i = 0; i < blocks.length; i += batchSize) {
    const batch = blocks.slice(i, i + batchSize);
    const placeholders: string[] = [];
    const blockParams: any[] = [];
    batch.forEach((block) => {
      placeholders.push("(?, ?)");
      blockParams.push(block.block_number, block.timestamp);
    });

    const insertBlocksQuery = `
      INSERT INTO Blocks (block_number, timestamp)
      VALUES ${placeholders.join(",")}
    `;
    await connection.execute(insertBlocksQuery, blockParams);
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
    const placeholders: string[] = [];
    const contractParams: any[] = [];
    batch.forEach((contract) => {
      placeholders.push("(?, ?, ?, ?)");
      contractParams.push(
        contract.address,
        contract.creator_account_id,
        contract.creation_block_id,
        contract.code_hash
      );
    });

    const insertContractsQuery = `
      INSERT INTO Contracts (address, creator_account_id, creation_block_id, code_hash)
      VALUES ${placeholders.join(",")}
    `;
    await connection.execute(insertContractsQuery, contractParams);
  }
}

// Insert transactions into the database
async function insertTransactions() {
  const batchSize = 1000;
  for (let i = 0; i < 100000; i += batchSize) {
    const batchSizeAdjusted = Math.min(batchSize, 100000 - i);
    const txPlaceholders: string[] = [];
    const txParams: any[] = [];

    for (let j = 0; j < batchSizeAdjusted; j++) {
      const tx_hash = randomHash();
      const block_id = Math.floor(Math.random() * 1000) + 1; // Block IDs from 1 to 1000
      const from_account_id = Math.floor(Math.random() * 1000) + 1;
      const to_account_id = Math.floor(Math.random() * 1000) + 1;
      const contract_id = Math.floor(Math.random() * 1000) + 1;
      const value = Math.floor(Math.random() * 100000).toString();
      const gas_used = Math.floor(Math.random() * 100000);

      txPlaceholders.push("(?, ?, ?, ?, ?, ?, ?)");
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
      VALUES ${txPlaceholders.join(",")}
    `;
    await connection.execute(insertTxQuery, txParams);
    console.log(`Inserted ${i + batchSizeAdjusted} / 100000 transactions`);
  }
}

export async function mysqlBootstrap() {
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: process.env.MYSQL_USER || "mysql",
      password: process.env.MYSQL_PASSWORD || "password",
      database: process.env.MYSQL_DATABASE || "benchmark_db",
      port: Number(process.env.MYSQL_PORT) || 43306,
    });

    // Create tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        balance DECIMAL(30, 0),
        nonce INT
      ) ENGINE=InnoDB;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Blocks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        block_number INT UNIQUE NOT NULL,
        timestamp TIMESTAMP NOT NULL
      ) ENGINE=InnoDB;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Contracts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        address VARCHAR(42) UNIQUE NOT NULL,
        creator_account_id INT,
        creation_block_id INT,
        code_hash VARCHAR(66),
        FOREIGN KEY (creator_account_id) REFERENCES Accounts(id),
        FOREIGN KEY (creation_block_id) REFERENCES Blocks(id)
      ) ENGINE=InnoDB;
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS Transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tx_hash VARCHAR(66) UNIQUE NOT NULL,
        block_id INT,
        from_account_id INT,
        to_account_id INT,
        contract_id INT,
        value DECIMAL(30, 0),
        gas_used INT,
        FOREIGN KEY (block_id) REFERENCES Blocks(id),
        FOREIGN KEY (from_account_id) REFERENCES Accounts(id),
        FOREIGN KEY (to_account_id) REFERENCES Accounts(id),
        FOREIGN KEY (contract_id) REFERENCES Contracts(id)
      ) ENGINE=InnoDB;
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
    await connection.end();
  } catch (err) {
    console.error(err);
  }
}
