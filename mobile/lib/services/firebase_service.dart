import 'package:firebase_database/firebase_database.dart';

/// Service layer for reading real-time data from Firebase RTDB.
/// Connects to the same database as the web dashboard's Python backend.

class FirebaseService {
  static final FirebaseService _instance = FirebaseService._internal();
  factory FirebaseService() => _instance;
  FirebaseService._internal();

  final DatabaseReference _db = FirebaseDatabase.instance.ref('site');

  // ── Workers Stream ──
  Stream<DatabaseEvent> get workersStream =>
      _db.child('workers').onValue;

  // ── Machines Stream ──
  Stream<DatabaseEvent> get machinesStream =>
      _db.child('machines').onValue;

  // ── Notifications Stream ──
  Stream<DatabaseEvent> get notificationsStream =>
      _db.child('notifications').onValue;

  // ── Escalation State ──
  Stream<DatabaseEvent> get escalationStream =>
      _db.child('events').onValue;

  // ── Maintenance / PdM Health ──
  Stream<DatabaseEvent> get maintenanceStream =>
      _db.child('maintenance').onValue;

  // ── Site Environment ──
  Stream<DatabaseEvent> get environmentStream =>
      _db.child('env').onValue;

  // ── Actionable Recommendations ──
  Stream<DatabaseEvent> get recommendationsStream =>
      _db.child('recommendations').onValue;

  /// Toggle risk simulation on/off
  Future<void> toggleEscalation(bool active) async {
    await _db.child('events/escalation_trigger').set(active);
  }
}
