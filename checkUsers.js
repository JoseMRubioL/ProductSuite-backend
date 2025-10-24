// checkUsers.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";

const dbPath = "./data/pedidos.db";

const checkUsers = async () => {
  const db = await open({ filename: dbPath, driver: sqlite3.Database });
  const users = await db.all("SELECT username, password, role FROM users");
  console.table(users);
  await db.close();
};

checkUsers();
