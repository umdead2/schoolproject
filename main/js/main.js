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
    "Valka", "Valmiera", "Vangaži", "Varakļāni", "Ventspils", "Viesīte", "Viļaka",
    "Viļāni", "Zilupe"
];

// Prevent double submits
let isSubmittingLogin = false;
let isSubmittingRegister = false;

// --------------------
// INIT
// --------------------

window.addEventListener('DOMContentLoaded', async () => {

    ui.setupCityList(CITIES);

    modal.setupTimeInputs();
    modal.setupModalListeners();

    // Load jobs
    try {
        const initialJobs = await api.fetchAllJobs();
        ui.renderJobCards(initialJobs);
    } catch (e) {
        console.error("Kļūda ielādējot vakances:", e);
    }

    // Auth UI
    await updateUIBasedOnAuth();

    // Forms
    setupFormListeners();
});

// --------------------
// AUTH UI
// --------------------

async function updateUIBasedOnAuth() {

    const res = await fetch('/api/me');
    const user = await res.json();

    const authMenu = document.getElementById('auth-menu');
    const userMenu = document.getElementById('user-menu');
    const greeting = document.getElementById('user-greeting');

    if (user.loggedIn) {

        authMenu.style.display = 'none';
        userMenu.style.display = 'flex';

        greeting.textContent = user.username;

        greeting.style.cursor = 'pointer';

        greeting.onclick = () => {
            window.location.href = `http://localhost:3000/user/${user.username}`;
        };

        document.getElementById('user-avatar').textContent =
            user.username.charAt(0).toUpperCase();

        document.getElementById('user-type').textContent =
            user.iscompany ? '🏢 Uzņēmums' : '👤 Students';
    }
}

// --------------------
// FORMS
// --------------------

function setupFormListeners() {

    // LOGIN
    document.getElementById('login-form')?.addEventListener('submit', async (e) => {

        e.preventDefault();

        if (isSubmittingLogin) return;

        isSubmittingLogin = true;

        try {

            const email =
                document.getElementById('login-email').value;

            const password =
                document.getElementById('login-password').value;

            const res = await api.loginUser(email, password);

            if (res.ok) {

                modal.closeLoginModal();
                window.location.reload();

            } else {

                const err = await res.json();

                console.error("Login Error:", err.error);

                alert(err.error || 'Nepareizs e-pasts vai parole');
            }

        } finally {
            isSubmittingLogin = false;
        }
    });

    // REGISTER
    document.getElementById('register-form')?.addEventListener('submit', async (e) => {

        e.preventDefault();

        if (isSubmittingRegister) return;

        isSubmittingRegister = true;

        try {

            const data = {
                username: document.getElementById('reg-username').value,
                email: document.getElementById('reg-email').value,
                phone: document.getElementById('reg-phone').value,
                password: document.getElementById('reg-password').value,
                iscompany: Number(
                    document.querySelector('input[name="reg-iscompany"]:checked').value
                )
            };

            const registerRes = await api.registerUser(data);

            if (registerRes.ok) {

                const loginRes = await api.loginUser(
                    data.email,
                    data.password
                );

                if (loginRes.ok) {

                    modal.closeRegisterModal();
                    window.location.reload();

                } else {

                    alert(
                        "Konts izveidots, bet automātiskā pierakstīšanās neizdevās."
                    );

                    modal.closeRegisterModal();
                    window.location.reload();
                }

            } else {

                const err = await registerRes.json();

                console.error("Registration Error:", err.error);

                alert("Reģistrācija neizdevās: " + err.error);
            }

        } finally {
            isSubmittingRegister = false;
        }
    });

    // FILTER
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
}

// --------------------
// GLOBAL BRIDGES
// --------------------

// ADD FORM
window.openAddForm = modal.openAddForm;
window.closeAddForm = modal.closeAddForm;

// LOGIN
window.openLoginModal = modal.openLoginModal;
window.closeLoginModal = modal.closeLoginModal;

// REGISTER
window.openRegisterModal = modal.openRegisterModal;
window.closeRegisterModal = modal.closeRegisterModal;

// LOGOUT
window.handleLogout = async () => {
    await api.logoutUser();
    window.location.reload();
};

// SWITCH MODALS
window.switchToRegister = () => {
    modal.closeLoginModal();
    setTimeout(modal.openRegisterModal, 300);
};

window.switchToLogin = () => {
    modal.closeRegisterModal();
    setTimeout(modal.openLoginModal, 300);
};