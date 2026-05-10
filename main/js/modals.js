export function openAddForm() {
    document.getElementById("add-modal")?.classList.add('open');
}

export function closeAddForm() {
    document.getElementById("add-modal")?.classList.remove('open');
}

export function openLoginModal() {
    document.getElementById("login-modal")?.classList.add('open');
}

export function closeLoginModal() {
    document.getElementById("login-modal")?.classList.remove('open');
}

export function openRegisterModal() {
    document.getElementById("register-modal")?.classList.add('open');
}

export function closeRegisterModal() {
    document.getElementById("register-modal")?.classList.remove('open');
}

export function setupModalListeners() {
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('open');
        }
    });

    // Close modals on Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.getElementById('add-modal')?.classList.remove('open');
            document.getElementById('login-modal')?.classList.remove('open');
            document.getElementById('register-modal')?.classList.remove('open');
        }
    });
}

export function setupTimeInputs() {
    const timeInputs = document.querySelectorAll('.time-input');
    timeInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.select();
        });

        input.addEventListener('input', function() {
            let value = this.value.replace(/[^\d]/g, '');
            const max = this.id.includes('min') ? 59 : 23;
            if (value.length > 2) value = value.slice(0, 2);
            if (value && parseInt(value) > max) {
                value = max.toString().padStart(2, '0');
            }
            this.value = value;
        });

        input.addEventListener('blur', function() {
            if (this.value.length === 1) {
                this.value = this.value.padStart(2, '0');
            } else if (this.value === '') {
                this.value = '';
            }
        });
    });
}