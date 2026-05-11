/* js/ui.js */

const CITIES = [
    "Ainaži", "Aizkraukle", "Aizpute", "Aknīste", "Aloja", "Alūksne", "Ape", "Auce", 
    "Baldone", "Baloži", "Balvi", "Bauska", "Brocēni", "Cēsis", "Cesvaine", "Dagda", 
    "Daugavpils", "Dobele", "Durbe", "Grobiņa", "Gulbene", "Ikšķile", "Ilūkste", 
    "Jaunjelgava", "Jēkabpils", "Jelgava", "Jūrmala", "Kandava", "Kārsava", "Krāslava", 
    "Kuldīga", "Ķegums", "Lielvārde", "Liepāja", "Līgatne", "Limbāži", "Līvāni", 
    "Lubāna", "Ludza", "Madona", "Mazsalaca", "Ogre", "Olaine", "Pāvilosta", "Piltene", 
    "Pļaviņas", "Preiļi", "Priekule", "Rēzekne", "Rīga", "Rūjiena", "Sabile", "Salacgrīva", 
    "Salaspils", "Saldus", "Saulkrasti", "Seda", "Sigulda", "Skrunda", "Smiltene", 
    "Staicele", "Stende", "Strenči", "Subate", "Talsi", "Tukums", "Valdemārpils", 
    "Valka", "Valmiera", "Vangaži", "Varakļāni", "Ventspils", "Viesīte", "Viļaka", "Viļāni", "Zilupe"
];

/**
 * Aizpilda datalist ar pilsētām
 */
export function setupCityList(cities = CITIES) {
    const datalist = document.getElementById('city-list');
    if (!datalist) return;
    datalist.innerHTML = "";
    const sortedCities = [...cities].sort((a, b) => a.localeCompare(b, 'lv'));
    sortedCities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        datalist.appendChild(option);
    });
}

/**
 * Attēlo darba sludinājumu kartītes gridā
 */
export function renderJobCards(rows, currentUserId = null) {
    const container = document.querySelector(".jobs-grid");
    if (!container) return;
    
    container.innerHTML = "";
    
    if (!rows || rows.length === 0) {
        container.innerHTML = `
            <p style='grid-column: 1/-1; text-align: center; color: #a0aec0; padding: 40px;'>
                Netika atrasts neviens sludinājums.
            </p>`;
        return;
    }

    rows.forEach(job => {
        const card = document.createElement("div"); 
        card.className = "job-card";
        
        const isOwner = currentUserId && job.user_id === currentUserId;
        const salary = `${job.salary_min} - ${job.salary_max} €/mēn.`;
        const workDates = `${formatDate(job.work_from)} - ${formatDate(job.work_till)}`;
        
        const actionButton = isOwner 
            ? `<button class="side-btn" onclick="editJob(${job.id})">⚙️ Labot</button>`
            : `<button class="main-btn" onclick="applyForJob(${job.id})">Pieteikties</button>`;
        
        const starClass = job.is_favorite ? 'favorite-star active' : 'favorite-star';
        const starIcon = job.is_favorite ? '★' : '☆';

        card.innerHTML = `
            <span class="${starClass}" onclick="toggleFavorite(${job.id}, this)">${starIcon}</span>
            <div class="header">
                <h2 class="job-title">${escapeHtml(job.title)}</h2>
                <div class="company-wrapper">
                    <span class="company-name">${escapeHtml(job.company_name || 'Kompānija')}</span>
                    <span class="company-rating">⭐ ${(job.rating || 0).toFixed(1)} (${job.reviews || 0} atsauksmes)</span>
                </div>
            </div>

            <div class="meta-info">
                <span class="category-tag">${escapeHtml(job.category)}</span>
                <span class="slots-tag">🔓 ${job.open_slots} vietas</span>
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

            <div class="job-description">
                <p><strong>Pienākumi:</strong> ${escapeHtml(job.responsibilities || '').substring(0, 120)}${job.responsibilities?.length > 120 ? '...' : ''}</p>
                <p><strong>Prasības:</strong> ${escapeHtml(job.requirements || 'Nav norādītas')}</p>
            </div>

            <div class="footer-stats">
                <span>👥 Pieteikušies: ${job.applicants || 0}</span>
                <span>📅 ${formatDate(job.created_at)}</span>
            </div>

            <div class="actions">
                ${actionButton}
                <button class="side-btn" onclick="contactCompany(${job.id})">💬 Čats</button>
            </div>
        `;
        container.appendChild(card);
    });
}

/**
 * Atver labošanas formu un aizpilda to ar datiem
 */
window.editJob = async function(jobId) {

    if (!jobId) {
        console.error("jobId is missing!");
        return;
    }

    try {
        const res = await fetch(`/api/jobs/${jobId}`);

        if (!res.ok) {
            const text = await res.text();
            console.error("Server response:", text);
            throw new Error("Nevarēja ielādēt datus");
        }

        const job = await res.json();

        const modal = document.getElementById('add-modal');
        const form = document.getElementById('add-job-form');
        const titleElement = document.querySelector('#add-modal h2');

        if (!modal || !form) return console.error("Modālais logs vai forma nav atrasta!");

        if (titleElement) titleElement.textContent = "Labot vakanci";

        const fill = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val || "";
        };

        fill('job-title', job.title);
        fill('job-city', job.city);
        fill('job-category', job.category);
        fill('salary-min', job.salary_min);
        fill('salary-max', job.salary_max);
        fill('job-responsibilities', job.responsibilities);
        fill('job-requirements', job.requirements); // Pievienots Requirements aizpildīšanai
        fill('date-from', job.work_from);
        fill('date-to', job.work_till);
        fill('open-slots', job.open_slots);

        if (job.start_work) {
            const [h, m] = job.start_work.split(':');
            fill('start-hour', h); fill('start-min', m);
        }
        if (job.end_work) {
            const [h, m] = job.end_work.split(':');
            fill('end-hour', h); fill('end-min', m);
        }

        form.dataset.editId = jobId;

        if (window.openAddForm) window.openAddForm();
        else modal.classList.add('open');

    } catch (err) {
        console.error("Kļūda labošanā:", err);
    }
};

window.toggleFavorite = async function(jobId, element) {
    try {
        const res = await fetch('/api/favorites/toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId })
        });
        
        if (res.status === 401) return console.warn("Lūdzu ielogojieties!");

        if (res.ok) {
            const data = await res.json();
            const isActive = data.status === 'added';
            element.classList.toggle('active', isActive);
            element.textContent = isActive ? '★' : '☆';

            const sectionTitle = document.querySelector('#company-section h3')?.textContent;
            if (!isActive && sectionTitle === "Mana izlase") {
                const card = element.closest('.job-card');
                card.style.opacity = '0';
                card.style.transform = 'scale(0.9)';
                setTimeout(() => card.remove(), 300);
            }
        }
    } catch (err) { console.error(err); }
};

export function updateCharCount(elementId, maxChars) {
    const element = document.getElementById(elementId);
    if (element) {
        const count = element.value.length;
        const counter = element.parentElement.querySelector('.char-count');
        if (counter) counter.textContent = `${count}/${maxChars}`;
    }
}

function escapeHtml(text) {
    const map = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'};
    return text ? text.replace(/[&<>"']/g, m => map[m]) : "";
}

function formatDate(dateString) {
    if (!dateString) return 'Nav norādīts';
    const date = new Date(dateString);
    return date.toLocaleDateString('lv-LV', { year: 'numeric', month: 'short', day: 'numeric' });
}

window.addEventListener('DOMContentLoaded', () => setupCityList());
window.applyForJob = (id) => console.log(`Pieteikties darbam #${id}`);
window.contactCompany = (id) => console.log(`Čats par darbu #${id}`);