/// Data models for the Harmony Aura mobile app.
/// These mirror the data structures written by the Python backend to Firebase.

class WorkerData {
  final String workerId;
  final String assignedMachine;
  final int heartRate;
  final int hrv;
  final double fatigue;
  final double stress;
  final double cisScore;
  final String cisRiskLevel;

  WorkerData({
    required this.workerId,
    required this.assignedMachine,
    required this.heartRate,
    required this.hrv,
    required this.fatigue,
    required this.stress,
    required this.cisScore,
    required this.cisRiskLevel,
  });

  factory WorkerData.fromMap(String id, Map<dynamic, dynamic> map) {
    return WorkerData(
      workerId: id,
      assignedMachine: map['assigned_machine'] ?? '',
      heartRate: (map['heart_rate_bpm'] ?? 0).toInt(),
      hrv: (map['hrv_ms'] ?? 0).toInt(),
      fatigue: (map['fatigue_percent'] ?? 0).toDouble(),
      stress: (map['stress_percent'] ?? 0).toDouble(),
      cisScore: (map['cis_score'] ?? 0).toDouble(),
      cisRiskLevel: map['cis_risk_level'] ?? 'Safe',
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
  final double stressIndex;
  final double vibration;
  final String operatingMode;

  MachineData({
    required this.machineId,
    required this.machineType,
    required this.engineRpm,
    required this.engineLoad,
    required this.coolantTemp,
    required this.stressIndex,
    required this.vibration,
    required this.operatingMode,
  });

  factory MachineData.fromMap(String id, Map<dynamic, dynamic> map) {
    return MachineData(
      machineId: id,
      machineType: map['machine_type'] ?? 'Unknown',
      engineRpm: (map['engine_rpm'] ?? 0).toInt(),
      engineLoad: (map['engine_load'] ?? 0).toDouble(),
      coolantTemp: (map['coolant_temp'] ?? 0).toDouble(),
      stressIndex: (map['stress_index'] ?? 0).toDouble(),
      vibration: (map['vibration_mm_s'] ?? 0).toDouble(),
      operatingMode: map['operating_mode'] ?? 'IDLE',
    );
  }
}

/// Maps technical IDs to human names (matches web dashboard mappings.js)
class WorkerMappings {
  static const Map<String, String> names = {
    'W1': 'Marcus Chen',
    'W2': 'Sarah Miller',
    'W3': 'David Park',
    'W4': 'Elena Rodriguez',
    'W5': 'James Wilson',
    'W6': 'Priya Patel',
    'W7': 'Tom Hiddleston',
    'W8': 'Lisa Wong',
    'W9': 'Robert Fox',
    'W10': 'Emily Zhang',
  };

  static const Map<String, String> machineNames = {
    'CONST-001': 'Excavator Hub Alpha',
    'CONST-002': 'Dozer Unit Delta',
    'CONST-003': 'Tower Crane X1',
    'CONST-004': 'Heavy Hauler 04',
    'CONST-005': 'Loader Systems Beta',
  };

  static String getWorkerName(String id) => names[id] ?? id;
  static String getMachineName(String id) => machineNames[id] ?? id;
}
