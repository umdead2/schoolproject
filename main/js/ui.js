// js/ui.js

export function renderJobCards(rows) {
    const container = document.querySelector(".jobs-grid");
    container.innerHTML = "";
    
    if (!rows || rows.length === 0) {
        container.innerHTML = "<p>Netika atrasts neviens sludinājums.</p>";
        return;
    }

    rows.forEach(job => {
        const card = document.createElement("div"); 
        card.className = "job-card";
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