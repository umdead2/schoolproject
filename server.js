const express = require("express");
const Database = require('better-sqlite3');
const path = require("path");
const db = new Database('jobs.db');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "main")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "main/main.html"));
});

app.get('/api/jobs', (req, res) => {
    try {
            const sql = `
            SELECT 
                jobs.*, 
                companies.name AS company_name, 
                companies.rating, 
                companies.reviews
            FROM jobs
            LEFT JOIN companies ON jobs.company_id = companies.id
        `;
            
            const rows = db.prepare(sql).all(); 
            res.json(rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
    }
});

(async () => {
    try {
        app.listen(process.env.PORT || 3000, "0.0.0.0", () => {
            console.log("Server running");
        });
    } catch (err) {
        console.error("Failed to start browser:", err);
        process.exit(1);
    }
})();