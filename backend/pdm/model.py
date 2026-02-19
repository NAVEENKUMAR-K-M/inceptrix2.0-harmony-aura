"""
Predictive Maintenance — 1D CNN Model
=======================================
A 1D Convolutional Neural Network for classifying machine health states
from time-series telemetry data (RPM, Load, Temperature, Vibration, Oil Pressure).

Architecture:
  Input (seq_len, 5 features)
  → Conv1D(64, kernel=5) + BatchNorm + ReLU
  → Conv1D(128, kernel=3) + BatchNorm + ReLU
  → MaxPooling1D(2)
  → Conv1D(64, kernel=3) + BatchNorm + ReLU
  → GlobalAveragePooling1D
  → Dense(64, ReLU) + Dropout(0.3)
  → Dense(4, Softmax) → [Healthy, Caution, Serious, Critical]

Usage:
  python backend/pdm/model.py
"""

import os
import sys
import numpy as np

# Suppress TF verbose logging
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

import tensorflow as tf
from tensorflow.keras import layers, models, callbacks
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix

LABEL_NAMES = ["Healthy", "Caution", "Serious", "Critical"]
_SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(_SCRIPT_DIR, "datasets")
MODEL_DIR = os.path.join(_SCRIPT_DIR, "saved_model")


def load_data():
    """Load the generated NumPy arrays."""
    X = np.load(os.path.join(DATA_DIR, "X.npy"))
    y = np.load(os.path.join(DATA_DIR, "y.npy"))
    print(f"Loaded data: X={X.shape}, y={y.shape}")
    print(f"Class distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
    return X, y


def normalize_data(X_train, X_test):
    """Per-feature standardization across the time dimension."""
    n_samples_train, seq_len, n_features = X_train.shape
    n_samples_test = X_test.shape[0]

    # Reshape to 2D for scaler
    X_train_2d = X_train.reshape(-1, n_features)
    X_test_2d = X_test.reshape(-1, n_features)

    scaler = StandardScaler()
    X_train_2d = scaler.fit_transform(X_train_2d)
    X_test_2d = scaler.transform(X_test_2d)

    # Reshape back
    X_train = X_train_2d.reshape(n_samples_train, seq_len, n_features)
    X_test = X_test_2d.reshape(n_samples_test, seq_len, n_features)

    # Save scaler params for inference
    os.makedirs(MODEL_DIR, exist_ok=True)
    np.save(os.path.join(MODEL_DIR, "scaler_mean.npy"), scaler.mean_)
    np.save(os.path.join(MODEL_DIR, "scaler_scale.npy"), scaler.scale_)

    return X_train, X_test


def build_model(input_shape, num_classes=4):
    """Build the 1D CNN architecture."""
    model = models.Sequential([
        # Block 1: Feature extraction
        layers.Conv1D(64, kernel_size=5, padding='same', input_shape=input_shape),
        layers.BatchNormalization(),
        layers.ReLU(),

        # Block 2: Deeper features
        layers.Conv1D(128, kernel_size=3, padding='same'),
        layers.BatchNormalization(),
        layers.ReLU(),
        layers.MaxPooling1D(pool_size=2),

        # Block 3: High-level patterns
        layers.Conv1D(64, kernel_size=3, padding='same'),
        layers.BatchNormalization(),
        layers.ReLU(),

        # Global pooling → classification
        layers.GlobalAveragePooling1D(),
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(num_classes, activation='softmax'),
    ])

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy'],
    )

    return model


def train():
    """Full training pipeline."""
    print("=" * 60)
    print("  HarmonyAura — 1D CNN Predictive Maintenance Training")
    print("=" * 60)

    # Load data
    X, y = load_data()

    # Train/test split (stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain: {X_train.shape[0]} samples, Test: {X_test.shape[0]} samples")

    # Normalize
    X_train, X_test = normalize_data(X_train, X_test)

    # Build model
    input_shape = (X_train.shape[1], X_train.shape[2])  # (seq_len, n_features)
    model = build_model(input_shape)
    model.summary()

    # Callbacks
    os.makedirs(MODEL_DIR, exist_ok=True)
    cb = [
        callbacks.EarlyStopping(patience=10, restore_best_weights=True, verbose=1),
        callbacks.ReduceLROnPlateau(factor=0.5, patience=5, verbose=1),
        callbacks.ModelCheckpoint(
            os.path.join(MODEL_DIR, "best_model.keras"),
            save_best_only=True, verbose=1
        ),
    ]

    # Train
    print("\n🏋️ Training...")
    history = model.fit(
        X_train, y_train,
        validation_split=0.15,
        epochs=80,
        batch_size=32,
        callbacks=cb,
        verbose=1,
    )

    # Evaluate
    print("\n📊 Evaluation on Test Set:")
    test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"  Test Accuracy: {test_acc:.4f}")
    print(f"  Test Loss:     {test_loss:.4f}")

    # Classification report
    y_pred = model.predict(X_test, verbose=0).argmax(axis=1)
    print(f"\n{classification_report(y_test, y_pred, target_names=LABEL_NAMES)}")

    # Confusion matrix
    cm = confusion_matrix(y_test, y_pred)
    print("Confusion Matrix:")
    print(cm)

    # Save final model
    model.save(os.path.join(MODEL_DIR, "pdm_model.keras"))
    print(f"\n✅ Model saved to {MODEL_DIR}/pdm_model.keras")

    return model, history


if __name__ == "__main__":
    train()
