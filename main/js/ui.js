export function renderJobCards(rows) {
    const container = document.querySelector(".jobs-grid");
    container.innerHTML = "";
    
    if (!rows || rows.length === 0) {
        container.innerHTML = "<p style='grid-column: 1/-1; text-align: center; color: #a0aec0; padding: 40px;'>Netika atrasts neviens sludinājums.</p>";
        return;
    }

    rows.forEach(job => {
        const card = document.createElement("div"); 
        card.className = "job-card";
        
        const salary = `${job.salary_min} - ${job.salary_max} €/mēn.`;
        const workDates = `${formatDate(job.work_from)} - ${formatDate(job.work_till)}`;
        const applicants = job.applicants || 0;
        
        card.innerHTML = `
            <span class="favorite-star" onclick="saveFavorite(${job.id})">☆</span>
            <div class="header">
                <h2 class="job-title">${escapeHtml(job.title)}</h2>
                <div class="company-wrapper">
                    <span class="company-name">${escapeHtml(job.company_name || 'Kompānija')}</span>
                    <span class="company-rating">⭐ ${(job.rating || 0).toFixed(1)} (${job.reviews || 0} atsauksmes)</span>
                </div>
            </div>

            <div class="meta-info">
                <span class="category-tag">${escapeHtml(job.category)}</span>
                <span class="slots-tag">🔓 ${job.open_slots} brīvas</span>
                <span class="status-tag">${job.status === 'open' ? '✓ Aktīva' : 'Slēgta'}</span>
            </div>

            <div class="info-container">
                <div class="info-row">
                    <span class="info-row-label">💰 Alga:</span>
                    <span class="salary">${salary}</span>
                </div>
                <div class="info-row">
                    <span class="info-row-label">📍 Pilsēta:</span>
                    <span>${escapeHtml(job.city)}</span>
                </div>
                <div class="info-row">
                    <span class="info-row-label">🕐 Laiks:</span>
                    <span>${job.start_work} - ${job.end_work}</span>
                </div>
                <div class="info-row">
                    <span class="info-row-label">📅 Periods:</span>
                    <span>${workDates}</span>
                </div>
            </div>

            <p style="font-size: 13px; color: #555; margin: 12px 0; line-height: 1.4;">
                <strong>Pienākumi:</strong> ${escapeHtml(job.responsibilities).substring(0, 100)}${job.responsibilities.length > 100 ? '...' : ''}</p>

            <div class="footer-stats">
                <span>👥 Pieteikušies: ${applicants}</span>
                <span>📅 ${formatDate(job.created_at)}</span>
            </div>

            <div class="actions">
                <button class="main-btn" onclick="applyForJob(${job.id})">Pieteikties</button>
                <button class="side-btn" onclick="contactCompany(${job.id})">💬 Čats</button>
            </div>
        `;
        container.appendChild(card);
    });
}

export function setupCityList(cities) {
    const datalist = document.getElementById('city-list');
    if (!datalist) return;
    cities.sort((a, b) => a.localeCompare(b, 'lv'));
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}

export function updateCharCount(elementId, maxChars) {
    const element = document.getElementById(elementId);
    if (element) {
        const count = element.value.length;
        const counter = element.parentElement.querySelector('.char-count');
        if (counter) counter.textContent = `${count}/${maxChars}`;
    }
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDate(dateString) {
    if (!dateString) return 'Nav norādīts';
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Global functions
window.saveFavorite = function(jobId) {
    const star = event.target;
    star.classList.toggle('active');
    // Save to localStorage or backend
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (star.classList.contains('active')) {
        favorites.push(jobId);
        star.textContent = '★';
    } else {
        favorites = favorites.filter(id => id !== jobId);
        star.textContent = '☆';
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
};

window.applyForJob = function(jobId) {
    alert(`Pieteikšanās darbam #${jobId} (tiek implementēts)`);
};

window.contactCompany = function(jobId) {
    alert(`Sazināšanās par darbu #${jobId} (tiek implementēts)`);
};