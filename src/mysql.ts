// This file is the entry point of the application. It initializes the application and sets up the benchmarks for both MySQL and PostgreSQL.
import dotenv from "dotenv";

import { benchmarkMysql } from "./benchmark/mysql-benchmark";

dotenv.config();

benchmarkMysql();
