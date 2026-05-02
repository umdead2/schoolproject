export function openAddForm() {
    const modal = document.getElementById("add-modal");
    if (modal) {
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        if(dateFrom) dateFrom.max = "3000-12-31";
        if(dateTo) dateTo.max = "3000-12-31";
        modal.classList.add('open');
    }
}

export function closeAddForm() {
    const modal = document.getElementById("add-modal");
    if (modal) {
        modal.classList.remove('open');
    }
}

export function setupModalListeners() {
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('add-modal');
        if (event.target === modal) {
            closeAddForm();
        }
    });
}

export function setupTimeInputs() {
    const timeInputs = document.querySelectorAll('.time-input');
    timeInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.value = '';
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
            }
        });
    });
}