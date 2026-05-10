export async function checkAuth() {
    const res = await fetch('/api/me');
    return await res.json();
}

export async function fetchAllJobs() {
    const res = await fetch('/api/jobs');
    return await res.json();
}

export async function loginUser(email, password) {
    return await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
}

export async function registerUser(userData) {
    return await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
}

export async function logoutUser() {
    return await fetch('/api/logout', { method: 'POST' });
}

export async function filterJobs(filterData) {
    const res = await fetch("/api/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filterData)
    });
    return await res.json();
}
export async function createAdvertisement(adData) {
    try {
        const response = await fetch("/api/advertisement", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(adData)
        });
        return response;
    } catch (error) {
        console.error('Kļūda izveidojot sludinājumu (API):', error);
        throw error;
    }
}