/// Data models for the Operator App.
/// Mirrors the backend Firebase schema for workers and machines.

class WorkerData {
  final String workerId;
  final int heartRate;
  final int hrv;
  final double fatigue;
  final double stress;
  final double cisScore;
  final String cisRiskLevel;
  final String assignedMachine;

  WorkerData({
    required this.workerId,
    required this.heartRate,
    required this.hrv,
    required this.fatigue,
    required this.stress,
    required this.cisScore,
    required this.cisRiskLevel,
    required this.assignedMachine,
  });

  factory WorkerData.fromMap(String id, Map data) {
    return WorkerData(
      workerId: id,
      heartRate: (data['heart_rate_bpm'] ?? 70).toInt(),
      hrv: (data['hrv_ms'] ?? 60).toInt(),
      fatigue: (data['fatigue_percent'] ?? 0).toDouble(),
      stress: (data['stress_percent'] ?? 0).toDouble(),
      cisScore: (data['cis_score'] ?? 0).toDouble(),
      cisRiskLevel: data['cis_risk_level'] ?? 'Safe',
      assignedMachine: data['assigned_machine'] ?? 'Unknown',
    );
  }

  bool get isCritical => cisRiskLevel == 'Critical';
  bool get isWarning => cisRiskLevel == 'Warning';
  bool get isSafe => cisRiskLevel == 'Safe';
}

class MachineData {
  final String machineId;
  final String machineType;
  final int engineRpm;
  final double engineLoad;
  final double coolantTemp;
  final double vibration;
  final double stressIndex;
  final String operatingMode;

  MachineData({
    required this.machineId,
    required this.machineType,
    required this.engineRpm,
    required this.engineLoad,
    required this.coolantTemp,
    required this.vibration,
    required this.stressIndex,
    required this.operatingMode,
  });

  factory MachineData.fromMap(String id, Map data) {
    return MachineData(
      machineId: id,
      machineType: data['machine_type'] ?? 'Unknown',
      engineRpm: (data['engine_rpm'] ?? 0).toInt(),
      engineLoad: (data['engine_load'] ?? 0).toDouble(),
      coolantTemp: (data['coolant_temp'] ?? 25).toDouble(),
      vibration: (data['vibration_mm_s'] ?? 0).toDouble(),
      stressIndex: (data['stress_index'] ?? 0).toDouble(),
      operatingMode: data['operating_mode'] ?? 'IDLE',
    );
  }
}

/// Human-readable name mappings.
class WorkerMappings {
  static const Map<String, String> _workerNames = {
    'W1': 'Rajesh Kumar', 'W2': 'Ananya Sharma', 'W3': 'Vikram Singh',
    'W4': 'Priya Patel', 'W5': 'Arjun Reddy', 'W6': 'Deepa Nair',
    'W7': 'Suresh Yadav', 'W8': 'Kavitha Menon', 'W9': 'Rahul Verma',
    'W10': 'Lakshmi Iyer',
  };

  static const Map<String, String> _machineNames = {
    'CONST-001': 'CAT 320 Excavator', 'CONST-002': 'Komatsu D65 Dozer',
    'CONST-003': 'Liebherr LTM Crane', 'CONST-004': 'Volvo L120 Loader',
    'CONST-005': 'Tata Prima Truck',
  };

  static String getWorkerName(String id) => _workerNames[id] ?? id;
  static String getMachineName(String id) => _machineNames[id] ?? id;
}
