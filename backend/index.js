const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3001;
const dbPath = path.join(__dirname, 'data', 'db.json');

app.use(cors());
app.use(express.json());

// Helper to read DB
const readDb = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading database:", err);
        return { users: [], bookings: [], pricing: {}, zones: [] };
    }
};

// Helper to write DB
const writeDb = (data) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error("Error writing to database:", err);
    }
};

// Auth Routes
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDb();
    const user = db.users.find(u => (u.email === email || u.username === email) && u.password === password);
    if (user) {
        // Enforce role based on identity if it contains "admin"
        const isAdmin = (user.email.toLowerCase().includes('admin') || user.username.toLowerCase().includes('admin'));
        const effectiveRole = isAdmin ? 'admin' : user.role;
        
        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: { ...safeUser, role: effectiveRole } });
    } else {
        res.status(401).json({ success: false, message: "Invalid credentials." });
    }
});

app.post('/api/register', (req, res) => {
    const { email, username, password } = req.body;
    const db = readDb();
    if (db.users.some(u => u.email === email || u.username === username)) {
        return res.status(400).json({ success: false, message: "Email or username already exists." });
    }
    
    // Automatically assign admin role if 'admin' is in email or username
    const isAdmin = (email.toLowerCase().includes('admin') || username.toLowerCase().includes('admin'));
    const role = isAdmin ? 'admin' : 'user';

    const newUser = { email, username, password, role };
    db.users.push(newUser);
    writeDb(db);
    const { password: _, ...safeUser } = newUser;
    res.json({ success: true, user: safeUser });
});

app.get('/api/users', (req, res) => {
    const db = readDb();
    // Remove passwords before sending
    const safeUsers = db.users.map(({ password, ...u }) => u);
    res.json(safeUsers);
});

// Zones Routes
app.get('/api/zones', (req, res) => {
    const db = readDb();
    res.json(db.zones);
});

// Pricing Routes
app.get('/api/pricing', (req, res) => {
    const db = readDb();
    res.json(db.pricing);
});

app.put('/api/pricing', (req, res) => {
    const { vehicleType, newPrice } = req.body;
    const db = readDb();
    if (db.pricing[vehicleType]) {
        db.pricing[vehicleType] = { ...db.pricing[vehicleType], ...newPrice };
        writeDb(db);
        res.json({ success: true, pricing: db.pricing });
    } else {
        res.status(404).json({ success: false, message: "Vehicle type not found." });
    }
});

// Bookings Routes
app.get('/api/bookings', (req, res) => {
    const db = readDb();
    res.json(db.bookings);
});

app.get('/api/bookings/:email', (req, res) => {
    const { email } = req.params;
    const db = readDb();
    const userBookings = db.bookings.filter(b => b.userEmail === email);
    res.json(userBookings);
});

app.post('/api/bookings', (req, res) => {
    const booking = req.body;
    const db = readDb();
    // In a real app, we'd validate the booking (no overlaps etc)
    // For now, let's keep the client-side validation logic but persist here
    db.bookings.unshift(booking);
    writeDb(db);
    res.json({ success: true, booking });
});

app.patch('/api/bookings/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const db = readDb();
    const bookingIndex = db.bookings.findIndex(b => b.bookingId === id);
    if (bookingIndex !== -1) {
        db.bookings[bookingIndex].status = status;
        writeDb(db);
        res.json({ success: true, booking: db.bookings[bookingIndex] });
    } else {
        res.status(404).json({ success: false, message: "Booking not found." });
    }
});

// Advanced logic for Early/Late checkout
app.post('/api/bookings/:id/checkout', (req, res) => {
    const { id } = req.params;
    const { finalCharge, actualExitTime, status } = req.body;
    const db = readDb();
    const idx = db.bookings.findIndex(b => b.bookingId === id);
    if (idx !== -1) {
        db.bookings[idx] = { ...db.bookings[idx], status, finalCharge, actualExitTime };
        writeDb(db);
        res.json({ success: true, booking: db.bookings[idx] });
    } else {
        res.status(404).json({ success: false, message: "Booking not found." });
    }
});

app.post('/api/users/update-credentials', (req, res) => {
    const { oldVal, oldPw, newVal, newPw, type } = req.body; // type: 'email' or 'password'
    const db = readDb();
    const user = db.users.find(u => (u.email === oldVal || u.username === oldVal) && u.password === oldPw);
    
    if (user) {
        if (type === 'password') {
            user.password = newPw;
        } else if (type === 'email') {
            // check for conflicts first
            if (db.users.some(u => u.email === newVal)) {
                return res.status(400).json({ success: false, message: "New email already exists." });
            }
            user.email = newVal;
        } else if (type === 'both') {
            // newVal is user object/creds
            if (db.users.some(u => (newVal.email && u.email === newVal.email) || (newVal.username && u.username === newVal.username))) {
                if (newVal.email !== user.email || newVal.username !== user.username) {
                    // Check for other users with these details
                    const others = db.users.filter(u => u.email !== user.email);
                    if (others.some(u => (newVal.email && u.email === newVal.email) || (newVal.username && u.username === newVal.username))) {
                        return res.status(400).json({ success: false, message: "New email/username already exists." });
                    }
                }
            }
            if (newVal.email) user.email = newVal.email;
            if (newVal.username) user.username = newVal.username;
            if (newVal.password) user.password = newVal.password;
        }
        writeDb(db);
        const { password: _, ...safeUser } = user;
        res.json({ success: true, user: safeUser });
    } else {
        res.status(401).json({ success: false, message: "Old credentials do not match." });
    }
});

// Analytics Route (from Iot_Smart_Parking_Cleaned_Dataset.csv)
// Cache for IoT Analytics
let occupancyCache = null;

const loadOccupancyData = () => {
    const csvPath = path.join(__dirname, 'ensemble-predict-occupancy', 'Iot_Smart_Parking_Cleaned_Dataset.csv');
    if (!fs.existsSync(csvPath)) {
        console.error("Dataset not found at startup.");
        return;
    }

    console.log("📊 Pre-loading IoT Dataset for analytics...");
    const stats = {};
    const hourlyCounts = Array(24).fill(0);
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split(/\r?\n/);
    
    let headerLine = lines[0];
    if (headerLine.startsWith('\ufeff')) headerLine = headerLine.slice(1);
    const headers = headerLine.split(',').map(h => h.trim());
    
    const safeGetIdx = (name) => {
        const idx = headers.indexOf(name);
        if (idx !== -1) return idx;
        return headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
    };

    const dIdx = safeGetIdx('Date');
    const sIdx = safeGetIdx('Occupancy_Status');
    const tIdx = safeGetIdx('Entry_Time_Formatted');

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        if (cols.length < 2) continue;
        const date = cols[dIdx]?.trim();
        const status = cols[sIdx]?.trim();
        const timeStr = cols[tIdx]?.trim();
        if (!date || !status) continue;
        
        const isOccupied = status.toLowerCase() === 'occupied';
        if (!stats[date]) stats[date] = { occupiedCount: 0 };
        if (isOccupied) {
            stats[date].occupiedCount += 1;
            if (timeStr) {
                const hourMatch = timeStr.match(/(\d+):/);
                const isPM = timeStr.toLowerCase().includes('pm');
                let hour = hourMatch ? parseInt(hourMatch[1]) : -1;
                if (hour !== -1) {
                    if (isPM && hour !== 12) hour += 12;
                    if (!isPM && hour === 12) hour = 0;
                    if (hour >= 0 && hour < 24) hourlyCounts[hour] += 1;
                }
            }
        }
    }

    const sorted = Object.entries(stats).map(([date_str, data]) => ({
        date_str,
        val: data.occupiedCount,
        rawDate: (() => {
            const parts = date_str.split('-');
            if (parts.length < 3) return null;
            const [d, m, y] = parts.map(Number);
            return new Date(y, m - 1, d);
        })()
    })).filter(x => x.rawDate && !isNaN(x.rawDate)).sort((a, b) => a.rawDate - b.rawDate);

    let finalWindow = [];
    if (sorted.length >= 30) {
        for (let i = sorted.length - 1; i >= 29; i--) {
            const window = sorted.slice(i - 29, i + 1);
            let consecutive = true;
            for (let j = 0; j < window.length - 1; j++) {
                const diff = (window[j + 1].rawDate - window[j].rawDate) / (1000 * 60 * 60 * 24);
                if (Math.round(diff) !== 1) {
                    consecutive = false;
                    break;
                }
            }
            if (consecutive) {
                finalWindow = window;
                break;
            }
        }
    }
    if (finalWindow.length === 0) finalWindow = sorted.slice(-30);

    const maxHourly = Math.max(...hourlyCounts) || 1;
    const hourlyNormalized = hourlyCounts.map(c => Math.round((c / maxHourly) * 100));

    occupancyCache = {
        daily: finalWindow.map(({ date_str, val }) => ({ date_str, val })),
        hourly: hourlyNormalized
    };
    console.log("✅ Analytics cache ready.");
};

// Initial load
loadOccupancyData();

app.get('/api/occupancy-history', (req, res) => {
    if (!occupancyCache) {
        return res.status(503).json({ success: false, message: "Data is still loading." });
    }
    res.json(occupancyCache);
});

app.listen(port, () => {
    console.log(`Smart Parking Backend listening at http://localhost:${port}`);
});
