import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';

/// Alerts Screen — Historical and real-time safety notification log.
/// Shows all critical/warning events in reverse-chronological order.

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final firebase = FirebaseService();

    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(firebase),
            Expanded(child: _buildAlertList(firebase)),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(FirebaseService firebase) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
      decoration: const BoxDecoration(
        color: AuraColors.bgSurface,
        border: Border(bottom: BorderSide(color: AuraColors.border)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AuraColors.amber.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.notifications_active_rounded, color: AuraColors.amber, size: 20),
          ),
          const SizedBox(width: 12),
          const Text(
            'Alert History',
            style: TextStyle(
              color: AuraColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          StreamBuilder<DatabaseEvent>(
            stream: firebase.notificationsStream,
            builder: (context, snapshot) {
              int count = 0;
              if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
                count = (snapshot.data!.snapshot.value as Map).length;
              }
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AuraColors.amber.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count EVENTS',
                  style: const TextStyle(
                    color: AuraColors.amber,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.8,
                  ),
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildAlertList(FirebaseService firebase) {
    return StreamBuilder<DatabaseEvent>(
      stream: firebase.notificationsStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AuraColors.amber));
        }
        if (!snapshot.hasData || snapshot.data!.snapshot.value == null) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.notifications_off_rounded, size: 48, color: AuraColors.textDim),
                const SizedBox(height: 12),
                const Text('No alerts recorded yet.', style: TextStyle(color: AuraColors.textSecondary)),
                const SizedBox(height: 4),
                const Text(
                  'Alerts will appear when risk escalations occur.',
                  style: TextStyle(color: AuraColors.textDim, fontSize: 12),
                ),
              ],
            ),
          );
        }

        final data = snapshot.data!.snapshot.value as Map;
        final alerts = data.entries.map((e) {
          final val = e.value as Map;
          return _AlertItem(
            id: e.key.toString(),
            workerId: val['worker_id']?.toString() ?? '',
            reason: val['reason']?.toString() ?? 'Unknown',
            severity: val['severity']?.toString() ?? 'Warning',
            timestamp: val['timestamp']?.toString() ?? '',
            cisScore: (val['cis_score'] ?? 0).toDouble(),
          );
        }).toList();

        // Reverse chronological (newest first)
        alerts.sort((a, b) => b.timestamp.compareTo(a.timestamp));

        return ListView.builder(
          padding: const EdgeInsets.only(top: 8, bottom: 16),
          itemCount: alerts.length,
          itemBuilder: (context, index) {
            return _AlertCard(alert: alerts[index])
                .animate()
                .fadeIn(duration: 300.ms, delay: (40 * index).ms)
                .slideX(begin: -0.03, end: 0, duration: 300.ms, delay: (40 * index).ms);
          },
        );
      },
    );
  }
}

// ── Alert Data Model ──
class _AlertItem {
  final String id;
  final String workerId;
  final String reason;
  final String severity;
  final String timestamp;
  final double cisScore;

  _AlertItem({
    required this.id,
    required this.workerId,
    required this.reason,
    required this.severity,
    required this.timestamp,
    required this.cisScore,
  });

  bool get isCritical => severity == 'Critical';
}

// ── Alert Card ──
class _AlertCard extends StatelessWidget {
  final _AlertItem alert;

  const _AlertCard({required this.alert});

  Color get _sevColor => alert.isCritical ? AuraColors.statusCritical : AuraColors.statusWarning;

  String get _formattedTime {
    try {
      final dt = DateTime.parse(alert.timestamp);
      final now = DateTime.now();
      final diff = now.difference(dt);

      if (diff.inMinutes < 1) return 'Just now';
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return '${dt.day}/${dt.month} ${dt.hour}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return alert.timestamp;
    }
  }

  @override
  Widget build(BuildContext context) {
    final workerName = WorkerMappings.getWorkerName(alert.workerId);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
      decoration: BoxDecoration(
        color: AuraColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _sevColor.withValues(alpha: 0.25)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Severity icon
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: _sevColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                alert.isCritical ? Icons.warning_rounded : Icons.error_outline_rounded,
                color: _sevColor,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),

            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header row
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          workerName,
                          style: const TextStyle(
                            color: AuraColors.textPrimary,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      Text(
                        _formattedTime,
                        style: const TextStyle(color: AuraColors.textDim, fontSize: 11),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),

                  // Reason
                  Text(
                    alert.reason,
                    style: const TextStyle(color: AuraColors.textSecondary, fontSize: 13),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),

                  // Footer chips
                  Row(
                    children: [
                      _InfoChip(
                        icon: Icons.person_rounded,
                        text: alert.workerId,
                        color: AuraColors.cyan,
                      ),
                      const SizedBox(width: 8),
                      _InfoChip(
                        icon: Icons.shield_rounded,
                        text: 'CIS ${alert.cisScore.toStringAsFixed(2)}',
                        color: _sevColor,
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _sevColor.withValues(alpha: 0.12),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          alert.severity.toUpperCase(),
                          style: TextStyle(color: _sevColor, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Info Chip ──
class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;

  const _InfoChip({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: color.withValues(alpha: 0.7)),
          const SizedBox(width: 4),
          Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
