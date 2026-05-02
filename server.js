const express = require("express");
const Database = require('better-sqlite3');
const session = require('express-session');
const path = require("path");
const db = new Database('jobs.db');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "main")));

app.use(session({
    secret: 'summer-job-secret-key', 
    resave: false,                  
    saveUninitialized: false,       
    cookie: { 
        maxAge: 24 * 60 * 60 * 1000, 
        httpOnly: true               
    }
}));

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
    
    try {
        // First, insert the company
        const companyStmt = db.prepare(`
            INSERT INTO companies (name, rating, reviews) 
            VALUES (?, ?, ?)
        `);
        
        const companyResult = companyStmt.run(data.company_title, 0, 0);
        const company_id = companyResult.lastInsertRowid;
        
        // Then insert the job with the new company_id
        const jobStmt = db.prepare(`
            INSERT INTO jobs (
                title, company_id, status, open_slots, salary_min, 
                salary_max, city, category, responsibilities, applicants, 
                start_work, end_work, work_from, work_till, requirements
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const jobResult = jobStmt.run(
            data.job_title,
            company_id,
            'open',
            data.open_slots,
            data.min_salary,
            data.max_salary,
            data.city,
            data.category,
            data.job_responsibilities,
            0,
            data.start_work,
            data.end_work,
            data.work_from,
            data.work_till,
            data.job_requirements
        );
        
        res.json({ 
            success: true, 
            jobId: jobResult.lastInsertRowid,
            companyId: company_id,
            message: "Job advertisement created successfully"
        });
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/filter', (req, res) => {
    const filters = req.body;
    req.session.userId = 101;
        req.session.isCompany = 1; 
        req.session.username = "Super Company SIA";
    let sql = `
        SELECT 
            jobs.*, 
            companies.name AS company_name, 
            companies.rating, 
            companies.reviews
        FROM jobs 
        LEFT JOIN companies ON jobs.company_id = companies.id 
        WHERE 1=1`; 

    const params = [];

    if (filters.company) {
        sql += ` AND companies.name LIKE ?`;
        params.push(`%${filters.company}%`);
    }
    if (filters.city && filters.city !== "") {
        sql += ` AND jobs.city LIKE ?`;
        params.push(`%${filters.city}%`);
    }
    if (filters.category && filters.category !== "all") {
        sql += ` AND jobs.category = ?`;
        params.push(filters.category);
    }
    if (filters.salary) {
        sql += ` AND jobs.salary_min >= ?`;
        params.push(Number(filters.salary));
    }

    try {
        const rows = db.prepare(sql).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
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