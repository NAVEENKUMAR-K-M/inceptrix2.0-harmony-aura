#ifndef SENTINEL_ENGINE_H
#define SENTINEL_ENGINE_H

#include <Arduino.h>

class SentinelEngine {
public:
    // CIS Results
    float edgeCIS = 0.0;
    String edgeCISLevel = "Safe";
    float edgeFatigue = 0.0;
    float edgeStress = 0.0;

    // PdM Results
    float edgePdmHealth = 100.0;
    String edgePdmStatus = "Healthy";

    // ═══════════════════════════════════════════════════
    //  CIS CALCULATION ENGINE
    // ═══════════════════════════════════════════════════
    void computeCIS(
        float hr, float temp, float humidity, float gas, 
        float machineStress, float spo2, float noise
    ) {
        // 1. Normalize parameters to 0.0 - 1.0 risk scale
        float hr_norm = constrain((hr - 72.0f) / 108.0f, 0.0f, 1.0f);
        float spo2_norm = constrain((98.0f - spo2) / 10.0f, 0.0f, 1.0f); // 88% is max risk
        float noise_norm = constrain((noise - 60.0f) / 40.0f, 0.0f, 1.0f); // 100dB max
        
        // 2. Environment Risk: Heat + Gas
        float heat_norm = constrain((temp - 30.0f) / 15.0f, 0.0f, 1.0f);
        float gas_norm = constrain(gas / 100.0f, 0.0f, 1.0f);
        float env_norm = min(1.0f, heat_norm + gas_norm);
        
        // 3. Machine Proximity Risk
        float machine_norm = constrain(machineStress / 100.0f, 0.0f, 1.0f);

        // 4. Advanced Fusion Formula (Weights)
        float raw_cis = (0.2f * hr_norm) + 
                        (0.2f * spo2_norm) + 
                        (0.1f * noise_norm) + 
                        (0.2f * env_norm) + 
                        (0.3f * machine_norm);

        edgeCIS = max(0.0f, min(1.0f, raw_cis));
        
        // Simplified mappings for dashboard sub-bars
        edgeFatigue = hr_norm * 100.0f; 
        edgeStress = (hr_norm * 50.0f) + (noise_norm * 50.0f);

        if (edgeCIS >= 0.75) edgeCISLevel = "Critical";
        else if (edgeCIS >= 0.40) edgeCISLevel = "Warning";
        else edgeCISLevel = "Safe";
    }

    // ═══════════════════════════════════════════════════
    //  PdM CALCULATION ENGINE
    // ═══════════════════════════════════════════════════
    void computePdM(
        float engineLoad, float coolantTemp, float vibration, 
        float degradation, float stressIndex
    ) {
        float health = 100.0;

        // Subtractive Degradation Model
        if (engineLoad > 80.0) health -= (engineLoad - 80.0) * 1.5;
        if (coolantTemp > 85.0) health -= (coolantTemp - 85.0) * 2.0;
        if (vibration > 6.0) health -= (vibration - 6.0) * 3.0;
        
        // Constant wear aging
        health -= degradation * 500.0;
        
        if (stressIndex > 60.0) health -= (stressIndex - 60.0) * 0.5;

        edgePdmHealth = max(0.0f, min(100.0f, health));

        if (edgePdmHealth >= 80.0) edgePdmStatus = "Healthy";
        else if (edgePdmHealth >= 50.0) edgePdmStatus = "Degraded";
        else if (edgePdmHealth >= 20.0) edgePdmStatus = "At Risk";
        else edgePdmStatus = "Critical";
    }
};

#endif // SENTINEL_ENGINE_H
