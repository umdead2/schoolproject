import * as api from '/js/api.js';
import * as ui from '/js/ui.js';
import * as modal from '/js/modals.js';

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

window.addEventListener('DOMContentLoaded', async () => {
    ui.setupCityList(CITIES);
    modal.setupTimeInputs();
    modal.setupModalListeners();
    
    const initialJobs = await api.fetchAllJobs();
    ui.renderJobCards(initialJobs);
    
    setupInputRestrictions();
});

function setupInputRestrictions() {
    const limits = {
        'company-name': 100,
        'job-title': 60,
        'job-responsibilities': 300,
        'job-requirements': 300
    };

    Object.entries(limits).forEach(([id, max]) => {
        const el = document.getElementById(id);
        if (el) {
            el.setAttribute('maxlength', max);
            el.addEventListener('input', () => ui.updateCharCount(id, max));
        }
    });

    const salaryMin = document.getElementById('salary-min');
    if (salaryMin) {
        salaryMin.addEventListener('input', function() {
            const min = parseInt(this.value);
            const maxInput = document.getElementById('salary-max');
            if (min && maxInput.value && min > parseInt(maxInput.value)) {
                maxInput.value = min;
            }
        });
    }
}

document.getElementById("btn-filter").addEventListener("click", async (e) => {
    e.preventDefault();
    const filterData = {
        company: document.getElementById('filter-company')?.value || "",
        city: document.getElementById('filter-city').value,
        category: document.getElementById('filter-category').value,
        salary: document.getElementById('filter-salary').value,
    };

    const results = await api.filterJobs(filterData);
    ui.renderJobCards(results);
});

document.getElementById("add-modal").addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
        company_title: document.getElementById("company-name").value,
        job_title: document.getElementById("job-title").value,
        city: document.getElementById("job-city").value,
        category: document.getElementById("job-category").value,
        start_work: document.getElementById("start-hour").value + ":" + document.getElementById("start-min").value,
        end_work: document.getElementById("end-hour").value + ":" + document.getElementById("end-min").value,
        work_from: document.getElementById("date-from").value,
        work_till: document.getElementById("date-to").value,
        min_salary: Number(document.getElementById("salary-min").value),
        max_salary: Number(document.getElementById("salary-max").value),
        open_slots: Number(document.getElementById("open-slots").value),
        job_responsibilities: document.getElementById("job-responsibilities").value,
        job_requirements: document.getElementById("job-requirements").value,
    };

    const response = await api.createAdvertisement(data);
    if (response.ok) {
        alert("Darba sludinājums veiksmīgi izveidots!");
        modal.closeAddForm();
        const updatedJobs = await api.fetchAllJobs();
        ui.renderJobCards(updatedJobs);
    }
});

window.openAddForm = modal.openAddForm;
window.closeAddForm = modal.closeAddForm;