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
}
