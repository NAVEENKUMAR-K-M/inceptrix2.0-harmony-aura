import os

# Firebase Configuration
# Path to the service account key JSON file
FIREBASE_CREDENTIALS_PATH = os.environ.get('FIREBASE_CREDENTIALS_PATH', 'serviceAccountKey.json')

# Realtime Database URL
FIREBASE_DB_URL = os.environ.get('FIREBASE_DB_URL', 'https://harmony-aura-default-rtdb.firebaseio.com/')

# Simulation Settings
SIMULATION_FREQUENCY = 1.0  # Hz (1 update per second)
NUM_WORKERS = 10
NUM_MACHINES = 5

# Machine Constants
MACHINE_TYPES = ['Excavator', 'Bulldozer', 'Crane', 'Loader', 'Truck']
