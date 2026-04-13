const getBaseUrl = () => {
    // If running tightly on localhost (dev), use localhost.
    // Otherwise use the public IP/Domain of the window.
    return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost' 
        : `http://${window.location.hostname}`;
};

const API_BASE_URL = `${getBaseUrl()}:3001/api`;
const AI_PREDICT_URL = `${getBaseUrl()}:8000/predict-occupancy`;

export const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return await res.json();
};

export const register = async (email, username, password) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password })
    });
    return await res.json();
};

export const fetchZones = async () => {
    const res = await fetch(`${API_BASE_URL}/zones`);
    return await res.json();
};

export const fetchPricing = async () => {
    const res = await fetch(`${API_BASE_URL}/pricing`);
    return await res.json();
};

export const updatePricing = async (vehicleType, newPrice) => {
    const res = await fetch(`${API_BASE_URL}/pricing`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleType, newPrice })
    });
    return await res.json();
};

export const fetchBookings = async (email) => {
    const url = email ? `${API_BASE_URL}/bookings/${email}` : `${API_BASE_URL}/bookings`;
    const res = await fetch(url);
    return await res.json();
};

export const createBooking = async (booking) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking)
    });
    return await res.json();
};

export const updateBookingStatus = async (id, status) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
    });
    return await res.json();
};

export const fetchUsers = async () => {
    const res = await fetch(`${API_BASE_URL}/users`);
    return await res.json();
};

export const fetchOccupancyHistory = async () => {
    const res = await fetch(`${API_BASE_URL}/occupancy-history`);
    return await res.json();
};

export const predictOccupancyEnsemble = async (data) => {
    const res = await fetch(AI_PREDICT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};
export const checkoutBooking = async (id, data) => {
    const res = await fetch(`${API_BASE_URL}/bookings/${id}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};

export const updateCredentials = async (data) => {
    const res = await fetch(`${API_BASE_URL}/users/update-credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return await res.json();
};
