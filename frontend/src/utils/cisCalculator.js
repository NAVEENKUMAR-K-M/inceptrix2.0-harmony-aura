import { WORKER_THRESHOLDS, MACHINE_THRESHOLDS } from './thresholds';

/**
 * Normalizes a value between a min and max range.
 * @param {number} value - The current value.
 * @param {number} min - The minimum value (0 risk).
 * @param {number} max - The maximum value (100% risk).
 * @returns {number} - Normalized value between 0 and 1.
 */
const normalize = (value, min, max) => {
    if (value <= min) return 0;
    if (value >= max) return 1;
    return (value - min) / (max - min);
};

/**
 * Calculates the Composite Intelligence Score (CIS) for a worker-machine pair.
 * 
 * Logic:
 * humanRisk = 0.4 * HR_Risk + 0.3 * HRV_Risk + 0.3 * Fatigue_Risk
 * machineRisk = 0.6 * Stress_Risk + 0.4 * Degradation_Risk (+ 0.15 if fault)
 * CIS = 0.55 * humanRisk + 0.45 * machineRisk
 * 
 * @param {Object} worker - Worker telemetry object.
 * @param {Object} machine - Machine telemetry object (optional).
 * @returns {Object} - { score: number (0-1), level: 'Safe'|'Warning'|'Critical' }
 */
export const calculateCIS = (worker, machine) => {
    if (!worker) return { score: 0, level: 'Safe' };

    // --- Step 1: Human Risk Calculation ---

    // Heart Rate Risk: Baseline ~80, Critical 120
    const hrRisk = normalize(worker.heart_rate_bpm, 80, 120);

    // HRV Risk: Baseline (healthy) ~50+, Bad <25
    // Note: HRV is inverse (lower is worse). 
    // If HRV >= 50, risk is 0. If HRV <= 25, risk is 1.
    // We Map 50 -> 0 and 25 -> 1
    let hrvRisk = 0;
    if (worker.hrv_ms >= 50) hrvRisk = 0;
    else if (worker.hrv_ms <= 25) hrvRisk = 1;
    else {
        // Linear interpolation between 50 (0) and 25 (1)
        hrvRisk = (50 - worker.hrv_ms) / 25;
    }

    // Fatigue Risk: Already 0-100, normalize to 0-1
    const fatigueRisk = normalize(worker.fatigue_percent, 0, 100);

    const humanRisk = (0.4 * hrRisk) + (0.3 * hrvRisk) + (0.3 * fatigueRisk);

    // --- Step 2: Machine Risk Calculation ---

    let machineRisk = 0;
    if (machine) {
        // Machine Stress: Already 0-100
        const stressRisk = normalize(machine.stress_index, 0, 100);

        // Degradation: Usually low, scale it up. 
        // Let's say 100% degradation = 1.0 risk.
        // models.py degradation is roughly 0-1 range over long term but let's treat it as percentage if needed.
        // Actually models.py outputs degradation as a small number that grows, 
        // but let's assume the frontend view sees it as 0-100 or 0-1.
        // Looking at models.py, degradation grows slowly. Let's normalize it 0-10 for now as it's slow.
        // Or better, use the thresholds from thresholds.js if available, but models.py writes it as float.
        // Let's stick to the prompt: "Already 0-1 -> use directly"
        // Wait, models.py says degradation starts at 0.0 and adds 0.0001 per tick. 
        // For the sake of the prompt "Already 0-1", we assume it's normalized. 
        // However, stress_index is 0-100.
        // Let's safe-guard:
        const degradationRisk = machine.degradation > 1 ? 1 : machine.degradation;

        machineRisk = (0.6 * stressRisk) + (0.4 * degradationRisk);

        // Fault Boost
        if (machine.fault_codes && machine.fault_codes.length > 0) {
            machineRisk += 0.15;
            if (machineRisk > 1) machineRisk = 1;
        }
    }

    // --- Step 3: Final CIS Score ---

    let cis = (0.55 * humanRisk) + (0.45 * machineRisk);

    // Clamp
    if (cis < 0) cis = 0;
    if (cis > 1) cis = 1;

    // --- Step 4: Classification ---
    // Thresholds aligned with backend:
    // Safe:     CIS < 0.40
    // Warning:  0.40 <= CIS < 0.75
    // Critical: CIS >= 0.75
    let level = 'Safe';
    if (cis >= 0.75) level = 'Critical';
    else if (cis >= 0.40) level = 'Warning';

    return {
        score: cis,
        level: level,
        details: {
            humanRisk,
            machineRisk
        }
    };
};
