import 'package:firebase_database/firebase_database.dart';

/// Firebase service for the Operator App.
/// Provides targeted streams for a specific worker and their assigned machine.

class FirebaseService {
  final DatabaseReference _db = FirebaseDatabase.instance.ref('site');

  /// Stream for a specific worker's data.
  Stream<DatabaseEvent> workerStream(String workerId) {
    return _db.child('workers/$workerId').onValue;
  }

  /// Stream for a specific machine's data.
  Stream<DatabaseEvent> machineStream(String machineId) {
    return _db.child('machines/$machineId').onValue;
  }

  /// Stream for all workers (used in selection screen).
  Stream<DatabaseEvent> get allWorkersStream => _db.child('workers').onValue;

  /// Stream for escalation state.
  Stream<DatabaseEvent> get escalationStream => _db.child('escalation').onValue;

  /// Stream for notifications.
  Stream<DatabaseEvent> get notificationsStream => _db.child('notifications').onValue;

  /// Stream for a specific worker's rest requests (to show status).
  Stream<DatabaseEvent> restRequestsStream(String workerId) {
    return _db
        .child('rest_requests')
        .orderByChild('worker_id')
        .equalTo(workerId)
        .onValue;
  }

  /// Send a rest request from the operator.
  Future<void> sendRestRequest({
    required String workerId,
    required String workerName,
    required String machineId,
    required int heartRate,
    required int hrv,
    required double fatigue,
    required double stress,
    required double cisScore,
    required String cisRiskLevel,
    String reason = 'Operator requested rest',
  }) async {
    final reqRef = _db.child('rest_requests').push();
    await reqRef.set({
      'worker_id': workerId,
      'worker_name': workerName,
      'machine_id': machineId,
      'reason': reason,
      'status': 'PENDING',
      'timestamp': ServerValue.timestamp,
      'vitals': {
        'heart_rate': heartRate,
        'hrv': hrv,
        'fatigue': fatigue,
        'stress': stress,
        'cis_score': cisScore,
        'cis_risk_level': cisRiskLevel,
      },
    });
  }
}
