// js/profile.js
import * as ui from '/js/ui.js';
import * as modal from '/js/modals.js';
import * as api from '/js/api.js';

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
let isSubmittingJob = false;
let isSubmittingLogin = false;
let isSubmittingRegister = false;

window.addEventListener('DOMContentLoaded', async () => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const username = pathParts[pathParts.length - 1];

    // Setup UI
    ui.setupCityList(CITIES);

    // Modal setup
    modal.setupTimeInputs();
    modal.setupModalListeners();

    // Get logged in user
    const meRes = await fetch('/api/me');
    const me = await meRes.json();

    updateHeader(me);
    await updateUIBasedOnAuth();

    try {
        const response = await fetch(`/api/user/${username}`);
        const data = await response.json();
        renderProfile(data, me);
    } catch (err) {
        console.error(err);
    }

    setupListeners();
});

function updateHeader(user) {
    const authMenu = document.getElementById('auth-menu');
    const userMenu = document.getElementById('user-menu');
    const addAdBtn = document.getElementById('add_ad');

    if (user.loggedIn) {
        authMenu.style.display = 'none';
        userMenu.style.display = 'flex';

        if (user.iscompany === 1 && addAdBtn) {
            addAdBtn.style.display = 'flex';
        }

        document.getElementById('user-greeting').textContent = user.username;
        document.getElementById('user-type').textContent =
            user.iscompany ? '🏢 Uzņēmums' : '👤 Students';

        document.getElementById('user-avatar').textContent =
            user.username.charAt(0).toUpperCase();
    } else {
        authMenu.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

function setupListeners() {

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

    // ADD / EDIT JOB
    document.getElementById('add-job-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (isSubmittingJob) return;
        isSubmittingJob = true;

        try {
            const form = e.target;
            const editId = form.dataset.editId;

            const data = {
                job_title: document.getElementById('job-title').value,
                city: document.getElementById('job-city').value,
                category: document.getElementById('job-category').value,

                start_work:
                    document.getElementById('start-hour').value +
                    ':' +
                    document.getElementById('start-min').value,

                end_work:
                    document.getElementById('end-hour').value +
                    ':' +
                    document.getElementById('end-min').value,

                work_from: document.getElementById('date-from').value,
                work_till: document.getElementById('date-to').value,

                min_salary: Number(document.getElementById('salary-min').value),
                max_salary: Number(document.getElementById('salary-max').value),

                open_slots: Number(document.getElementById('open-slots').value),

                // RESPONSIBILITIES
                job_responsibilities:
                    document.getElementById('job-responsibilities').value,

                // REQUIREMENTS
                requirements:
                    document.getElementById('job-requirements')?.value
            };

            const url = editId
                ? `/api/jobs/${editId}`
                : '/api/advertisement';

            const method = editId ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (res.ok) {

                closeAddForm();

                form.reset();
                delete form.dataset.editId;

                const title =
                    document.querySelector('#add-modal h2') ||
                    document.getElementById('modal-title');

                if (title) {
                    title.textContent = 'Pievienot jaunu vakanci';
                }

                window.location.reload();

            } else {
                const err = await res.json();
                alert(err.error || 'Neizdevās publicēt vakanci');
            }

        } catch (err) {
            console.error(err);
            alert('Servera kļūda');
        } finally {
            isSubmittingJob = false;
        }
    });
}

function renderProfile(data, me) {
    const { user, jobs } = data;

    document.getElementById('prof-username').textContent = user.username;
    document.getElementById('prof-email').textContent = user.email;

    document.getElementById('prof-phone').textContent =
        user.phone || "Nav norādīts";

    document.getElementById('prof-avatar').textContent =
        user.username.charAt(0).toUpperCase();

    const section = document.getElementById('company-section');

    section.style.display = 'block';

    const title = document.getElementById('section-title');

    if (user.iscompany === 1) {

        title.textContent = "Vakances";

        ui.renderJobCards(jobs, me.userId);

    } else {

        title.textContent = "Izlase";

        fetch(`/api/favorites?userId=${user.id}`)
            .then(r => r.json())
            .then(favs => {
                ui.renderJobCards(
                    favs.map(f => ({
                        ...f,
                        is_favorite: true
                    })),
                    me.userId
                );
            });
    }
}

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
            window.location.href = `/user/${user.username}`;
        };

        document.getElementById('user-avatar').textContent =
            user.username.charAt(0).toUpperCase();

        document.getElementById('user-type').textContent =
            user.iscompany ? '🏢 Uzņēmums' : '👤 Students';
    }
}

// --------------------
// GLOBAL BRIDGES
// --------------------

window.handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
};

// LOGIN MODAL
window.openLoginModal = modal.openLoginModal;
window.closeLoginModal = modal.closeLoginModal;

// REGISTER MODAL
window.openRegisterModal = modal.openRegisterModal;
window.closeRegisterModal = modal.closeRegisterModal;

// ADD JOB MODAL
window.openAddForm = modal.openAddForm;

window.closeAddForm = () => {
    modal.closeAddForm();

    const form = document.getElementById('add-job-form');

    if (form) {
        form.reset();
        delete form.dataset.editId;
    }

    const title =
        document.querySelector('#add-modal h2') ||
        document.getElementById('modal-title');

    if (title) {
        title.textContent = 'Pievienot jaunu vakanci';
    }
};
window.switchToRegister = () => {
    modal.closeLoginModal();
    setTimeout(modal.openRegisterModal, 300);
};

window.switchToLogin = () => {
    modal.closeRegisterModal();
    setTimeout(modal.openLoginModal, 300);
};