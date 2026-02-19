"""
Predictive Maintenance — Real-time Inference Engine
=====================================================
Loads the trained 1D CNN model and provides real-time health predictions
for each machine using a sliding window of recent telemetry data.

This module is imported by simulation.py to push predictions to Firebase.
"""

import os
import numpy as np

# Suppress TF verbose logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_model")
LABEL_NAMES = {0: "Healthy", 1: "Caution", 2: "Serious", 3: "Critical"}
WINDOW_SIZE = 60  # Must match training seq_len


class PredictiveMaintenanceEngine:
    """Real-time inference engine for machine health prediction."""

    def __init__(self):
        self.model = None
        self.scaler_mean = None
        self.scaler_scale = None
        self.buffers = {}  # machine_id → list of recent readings
        self._loaded = False

    def load(self):
        """Load the trained model and scaler parameters."""
        model_path = os.path.join(MODEL_DIR, "pdm_model.keras")
        mean_path = os.path.join(MODEL_DIR, "scaler_mean.npy")
        scale_path = os.path.join(MODEL_DIR, "scaler_scale.npy")

        if not os.path.exists(model_path):
            print("[PdM] ⚠️  No trained model found. Run model.py first.")
            return False

        try:
            self.model = tf.keras.models.load_model(model_path)
            self.scaler_mean = np.load(mean_path)
            self.scaler_scale = np.load(scale_path)
            self._loaded = True
            print("[PdM] ✅ Model loaded successfully.")
            return True
        except Exception as e:
            print(f"[PdM] ❌ Failed to load model: {e}")
            return False

    def push_reading(self, machine_id, rpm, load, temp, vibration, oil_pressure, ambient_temp=30.0):
        """Add a new sensor reading to the machine's buffer."""
        if machine_id not in self.buffers:
            self.buffers[machine_id] = []

        self.buffers[machine_id].append([rpm, load, temp, vibration, oil_pressure, ambient_temp])

        # Keep only the last WINDOW_SIZE readings
        if len(self.buffers[machine_id]) > WINDOW_SIZE:
            self.buffers[machine_id] = self.buffers[machine_id][-WINDOW_SIZE:]

    def predict(self, machine_id):
        """Run inference on the current buffer for a machine.
        Returns: (health_label, confidence, probabilities) or None if buffer not full.
        """
        if not self._loaded or machine_id not in self.buffers:
            return None

        buffer = self.buffers[machine_id]
        if len(buffer) < WINDOW_SIZE:
            return None  # Not enough data yet

        # Prepare input
        X = np.array(buffer[-WINDOW_SIZE:], dtype=np.float32)

        # Normalize using saved scaler params
        X = (X - self.scaler_mean) / self.scaler_scale

        # Reshape for model: (1, seq_len, n_features)
        X = X.reshape(1, WINDOW_SIZE, -1)

        # Predict
        probs = self.model.predict(X, verbose=0)[0]
        predicted_class = int(np.argmax(probs))
        confidence = float(probs[predicted_class])

        return {
            "health_label": LABEL_NAMES[predicted_class],
            "health_score": round(1.0 - (predicted_class / 3.0), 2),  # 1.0=healthy, 0.0=critical
            "confidence": round(confidence, 3),
            "probabilities": {
                LABEL_NAMES[i]: round(float(probs[i]), 3)
                for i in range(len(probs))
            },
        }

    @property
    def is_loaded(self):
        return self._loaded
