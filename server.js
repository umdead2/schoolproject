const express = require("express");
const Database = require('better-sqlite3');
const session = require('express-session');
const path = require("path");
const db = new Database('jobs.db');
const app = express();
const bcrypt = require('bcrypt');
const cors = require("cors");

app.use(cors());
app.use(express.json());
// ✅ FIX: Serve static files from both directories without path prefix
app.use(express.static(path.join(__dirname, "main")));
app.use(express.static(path.join(__dirname, "profile")));

app.use(session({
    secret: 'mana-supre-slepena-atslega',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// --- Auth Endpoints ---

app.get('/api/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            loggedIn: true,
            username: req.session.username,
            iscompany: req.session.iscompany,
            userId: req.session.userId
        });
    } else {
        res.json({ loggedIn: false });
    }
});

app.patch('/api/jobs/:id', (req, res) => {

    if (!req.session.userId) {
        return res.status(401).json({
            error: 'Jums jābūt pieslēgtam'
        });
    }

    const jobId = req.params.id;
    const data = req.body;

    try {

        const job = db.prepare(`
            SELECT * FROM jobs
            WHERE id = ?
        `).get(jobId);

        if (!job) {
            return res.status(404).json({
                error: 'Vakance nav atrasta'
            });
        }

        if (job.user_id !== req.session.userId) {
            return res.status(403).json({
                error: 'Nav atļauts rediģēt šo vakanci'
            });
        }

        const stmt = db.prepare(`
            UPDATE jobs
            SET
                title = ?,
                city = ?,
                category = ?,
                responsibilities = ?,
                requirements = ?,
                start_work = ?,
                end_work = ?,
                work_from = ?,
                work_till = ?,
                salary_min = ?,
                salary_max = ?,
                open_slots = ?
            WHERE id = ?
        `);

        stmt.run(
            data.title ?? data.job_title ?? job.title,
            data.city ?? job.city,
            data.category ?? job.category,
            data.responsibilities ?? data.job_responsibilities ?? job.responsibilities,
            data.requirements ?? job.requirements,
            data.start_work ?? job.start_work,
            data.end_work ?? job.end_work,
            data.work_from ?? job.work_from,
            data.work_till ?? job.work_till,
            data.salary_min ?? data.min_salary ?? job.salary_min,
            data.salary_max ?? data.max_salary ?? job.salary_max,
            data.open_slots ?? job.open_slots,
            jobId
        );

        res.json({
            success: true,
            message: 'Vakance atjaunināta'
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: err.message
        });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "E-pasts un parole ir obligāti" });
    }

    try {
        const user = db.prepare('SELECT * FROM user WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({ error: "Nekonstatēts lietotājs ar šādu e-pastu" });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: "Nepareiza parole" });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.iscompany = user.iscompany;

        res.json({ success: true, message: "Sekmīgi pieslēdzies" });

    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ error: "Pieslēgšanās kļūda" });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed" });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// --- Job Endpoints ---

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "main", "main.html"));
});

app.get('/api/jobs', (req, res) => {
    const currentUserId = req.session.userId || 0;
    try {
        const sql = `
            SELECT jobs.*, companies.name AS company_name, 
            (SELECT 1 FROM favorites WHERE user_id = ? AND job_id = jobs.id) AS is_favorite
            FROM jobs
            LEFT JOIN companies ON jobs.company_id = companies.id
            WHERE jobs.status = 'open'
            ORDER BY jobs.created_at DESC
        `;
        const rows = db.prepare(sql).all(currentUserId); 
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/advertisement', (req, res) => {
    // Check if user is logged in and is a company
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: "Jums jābūt pieslēgtam" });
    }

    if (req.session.iscompany !== 1) {
        return res.status(403).json({ error: "Tikai uzņēmumi var publicēt vakances" });
    }

    const data = req.body;
    
    try {
        let company = db.prepare('SELECT * FROM companies WHERE id IN (SELECT company_id FROM jobs WHERE user_id = ?)').get(req.session.userId);
        
        let company_id;
        if (!company) {
            const companyStmt = db.prepare(`
                INSERT INTO companies (name, rating, reviews) 
                VALUES (?, ?, ?)
            `);
            const companyResult = companyStmt.run(req.session.username, 0, 0);
            company_id = companyResult.lastInsertRowid;
        } else {
            company_id = company.id;
        }
        
        // Insert job
        const jobStmt = db.prepare(`
            INSERT INTO jobs (
                title,
                company_id,
                user_id,
                status,
                open_slots,
                salary_min,
                salary_max,
                city,
                category,
                responsibilities,
                applicants,
                start_work,
                end_work,
                work_from,
                work_till,
                requirements
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const jobResult = jobStmt.run(
            data.job_title,
            company_id,
            req.session.userId,
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
            data.requirements || null
        );
        
        res.json({ 
            success: true, 
            jobId: jobResult.lastInsertRowid,
            companyId: company_id,
            message: "Darba sludinājums veiksmīgi izveidots"
        });
        
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/filter', (req, res) => {
    const filters = req.body;
    let sql = `
        SELECT 
            jobs.*, 
            companies.name AS company_name, 
            companies.rating, 
            companies.reviews
        FROM jobs 
        LEFT JOIN companies ON jobs.company_id = companies.id 
        WHERE jobs.status = 'open'`; 

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

    sql += ` ORDER BY jobs.created_at DESC`;

    try {
        const rows = db.prepare(sql).all(...params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/register', async (req, res) => {
    const { username, email, password, iscompany, phone } = req.body;

    // 1. Basic validation
    if (!username || !email || !password) {
        return res.status(400).json({ error: "Lūdzu aizpildiet visus obligātos laukus!" });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: "Parole jābūt vismaz 6 rakstzīmes!" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = `
            INSERT INTO user (username, email, password, phone, iscompany) 
            VALUES (?, ?, ?, ?, ?)
        `;

        const result = db.prepare(sql).run(
            username, 
            email, 
            hashedPassword, 
            phone || null, 
            iscompany 
        );

        req.session.userId = result.lastInsertRowid;
        req.session.username = username;
        req.session.iscompany = iscompany;

        res.json({ success: true, message: "Lietotājs veiksmīgi reģistrēts!" });

    } catch (err) {
        console.error("Register error:", err);
        if (err.message.includes('UNIQUE constraint failed: user.email')) {
            return res.status(400).json({ error: "E-pasts jau tiek lietots!" });
        }
        if (err.message.includes('UNIQUE constraint failed: user.username')) {
            return res.status(400).json({ error: "Lietotājvārds jau tiek lietots!" });
        }
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/favorites/toggle', (req, res) => {
    if (!req.session.userId) return res.status(401).json({ error: "Jāpierakstās" });
    const { jobId } = req.body;
    const existing = db.prepare('SELECT id FROM favorites WHERE user_id = ? AND job_id = ?').get(req.session.userId, jobId);
    
    if (existing) {
        db.prepare('DELETE FROM favorites WHERE id = ?').run(existing.id);
        res.json({ status: 'removed' });
    } else {
        db.prepare('INSERT INTO favorites (user_id, job_id) VALUES (?, ?)').run(req.session.userId, jobId);
        res.json({ status: 'added' });
    }
});

app.get('/api/favorites', (req, res) => {
    const userId = req.query.userId || req.session.userId;
    if (!userId) return res.status(400).json({ error: "Nav ID" });
    const rows = db.prepare(`
        SELECT jobs.*, companies.name as company_name 
        FROM favorites 
        JOIN jobs ON favorites.job_id = jobs.id
        LEFT JOIN companies ON jobs.company_id = companies.id
        WHERE favorites.user_id = ?
    `).all(userId);
    res.json(rows);
});


app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.json({ success: true });
});

app.get('/api/user/:username', (req, res) => {
    const { username } = req.params;
    const currentUserId = req.session.userId || 0; // Ielogotā lietotāja ID vai 0

    try {
        const user = db.prepare('SELECT id, username, email, phone, iscompany FROM user WHERE username = ?').get(username);
        if (!user) return res.status(404).json({ error: "Lietotājs nav atrasts" });

        let jobs = [];
        if (user.iscompany === 1) {
            // ✅ Šeit ir "maģija": mēs pievienojam EXISTS pārbaudi
            jobs = db.prepare(`
                SELECT jobs.*, companies.name as company_name,
                (SELECT 1 FROM favorites WHERE user_id = ? AND job_id = jobs.id) AS is_favorite
                FROM jobs 
                LEFT JOIN companies ON jobs.company_id = companies.id 
                WHERE jobs.user_id = ?
            `).all(currentUserId, user.id);
        }

        res.json({ user, jobs });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ FIX: Serve profile.html for /user/:username route
app.get('/user/:username', (req, res) => {
    res.sendFile(path.join(__dirname, "profile", "profile.html"));
});

// --- Server Start ---

(async () => {
    try {
        app.listen(3000, "0.0.0.0", () => {
            console.log("🚀 Server running on http://localhost:3000");
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
})();