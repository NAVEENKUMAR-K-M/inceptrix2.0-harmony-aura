"""
Predictive Maintenance — Synthetic Data Generator
===================================================
Generates realistic time-series telemetry data for construction machinery.
Each sample is a sequence of sensor readings over time, simulating:
  - Normal operation (healthy baseline with noise)
  - Gradual degradation paths (bearing wear, coolant leak, overload fatigue)
  - Sudden fault onset (sensor spikes, mode transitions)

Labels correspond to machine health states:
  0 = Healthy       (Normal operation, no intervention needed)
  1 = Caution       (Early-stage wear, schedule inspection)
  2 = Serious       (Significant degradation, plan maintenance)
  3 = Critical      (Imminent failure, immediate action required)

Output: CSV files per machine type + a combined dataset for model training.
"""

import os
import csv
import random
import math
import numpy as np

# ─────────────────────────────────────────────
# Machine-Type Physical Profiles (matching backend)
# ─────────────────────────────────────────────
MACHINE_PROFILES = {
    "Excavator": {
        "idle_rpm": 750, "work_rpm": 1800, "peak_rpm": 2600,
        "idle_load": 8, "work_load": 55, "peak_load": 95,
        "idle_temp": 30, "work_temp": 52, "peak_temp": 95,
        "vibration_base": 2.5, "oil_pressure_base": 22,
    },
    "Bulldozer": {
        "idle_rpm": 700, "work_rpm": 1600, "peak_rpm": 2200,
        "idle_load": 12, "work_load": 60, "peak_load": 98,
        "idle_temp": 32, "work_temp": 58, "peak_temp": 105,
        "vibration_base": 3.8, "oil_pressure_base": 24,
    },
    "Crane": {
        "idle_rpm": 650, "work_rpm": 1400, "peak_rpm": 2000,
        "idle_load": 5, "work_load": 45, "peak_load": 88,
        "idle_temp": 26, "work_temp": 42, "peak_temp": 78,
        "vibration_base": 1.2, "oil_pressure_base": 20,
    },
    "Loader": {
        "idle_rpm": 780, "work_rpm": 1900, "peak_rpm": 2500,
        "idle_load": 10, "work_load": 50, "peak_load": 92,
        "idle_temp": 29, "work_temp": 48, "peak_temp": 88,
        "vibration_base": 2.8, "oil_pressure_base": 21,
    },
    "Truck": {
        "idle_rpm": 680, "work_rpm": 1700, "peak_rpm": 2400,
        "idle_load": 6, "work_load": 42, "peak_load": 85,
        "idle_temp": 27, "work_temp": 44, "peak_temp": 82,
        "vibration_base": 2.0, "oil_pressure_base": 19,
    },
}

# ─────────────────────────────────────────────
# Degradation Modes (Failure Paths)
# ─────────────────────────────────────────────
DEGRADATION_MODES = [
    "bearing_wear",       # Gradual vibration increase + RPM instability
    "coolant_leak",       # Exponential temperature rise
    "overload_fatigue",   # Sustained high load → cascading stress
    "oil_degradation",    # Oil pressure drops over time
    "electrical_fault",   # Sudden RPM spikes and dips
]


def ou_noise(prev, mean_reversion=0.3, volatility=1.0):
    """Ornstein-Uhlenbeck mean-reverting noise step."""
    return prev * (1 - mean_reversion) + random.gauss(0, volatility)


def generate_healthy_sequence(profile, seq_len=60):
    """Generate a healthy operating sequence (label=0).
    Simulates normal workday: idle / working / peak cycles with natural jitter.
    Machines spend significant time in all operating modes during healthy operation.
    """
    readings = []
    # Start in a random mode to cover all healthy operating ranges
    mode = random.choice(["IDLE", "WORKING", "WORKING", "PEAK"])
    rpm, load, temp = profile["idle_rpm"], profile["idle_load"], profile["idle_temp"]
    vib = profile["vibration_base"]
    oil = profile["oil_pressure_base"]
    rpm_noise, load_noise, temp_noise = 0, 0, 0
    # Environmental: normal ambient temp range (25-38°C)
    ambient_base = random.uniform(25.0, 35.0)
    ambient_noise = 0

    for t in range(seq_len):
        # Mode transitions: 10% chance per tick for realistic variation
        if random.random() < 0.10:
            mode = random.choice(["IDLE", "WORKING", "WORKING", "PEAK"])

        if mode == "IDLE":
            target_rpm = profile["idle_rpm"] + random.uniform(-20, 20)
            target_load = profile["idle_load"] + random.uniform(-2, 2)
            target_temp = profile["idle_temp"] + random.uniform(-1, 1)
        elif mode == "WORKING":
            target_rpm = profile["work_rpm"] + random.uniform(-40, 40)
            target_load = profile["work_load"] + random.uniform(-5, 5)
            target_temp = profile["work_temp"] + random.uniform(-2, 2)
        else:  # PEAK — short bursts of hard work, still healthy
            target_rpm = profile["peak_rpm"] * 0.85 + random.uniform(-50, 50)
            target_load = profile["peak_load"] * 0.85 + random.uniform(-5, 5)
            target_temp = profile["peak_temp"] * 0.80 + random.uniform(-3, 3)

        # Smooth transitions
        rpm += (target_rpm - rpm) * 0.08
        load += (target_load - load) * 0.06
        temp += (target_temp - temp) * 0.03

        # OU noise
        rpm_noise = ou_noise(rpm_noise, 0.3, 8.0)
        load_noise = ou_noise(load_noise, 0.4, 0.8)
        temp_noise = ou_noise(temp_noise, 0.2, 0.3)

        rpm_val = max(400, rpm + rpm_noise)
        load_val = max(0, min(100, load + load_noise))
        temp_val = max(15, temp + temp_noise)
        vib_val = profile["vibration_base"] + (load_val / 100) * 4.0 + random.uniform(-0.2, 0.2)
        oil_val = max(0, (rpm_val / 2500) * 55 + random.uniform(-0.5, 0.5))

        # Ambient temperature: gentle fluctuation around base
        ambient_noise = ou_noise(ambient_noise, 0.15, 0.3)
        ambient_val = max(18, min(45, ambient_base + ambient_noise))

        readings.append([
            round(rpm_val, 1),
            round(load_val, 1),
            round(temp_val, 1),
            round(vib_val, 2),
            round(oil_val, 1),
            round(ambient_val, 1),
        ])

    return readings


def generate_degradation_sequence(profile, mode, seq_len=60, max_progress=1.0):
    """Generate a degradation path sequence.
    max_progress controls how far into degradation (0.0–1.0) the sequence goes.
    Returns (readings, labels) where labels progress from 0→1→2→3.
    """
    readings = []
    labels = []
    rpm, load, temp = profile["work_rpm"], profile["work_load"], profile["work_temp"]
    vib = profile["vibration_base"]
    oil = profile["oil_pressure_base"]
    rpm_noise, load_noise, temp_noise = 0, 0, 0
    # Environmental: degradation often correlates with higher ambient temps
    ambient_base = random.uniform(30.0, 40.0)
    ambient_noise = 0

    for t in range(seq_len):
        progress = (t / seq_len) * max_progress  # Scale by max_progress

        # Determine health label based on progress
        if progress < 0.3:
            label = 0  # Healthy
        elif progress < 0.55:
            label = 1  # Caution
        elif progress < 0.8:
            label = 2  # Serious
        else:
            label = 3  # Critical

        # Apply degradation effects based on mode
        deg_factor = progress ** 1.5  # Accelerating degradation curve

        if mode == "bearing_wear":
            vib_boost = deg_factor * 12.0
            rpm_instability = deg_factor * random.uniform(-80, 80)
            temp_boost = deg_factor * 8.0
            load_boost = deg_factor * 5.0
            oil_drop = 0

        elif mode == "coolant_leak":
            vib_boost = deg_factor * 2.0
            rpm_instability = deg_factor * random.uniform(-20, 20)
            temp_boost = deg_factor * 40.0  # Exponential temp rise
            load_boost = deg_factor * 10.0
            oil_drop = deg_factor * 5.0

        elif mode == "overload_fatigue":
            vib_boost = deg_factor * 6.0
            rpm_instability = deg_factor * random.uniform(-30, 50)
            temp_boost = deg_factor * 20.0
            load_boost = deg_factor * 30.0  # Sustained high load
            oil_drop = deg_factor * 3.0

        elif mode == "oil_degradation":
            vib_boost = deg_factor * 4.0
            rpm_instability = deg_factor * random.uniform(-40, 40)
            temp_boost = deg_factor * 15.0
            load_boost = deg_factor * 8.0
            oil_drop = deg_factor * 20.0  # Significant oil pressure drop

        elif mode == "electrical_fault":
            vib_boost = deg_factor * 3.0
            # Sudden spikes after 50% progress
            if progress > 0.5 and random.random() < 0.3:
                rpm_instability = random.choice([-1, 1]) * random.uniform(200, 500)
            else:
                rpm_instability = deg_factor * random.uniform(-50, 50)
            temp_boost = deg_factor * 10.0
            load_boost = deg_factor * 12.0
            oil_drop = deg_factor * 2.0
        else:
            vib_boost = rpm_instability = temp_boost = load_boost = oil_drop = 0

        # OU noise
        rpm_noise = ou_noise(rpm_noise, 0.3, 10.0 + deg_factor * 15.0)
        load_noise = ou_noise(load_noise, 0.4, 1.0 + deg_factor * 3.0)
        temp_noise = ou_noise(temp_noise, 0.2, 0.5 + deg_factor * 2.0)

        rpm_val = max(400, rpm + rpm_instability + rpm_noise)
        load_val = max(0, min(100, load + load_boost + load_noise))
        temp_val = max(15, temp + temp_boost + temp_noise)
        vib_val = max(0, vib + (load_val / 100) * 4.0 + vib_boost + random.uniform(-0.2, 0.2))
        oil_val = max(0, (rpm_val / 2500) * 55 - oil_drop + random.uniform(-1.5, 1.5))

        # Ambient temp: rises with degradation (heatwave correlation)
        ambient_noise = ou_noise(ambient_noise, 0.15, 0.4)
        ambient_val = max(18, min(52, ambient_base + deg_factor * 8.0 + ambient_noise))

        readings.append([
            round(rpm_val, 1),
            round(load_val, 1),
            round(temp_val, 1),
            round(vib_val, 2),
            round(oil_val, 1),
            round(ambient_val, 1),
        ])
        labels.append(label)

    return readings, labels


def generate_dataset(
    samples_per_class_per_type=500,
    seq_len=60,
    output_dir="backend/pdm/datasets"
):
    """Generate the full synthetic dataset for all machine types."""
    os.makedirs(output_dir, exist_ok=True)

    all_sequences = []  # Each: (machine_type, sequence_data, label)
    feature_names = ["rpm", "load", "temp", "vibration", "oil_pressure", "ambient_temp"]

    for machine_type, profile in MACHINE_PROFILES.items():
        print(f"\n{'='*50}")
        print(f"Generating data for: {machine_type}")
        print(f"{'='*50}")

        type_sequences = []

        # ── Healthy samples ──
        print(f"  → {samples_per_class_per_type} healthy sequences...")
        for _ in range(samples_per_class_per_type):
            seq = generate_healthy_sequence(profile, seq_len)
            type_sequences.append((seq, 0))
            all_sequences.append((machine_type, seq, 0))

        # ── Degradation samples: balanced across labels 1, 2, 3 ──
        per_mode_per_label = samples_per_class_per_type // len(DEGRADATION_MODES)
        for mode in DEGRADATION_MODES:
            for target_label in [1, 2, 3]:  # Caution, Serious, Critical
                print(f"  → {per_mode_per_label} {DEGRADATION_MODES[0] if mode == DEGRADATION_MODES[0] else mode} → label {target_label}...")
                for _ in range(per_mode_per_label):
                    # Generate a partial sequence that ends at the target label
                    # by controlling how far into degradation we go
                    if target_label == 1:
                        max_progress = random.uniform(0.35, 0.50)  # Stop in Caution zone
                    elif target_label == 2:
                        max_progress = random.uniform(0.60, 0.75)  # Stop in Serious zone
                    else:
                        max_progress = random.uniform(0.85, 1.0)   # Reach Critical

                    seq, labels = generate_degradation_sequence(
                        profile, mode, seq_len, max_progress=max_progress
                    )
                    type_sequences.append((seq, target_label))
                    all_sequences.append((machine_type, seq, target_label))

        # ── Save per-type CSV ──
        type_file = os.path.join(output_dir, f"{machine_type.lower()}_dataset.csv")
        _save_csv(type_file, type_sequences, feature_names, seq_len)
        print(f"  ✓ Saved {len(type_sequences)} sequences → {type_file}")

    # ── Save combined CSV ──
    combined_file = os.path.join(output_dir, "combined_dataset.csv")
    _save_combined_csv(combined_file, all_sequences, feature_names, seq_len)
    print(f"\n{'='*50}")
    print(f"TOTAL: {len(all_sequences)} sequences → {combined_file}")

    # ── Save as NumPy arrays for direct model consumption ──
    _save_numpy(output_dir, all_sequences, seq_len)

    # ── Print class distribution ──
    from collections import Counter
    label_counts = Counter([s[2] for s in all_sequences])
    print(f"\nClass Distribution:")
    label_names = {0: "Healthy", 1: "Caution", 2: "Serious", 3: "Critical"}
    for lbl in sorted(label_counts.keys()):
        print(f"  {label_names[lbl]}: {label_counts[lbl]} samples")

    return all_sequences


def _save_csv(filepath, sequences, feature_names, seq_len):
    """Save sequences to CSV. Each row = one flattened sequence + label."""
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        # Header: feature_t0, feature_t1, ..., feature_tN, label
        header = []
        for t in range(seq_len):
            for feat in feature_names:
                header.append(f"{feat}_t{t}")
        header.append("label")
        writer.writerow(header)

        for seq, label in sequences:
            row = []
            for timestep in seq:
                row.extend(timestep)
            row.append(label)
            writer.writerow(row)


def _save_combined_csv(filepath, all_sequences, feature_names, seq_len):
    """Save all sequences with machine_type column."""
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        header = ["machine_type"]
        for t in range(seq_len):
            for feat in feature_names:
                header.append(f"{feat}_t{t}")
        header.append("label")
        writer.writerow(header)

        for machine_type, seq, label in all_sequences:
            row = [machine_type]
            for timestep in seq:
                row.extend(timestep)
            row.append(label)
            writer.writerow(row)


def _save_numpy(output_dir, all_sequences, seq_len):
    """Save as NumPy arrays: X.npy (samples, timesteps, features), y.npy (samples,)."""
    n_features = 6
    X = np.zeros((len(all_sequences), seq_len, n_features))
    y = np.zeros(len(all_sequences), dtype=np.int32)

    for i, (_, seq, label) in enumerate(all_sequences):
        X[i] = np.array(seq)
        y[i] = label

    np.save(os.path.join(output_dir, "X.npy"), X)
    np.save(os.path.join(output_dir, "y.npy"), y)
    print(f"\n  ✓ NumPy arrays saved: X.shape={X.shape}, y.shape={y.shape}")


if __name__ == "__main__":
    print("=" * 60)
    print("  HarmonyAura -- Predictive Maintenance Data Generator")
    print("=" * 60)
    _script_dir = os.path.dirname(os.path.abspath(__file__))
    generate_dataset(
        samples_per_class_per_type=500,
        seq_len=60,
        output_dir=os.path.join(_script_dir, "datasets")
    )
    print("\nData generation complete!")
