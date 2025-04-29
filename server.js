import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = "https://3k9ylm-5173.csb.app/";

app.use(cors());
app.use(express.json());

// PostgreSQL connection
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Dashboard",
  password: "root",
  port: 5432,
});

db.connect()
  .then(() => console.log("Connected to PostgreSQL database"))
  .catch((err) => console.error("Database connection error", err.stack));

// Route to fetch data
app.get("/projects", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM project");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error querying the database");
  }
});

app.listen(port, () => {
  console.log(`Server running at https://3k9ylm-5173.csb.app/`);
});
