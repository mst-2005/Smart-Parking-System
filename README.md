# ParkSpot+ 🅿️

Intelligent Urban Mobility & Parking Management System

**ParkSpot+** is a premium, full-stack smart city parking application designed to redefine urban commutes. By leveraging predictive AI and frictionless facility management, ParkSpot+ offers real-time spatial logistics, dynamic pricing, and comprehensive administrative oversight.

---

## 🌟 Key Features

### For Users
*   **Predictive AI Selection**: Suggests the optimal parking zone based on vehicle type and current facility occupancy.
*   **Dynamic Spatial Awareness**: Automatically calculates walking distance (in meters) and time to your car from the facility's **Main Entrance**.
*   **Intelligent Booking**: Features a boustrophedon (snake-pattern) slot layout for accurate real-world representation.
*   **Dynamic Checkout**: Automatically adjusts the final parking fee based on whether you leave early (refunded) or late (extra charge) compared to your reserved time.
*   **Premium UI**: A responsive, smooth interface with dark/light mode and various color themes.

### For Administrators
*   **Access the Admin Dashboard easily**: Look for the **🛡️ ADMIN MODE** badge. Uses "admin" in email or username to grant access (e.g., `admin@gmail.com`).
*   **Live Insights & Revenue Tracking**: Monitor realtime active vehicles, total revenue streams, and AI-predicted utilization forecasts for the next day.
*   **Dynamic Pricing Engine**: Adjust billing models (per hour vs. flat rate per visit) and base prices on the fly.
*   **Centralized Logging**: Full visibility into user bookings, checkouts, constraints, and system anomalies.

---

## 🏗️ Architecture

ParkSpot+ is a decoupled application built for modern web environments:

*   **Frontend**: React (Vite) + Vanilla CSS
    *   Stateful routing without heavy external libraries.
    *   Highly optimized UI/UX with custom themes and fluid micro-animations.
*   **Backend**: Node.js + Express
    *   Lightweight REST API interface.
    *   File-based JSON persistence (`db.json`) for zero-configuration deployments.

---

## 🚀 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/en/) (v16.x or higher)
*   [NPM](https://www.npmjs.com/)

### Installation & Launch

To start the entire application (both Frontend and Backend) with a single command:

1.  Clone the repository and navigate into it:
    ```bash
    cd Smart-City-Parking-App
    ```

2.  Run the start script:
    ```bash
    ./run_parkspot.sh
    ```
    *This script automatically installs dependencies for both `frontend` and `backend`, then boots them concurrently. The frontend runs on port `5173` and the backend on `3001`.*

### Testing Admin Mode quickly

To skip straight to the dashboard features:
1. Hit **Sign In / Create Account**.
2. Click the convenient **Use Demo Admin** button at the bottom of the login form, which auto-fills the credentials.
3. Validate you see the `🛡️ ADMIN MODE` badge at the top!

---

## 🚗 Vehicle Filtering & Access Logistics

ParkSpot+ accurately models different zones for specialized contexts:
*   **Zone C (Basement)**: Exclusively restricted to **Electric Vehicles (EVs)**, featuring optimized EV charging infrastructure. Two-wheelers and generic Four-wheelers are automatically filtered out.
*   **Location Awareness**: All slots are algorithmically designated based on their X/Y physical orientation from the facility `Main Entrance`, ensuring accurate proximity-to-exit metrics.
