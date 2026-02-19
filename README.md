# Harmony Aura: Supervisor Dashboard v2.0

Harmony Aura is a premium, high-performance industrial monitoring platform designed for real-time tracking of workforce biometrics and machine telemetry. Built with a focus on safety, visibility, and high-end industrial aesthetics.

## 🚀 Key Features

-   **Production-Grade Simulation**: Highly individualized heart rate and fatigue profiles using bio-unique RNG seeds; no two workers are identical.
-   **Machine Physics Engine**: Equipment-specific thermal, load, and vibration characteristics for Excavators, Bulldozers, Cranes, Loaders, and Trucks.
-   **Stochastic Sensor Jitter**: Integrated Ornstein-Uhlenbeck noise models to mimic real-world IoT telemetry fluctuations.
-   **Tiered Risk Escalation**: Precise control over tiered worker targeting with non-identical escalation paths and a gradual ramp-up.
-   **Live History Panel**: Dashboard-integrated notification log for monitoring and auditing critical risk events in real-time.
-   **Advanced CIS Monitoring**: Real-time Cognitive Interference Score calculation with high-precision calibrated thresholds.
-   **Industrial Premium UI**: GSAP-powered micro-animations, glassmorphic design, and a high-density "Overwatch" layout.

## 🛠 Tech Stack

### Frontend
-   **React + Vite**: High-performance development and build environment.
-   **Tailwind CSS v4**: Modern utility-first styling for a premium look.
-   **GSAP (GreenSock)**: Professional micro-animations and data-flicker effects.
-   **Lucide React**: Beautiful, consistent industrial iconography.
-   **Firebase SDK**: Real-time data synchronization.

### Backend
-   **Python**: Core simulation and physiological modeling engine.
-   **Firebase Admin SDK**: Secure communication with the Realtime Database.
-   **Advanced Models**: Ornstein-Uhlenbeck noise processes and bio-unique profile generation.

## 📦 Installation & Setup

### 1. Prerequisites
-   Node.js (v18+)
-   Python (3.9+)
-   Firebase Account (Realtime Database + Service Account Key)

### 2. Backend Setup
1.  Navigate to `/backend`.
2.  Install dependencies: `pip install -r requirements.txt`.
3.  Place your `serviceAccountKey.json` in the `/backend` directory.
4.  Run the simulation: `python simulation.py`.

### 3. Frontend Setup
1.  Navigate to `/frontend`.
2.  Install dependencies: `npm install`.
3.  Create a `.env` file based on `.env.example` with your Firebase credentials.
4.  Run the development server: `npm run dev`.

## 🏗 Project Structure

-   `/frontend`: React application, UI components, and styles.
-   `/backend`: Python simulation scripts and models.
-   `/backend/models.py`: High-fidelity physiological and physical simulation models.
-   `/frontend/src/utils/cisCalculator.js`: Logic for production-grade risk assessment.

---
*Built with Harmony. Stay Safe.*
