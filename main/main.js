// Show jobs from API
async function showJobs() {
    const container = document.querySelector(".jobs-grid");
    try {
        const response = await fetch('/api/jobs');
        const rows = await response.json(); 
        
        container.innerHTML = "";
        console.log(rows)
        rows.forEach(job => {
            const card = document.createElement("div"); 
            card.className = "job-card";
            card.dataset.id = job.id;
            card.innerHTML = `
            <span class="favorite-star" onclick="saveFavorite(${job.id})">☆</span>
            <div class="header">
                <h2 class="job-title">${job.title}</h2>
                <div class="company-wrapper">
                    <span class="company-name">${job.company_name}</span>
                    <span class="company-rating">⭐ ${job.rating} (${job.reviews} atsauksmes)</span>
                </div>
            </div>

            <div class="meta-info">
                <span class="category-tag">${job.category}</span>
                <span class="slots-tag">Brīvas vietas: ${job.open_slots}</span>
                <span class="status-tag">${job.status}</span>
            </div>

            <div class="info-container">
                <div class="info-row">
                    <span>Alga:</span>
                    <span class="salary">${job.salary_min} - ${job.salary_max} €/mēn.</span>
                </div>
                <div class="info-row">
                    <span>Pilsēta:</span>
                    <span>${job.city}</span>
                </div>
                <div class="info-row">
                    <span>Darba laiks:</span>
                    <span>${job.start_work} - ${job.end_work}</span>
                </div>
                <div class="info-row">
                    <span>Strāda:</span>
                    <span>${job.work_from} - ${job.work_till}</span>
                </div>
            </div>

            <p class="description">
                <strong>Pienākumi:</strong> ${job.responsibilities}</p>

            <div class="footer-stats">
                <span>📊 Pieteikušies: ${job.applicants}</span>
                <span>📅 ${job.created_at}</span>
            </div>

            <div class="actions">
                <button class="main-btn">Pieteikties</button>
                <button class="side-btn">Čats</button>
            </div>
        </div>
        `
        container.appendChild(card);
        });

    } catch (error) {
        console.error("Could not fetch jobs:", error);
    }
}

// Open modal
function openAddForm() {
    const modal = document.getElementById("add-modal");
    if (modal) {
        // Iestatām datuma limitus pirms atvēršanas
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if(dateFrom) dateFrom.max = "3000-12-31";
        if(dateTo) dateTo.max = "3000-12-31";

        modal.classList.add('open');
    }
}

// Close modal
function closeAddForm() {
    const modal = document.getElementById("add-modal");
    if (modal) {
        modal.classList.remove('open');
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', function(event) {
    const modal = document.getElementById('add-modal');
    if (event.target === modal) {
        closeAddForm();
    }
});

// --- Form Input Handlers ---

// Time input formatting (2 digits)
const timeInputs = document.querySelectorAll('.time-input');
timeInputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.value = '';
    });

    input.addEventListener('input', function() {
        let value = this.value.replace(/[^\d]/g, '');
        
        const max = this.id.includes('min') ? 59 : 23;
        
        if (value.length > 2) {
            value = value.slice(0, 2);
        }
        
        if (value && parseInt(value) > max) {
            value = max.toString().padStart(2, '0');
        }
        
        this.value = value;
    });

    input.addEventListener('blur', function() {
        if (this.value.length === 1) {
            this.value = this.value.padStart(2, '0');
        }
        if (!this.value) {
            this.value = '';
        }
    });
});

// Character limit for company name
const companyName = document.getElementById('company-name');
if (companyName) {
    companyName.setAttribute('maxlength', '100');
    companyName.addEventListener('input', function() {
        updateCharCount('company-name', 100);
    });
}

// Character limit for job title
const jobTitle = document.getElementById('job-title');
if (jobTitle) {
    jobTitle.setAttribute('maxlength', '60');
    jobTitle.addEventListener('input', function() {
        updateCharCount('job-title', 60);
    });
}

// Character limit for responsibilities
const responsibilities = document.getElementById('job-responsibilities');
if (responsibilities) {
    responsibilities.setAttribute('maxlength', '300');
    responsibilities.addEventListener('input', function() {
        updateCharCount('job-responsibilities', 300);
    });
}

// Character limit for requirements
const requirements = document.getElementById('job-requirements');
if (requirements) {
    requirements.setAttribute('maxlength', '300');
    requirements.addEventListener('input', function() {
        updateCharCount('job-requirements', 300);
    });
}

// Update character counter display
function updateCharCount(elementId, maxChars) {
    const element = document.getElementById(elementId);
    if (element) {
        const count = element.value.length;
        const counter = element.parentElement.querySelector('.char-count');
        if (counter) {
            counter.textContent = `${count}/${maxChars}`;
        }
    }
}

// Salary validation
const salaryMin = document.getElementById('salary-min');
if (salaryMin) {
    salaryMin.addEventListener('input', function() {
        const min = parseInt(this.value);
        const max = parseInt(document.getElementById('salary-max').value);
        if (min && max && min > max) {
            document.getElementById('salary-max').value = min;
        }
    });
}

// Load jobs on page load
showJobs();