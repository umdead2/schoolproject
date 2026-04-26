const express = require("express");
const Database = require('better-sqlite3');
const path = require("path");
const db = new Database('jobs.db');
const app = express();
const port = process.env.PORT || 3000;

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

app.post('/api/advertisement', (req, res) => {
    const data = req.body;
    const company = `INSERT INTO companies `
    const query = `INSERT INTO job (
        title, company_id, status, open_slots, salary_min, 
        salary_max, city, category, responsibilities, applicants, 
        created_at, start_work, end_work,  work_from, work_till, 
        requirements
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const values = [
        data.company_title,
        data.job_title,
        data.city,
        data.category,
        data.start_work,
        data.end_work,
        data.work_from,
        data.work_till,
        data.min_salary,
        data.max_salary,
        data.open_slots,
        data.job_responsibilities,
        data.job_requirements
    ];
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