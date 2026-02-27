import time
import random
import threading
import firebase_admin
from firebase_admin import credentials, db
from config import FIREBASE_CREDENTIALS_PATH, FIREBASE_DB_URL

def initialize_firebase():
    try:
        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_DB_URL
        })
        print("Firebase initialized successfully for Synthetic Injector.")
        return db.reference('site/iot/synthetic/device_01')
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")
        return None

class SyntheticInjector:
    def __init__(self, db_ref):
        self.db_ref = db_ref
        self.spo2 = 98.0
        self.noise = 65.0
        self.wind = 12.0
        self.running = True

    def run(self):
        print("Starting Synthetic Data Injection (SpO2, Noise, Wind)...")
        while self.running:
            # Random walk for biological and environmental data
            self.spo2 = max(90.0, min(100.0, self.spo2 + random.uniform(-0.5, 0.5)))
            self.noise = max(50.0, min(110.0, self.noise + random.uniform(-2.0, 2.0)))
            self.wind = max(0.0, min(30.0, self.wind + random.uniform(-1.5, 1.5)))

            payload = {
                "spo2_pct": round(self.spo2, 1),
                "ambient_noise_db": round(self.noise, 1),
                "wind_speed_kmh": round(self.wind, 1),
                "timestamp": int(time.time() * 1000)
            }

            try:
                self.db_ref.set(payload)
                print(f"[SYNTHETIC INJECT] SpO2: {payload['spo2_pct']}% | Noise: {payload['ambient_noise_db']}dB | Wind: {payload['wind_speed_kmh']}km/h")
            except Exception as e:
                print(f"Failed to push synthetic data: {e}")

            time.sleep(2) # Update every 2 seconds

if __name__ == "__main__":
    db_ref = initialize_firebase()
    if db_ref:
        injector = SyntheticInjector(db_ref)
        try:
            injector.run()
        except KeyboardInterrupt:
            print("\nShutting down Synthetic Injector.")
            injector.running = False
