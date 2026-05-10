/* js/main.js */
import * as api from './api.js';
import * as ui from './ui.js';
import * as modal from './modals.js';

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

// --- Inicilizācija ---
window.addEventListener('DOMContentLoaded', async () => {
    // 1. Iestatām UI elementus
    ui.setupCityList(CITIES);
    modal.setupTimeInputs();
    modal.setupModalListeners();
    
    // 2. Ielādējam vakances
    try {
        const initialJobs = await api.fetchAllJobs();
        ui.renderJobCards(initialJobs);
    } catch (e) {
        console.error("Kļūda ielādējot vakances:", e);
    }
    
    // 3. Pārbaudām sesiju un sakārtojam Headeri
    await updateUIBasedOnAuth();
    
    // 4. Pieslēdzam formu klausītājus
    setupFormListeners();
});

// --- Autentifikācijas UI vadība ---
async function updateUIBasedOnAuth() {
    try {
        const user = await api.checkAuth();
        
        const addBtn = document.getElementById('add_ad');
        const authMenu = document.getElementById('auth-menu');
        const userMenu = document.getElementById('user-menu');
        const greeting = document.getElementById('user-greeting');
        const userType = document.getElementById('user-type');
        const avatar = document.getElementById('user-avatar');

        if (user.loggedIn) {
            // Paslēpjam Login/Register, parādām Profilu
            authMenu.style.setProperty('display', 'none', 'important');
            userMenu.style.display = 'flex';

            // Aizpildām lietotāja datus
            greeting.textContent = user.username;
            avatar.textContent = user.username.charAt(0).toUpperCase();
            
            if (user.iscompany === 1) {
                userType.textContent = '🏢 Uzņēmums';
                addBtn.style.display = 'inline-block';
            } else {
                userType.textContent = '👤 Students';
                addBtn.style.display = 'none';
            }
        } else {
            // Nav ielogojies: rādām tikai Login pogas
            authMenu.style.display = 'flex';
            userMenu.style.setProperty('display', 'none', 'important');
            addBtn.style.display = 'none';
        }
    } catch (e) {
        console.error("Autentifikācijas pārbaude neizdevās:", e);
    }
}

// --- Formu apstrāde ---
function setupFormListeners() {
    // Ielogošanās
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const res = await api.loginUser(email, password);
        if (res.ok) {
            modal.closeLoginModal();
            window.location.reload();
        } else {
            const err = await res.json();
            console.error("Login Error:", err.error);
        }
    });

    // Reģistrācija (ar Auto-Login)
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            phone: document.getElementById('reg-phone').value,
            password: document.getElementById('reg-password').value,
            iscompany: Number(document.querySelector('input[name="reg-iscompany"]:checked').value)
        };

        const res = await api.registerUser(data);
        if (res.ok) {
            // Automātiski ielogojamies pēc reģistrācijas
            const loginRes = await api.loginUser(data.email, data.password);
            if (loginRes.ok) {
                modal.closeRegisterModal();
                window.location.reload();
            }
        } else {
            const err = await res.json();
            console.error("Registration Error:", err.error);
        }
    });

    // Filtra forma
    document.getElementById('filter-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const filterData = {
            company: document.getElementById('filter-company').value,
            city: document.getElementById('filter-city').value,
            category: document.getElementById('filter-category').value,
            salary: document.getElementById('filter-salary').value,
        };
        const results = await api.filterJobs(filterData);
        ui.renderJobCards(results);
    });

    // Jaunas vakances pievienošana
    document.getElementById('add-job-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
        job_title: document.getElementById('job-title').value,
        city: document.getElementById('job-city').value,
        category: document.getElementById('job-category').value,
        start_work: document.getElementById('start-hour').value + ':' + document.getElementById('start-min').value,
        end_work: document.getElementById('end-hour').value + ':' + document.getElementById('end-min').value,
        work_from: document.getElementById('date-from').value,
        work_till: document.getElementById('date-to').value,
        min_salary: Number(document.getElementById('salary-min').value),
        max_salary: Number(document.getElementById('salary-max').value),
        open_slots: Number(document.getElementById('open-slots').value),
        job_responsibilities: document.getElementById('job-responsibilities').value,
    };

    // Izsaucam API funkciju
    const res = await api.createAdvertisement(data);
    
    if (res.ok) {
        modal.closeAddForm(); // Aizveram logu
        document.getElementById('add-job-form').reset(); // Notīrām formu
        const updated = await api.fetchAllJobs(); // Atjaunojam sarakstu
        ui.renderJobCards(updated);
    } else {
        console.error("Neizdevās publicēt sludinājumu");
    }
    });
}

// --- Tilti priekš HTML (Bridges) ---
window.openAddForm = modal.openAddForm;
window.closeAddForm = modal.closeAddForm;

window.openLoginModal = modal.openLoginModal;
window.closeLoginModal = modal.closeLoginModal;

window.openRegisterModal = modal.openRegisterModal;
window.closeRegisterModal = modal.closeRegisterModal;

window.handleLogout = async () => {
    await api.logoutUser();
    window.location.reload();
};

window.switchToRegister = () => {
    modal.closeLoginModal();
    setTimeout(modal.openRegisterModal, 300);
};

window.switchToLogin = () => {
    modal.closeRegisterModal();
    setTimeout(modal.openLoginModal, 300);
};