// This file is the entry point of the application. It initializes the application and sets up the benchmarks for both MySQL and PostgreSQL.
import dotenv from "dotenv";

import { mysqlBootstrap } from "./bootstrap/mysql-bootstrap";
import { psqlBootstrap } from "./bootstrap/postgres-bootstrap";

dotenv.config();

Promise.all([mysqlBootstrap, psqlBootstrap]).catch((err) => console.error(err));
