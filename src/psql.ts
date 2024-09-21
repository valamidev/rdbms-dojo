// This file is the entry point of the application. It initializes the application and sets up the benchmarks for both MySQL and PostgreSQL.
import dotenv from "dotenv";

import { benchmarkPsql } from "./benchmark/pg-benchmark";

dotenv.config();

benchmarkPsql();
