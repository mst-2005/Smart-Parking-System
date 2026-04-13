const fs = require('fs');
const path = require('path');

const csvPath = './backend/ensemble-predict-occupancy/Iot_Smart_Parking_Cleaned_Dataset.csv';
const stats = {};
const hourlyCounts = Array(24).fill(0);
const content = fs.readFileSync(csvPath, 'utf8');
const lines = content.split('\n');
const headers = lines[0].split(',');
const dateIdx = headers.indexOf('Date');
const statusIdx = headers.indexOf('Occupancy_Status');
const timeIdx = headers.indexOf('Entry_Time_Formatted');

console.log('Headers:', headers);
console.log('Indices:', { dateIdx, statusIdx, timeIdx });

for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 2) continue;
    const date = cols[dateIdx];
    const status = cols[statusIdx];
    const timeStr = cols[timeIdx];
    if (!date || !status) continue;
    
    const isOccupied = status.trim() === 'Occupied';
    if (!stats[date]) stats[date] = { occupiedCount: 0 };
    if (isOccupied) {
        stats[date].occupiedCount += 1;
        if (timeStr) {
            const hourMatch = timeStr.match(/(\d+):/);
            const isPM = timeStr.includes('PM');
            let hour = hourMatch ? parseInt(hourMatch[1]) : -1;
            if (hour !== -1) {
                if (isPM && hour !== 12) hour += 12;
                if (!isPM && hour === 12) hour = 0;
                if (hour >= 0 && hour < 24) hourlyCounts[hour] += 1;
            }
        }
    }
}

const entries = Object.entries(stats);
console.log('Total daily entries found:', entries.length);

const sorted = entries.map(([date_str, data]) => ({
    date_str,
    val: data.occupiedCount,
    rawDate: (() => {
        const parts = date_str.split('-');
        if (parts.length !== 3) return null;
        const [d, m, y] = parts.map(Number);
        return new Date(y, m - 1, d);
    })()
})).filter(x => x.rawDate).sort((a, b) => a.rawDate - b.rawDate);

console.log('Sorted count:', sorted.length);

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

console.log('Final window length:', finalWindow.length);
if (finalWindow.length > 0) {
    console.log('Window Start:', finalWindow[0].date_str);
    console.log('Window End:', finalWindow[finalWindow.length-1].date_str);
}

const maxHourly = Math.max(...hourlyCounts) || 1;
const hourlyNormalized = hourlyCounts.map(c => Math.round((c / maxHourly) * 100));
console.log('Hourly exists:', hourlyNormalized.some(x => x > 0));
