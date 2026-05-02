export async function fetchAllJobs() {
    const response = await fetch('/api/jobs');
    return await response.json();
}

export async function filterJobs(filterData) {
    const response = await fetch("/api/filter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filterData)
    });
    return await response.json();
}

export async function createAdvertisement(adData) {
    const response = await fetch("/api/advertisement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adData)
    });
    return response;
}