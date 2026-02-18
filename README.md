# Harmony Aura: Supervisor Dashboard v2.0

Harmony Aura is a premium, high-performance industrial monitoring platform designed for real-time tracking of workforce biometrics and machine telemetry. Built with a focus on safety, visibility, and high-end industrial aesthetics.

## 🚀 Key Features

-   **Real-Time Biometrics**: Track Heart Rate, Fatigue levels, and CIS (Cognitive Interference Score) in real-time.
-   **Machine Telemetry**: Monitor machine load, status (IDLE/ACTIVE), and proximity to hazardous zones.
-   **Humanized Identifiers**: Technical IDs are automatically mapped to human names and descriptive machine assets for better situational awareness.
-   **Smart Alerts**: Instant visual feedback for critical biometrics or machine status changes.
-   **Industrial Premium UI**: Dark industrial theme with glassmorphism, micro-animations (GSAP), and responsive layouts.
-   **Single-View Overwatch**: High-density dashboard for monitoring entire sites at a glance.

## 🛠 Tech Stack

### Frontend
-   **React + Vite**: High-performance development and build environment.
-   **Tailwind CSS v4**: Modern utility-first styling for a premium look.
-   **GSAP (GreenSock)**: Smooth, professional micro-animations.
-   **Lucide React**: Beautiful, consistent iconography.
-   **Firebase SDK**: Real-time data synchronization.

### Backend
-   **Python**: Core simulation and data processing engine.
-   **Firebase Admin SDK**: Secure communication with the Realtime Database.
-   **Simulation engine**: Generates realistic biometric and telemetry patterns for testing and demos.

## 📦 Installation & Setup

### 1. Prerequisites
-   Node.js (v18+)
-   Python (3.9+)
-   Firebase Account (Realtime Database + Service Account Key)

### 2. Backend Setup
1.  Navigate to `/backend`.
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Place your `serviceAccountKey.json` in the `/backend` directory.
4.  Run the simulation:
    ```bash
    python simulation.py
    ```

### 3. Frontend Setup
1.  Navigate to `/frontend`.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file based on `.env.example` with your Firebase credentials.
4.  Run the development server:
    ```bash
    npm run dev
    ```

## 🏗 Project Structure

-   `/frontend`: React application, UI components, and styles.
-   `/backend`: Python simulation scripts and models.
-   `/frontend/src/utils/mappings.js`: Logic for mapping technical IDs to human names.
-   `/frontend/src/components/SupervisorIcon.jsx`: Custom high-quality SVG iconography.

## 🎨 Design Philosophy

High-end, "Industrial Premium" aesthetic. We use:
-   Deep dark backgrounds with cyan and emerald accents.
-   GSAP for data-flicker and smooth loading transitions.
-   Custom-crafted SVG icons for supervisor identity.

---
*Built with Harmony. Stay Safe.*
