import time
import firebase_admin
from firebase_admin import credentials, db
from config import FIREBASE_CREDENTIALS_PATH, FIREBASE_DB_URL, SIMULATION_FREQUENCY, NUM_WORKERS, MACHINE_TYPES
from models import Machine, Worker
import random
import os
import json

def initialize_firebase():
    try:
        # Check if credentials file exists, if not use a dummy one for local testing or error out
        if not os.path.exists(FIREBASE_CREDENTIALS_PATH):
            print(f"Warning: Firebase credentials not found at {FIREBASE_CREDENTIALS_PATH}")
            print("Using mock mode (printing to console instead of Firebase)")
            return None

        cred = credentials.Certificate(FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred, {
            'databaseURL': FIREBASE_DB_URL
        })
        print("Firebase initialized successfully.")
        return db.reference('site')
    except Exception as e:
        print(f"Failed to initialize Firebase: {e}")
        return None

def main():
    site_ref = initialize_firebase()
    
    # Initialize Machines
    machines = []
    for i in range(5):
        # Machines: CONST-001, CONST-002...
        mid = f"CONST-{str(i+1).zfill(3)}"
        mtype = MACHINE_TYPES[i % len(MACHINE_TYPES)]
        machines.append(Machine(mid, mtype))

    # Initialize Workers
    workers = []
    for i in range(NUM_WORKERS):
        # Workers: W1, W2...
        wid = f"W{i+1}"
        # Assign to a random machine
        assigned_machine = random.choice(machines)
        workers.append(Worker(wid, assigned_machine.machine_id))

    print("Starting simulation loop...")
    while True:
        start_time = time.time()
        
        # update machines
        machine_data = {}
        machine_stress_map = {} # Map machine_id -> stress_index
        
        for machine in machines:
            m_state = machine.update()
            machine_data[machine.machine_id] = m_state
            machine_stress_map[machine.machine_id] = machine.stress_index
        
        # update workers
        worker_data = {}
        for worker in workers:
            # get stress of assigned machine
            m_stress = machine_stress_map.get(worker.assigned_machine_id, 0)
            w_state = worker.update(m_stress)
            worker_data[worker.worker_id] = w_state

        # Push to Firebase
        if site_ref:
            try:
                # Use update instead of set to minimize bandwidth if needed, but set is easier for strict schema
                updates = {
                    'machines': machine_data,
                    'workers': worker_data,
                    'last_updated': time.time()
                }
                site_ref.update(updates)
                print(".", end="", flush=True) # Heartbeat
            except Exception as e:
                print(f"Error pushing to Firebase: {e}")
        else:
            # Mock mode: print simplified status
            print(f"\n[MOCK] Time: {time.time()}")
            print(f"Machines: {[f'{m.machine_id}:{m.operating_mode}' for m in machines]}")
            print(f"Workers: {[f'{w.worker_id}:CIS={w.cis_score}' for w in workers]}")

        # Sleep to maintain frequency
        elapsed = time.time() - start_time
        sleep_time = max(0, (1.0 / SIMULATION_FREQUENCY) - elapsed)
        time.sleep(sleep_time)

if __name__ == "__main__":
    main()
