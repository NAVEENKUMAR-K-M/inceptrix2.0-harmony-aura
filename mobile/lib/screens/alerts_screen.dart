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
            _buildRestRequests(firebase),
            _buildRecommendations(firebase),
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

  Widget _buildRestRequests(FirebaseService firebase) {
    return StreamBuilder<DatabaseEvent>(
      stream: firebase.restRequestsStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.snapshot.value == null) {
          return const SizedBox.shrink();
        }

        final data = snapshot.data!.snapshot.value as Map;
        // Filter to only PENDING requests
        final pending = <String, Map>{};
        data.forEach((key, value) {
          if (value is Map && value['status'] == 'PENDING') {
            pending[key.toString()] = Map<String, dynamic>.from(value);
          }
        });

        if (pending.isEmpty) return const SizedBox.shrink();

        return Container(
          constraints: const BoxConstraints(maxHeight: 220),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Section Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 8),
                child: Row(
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: const BoxDecoration(
                        color: AuraColors.cyan,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'OPERATOR REST REQUESTS',
                      style: TextStyle(
                        color: AuraColors.cyan,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AuraColors.cyan.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        '${pending.length} PENDING',
                        style: const TextStyle(color: AuraColors.cyan, fontSize: 9, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
              ),
              // Request Cards
              Flexible(
                child: ListView(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  children: pending.entries.map((e) {
                    return _RestRequestCard(
                      requestId: e.key,
                      data: e.value,
                      firebase: firebase,
                    );
                  }).toList(),
                ),
              ),
              Container(
                height: 1,
                margin: const EdgeInsets.symmetric(horizontal: 16),
                color: AuraColors.border,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRecommendations(FirebaseService firebase) {
    return StreamBuilder<DatabaseEvent>(
      stream: firebase.recommendationsStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData || snapshot.data!.snapshot.value == null) {
          return const SizedBox.shrink();
        }

        final data = snapshot.data!.snapshot.value as Map;
        final List<dynamic> alertsList = data['alerts'] is List ? data['alerts'] : [];

        if (alertsList.isEmpty) return const SizedBox.shrink();

        final recs = alertsList
            .where((e) => e != null)
            .map((e) => Recommendation.fromMap(e as Map))
            .toList();

        // Sort: CRITICAL first
        recs.sort((a, b) {
          const order = {'CRITICAL': 0, 'WARNING': 1, 'INFO': 2};
          return (order[a.severity] ?? 3).compareTo(order[b.severity] ?? 3);
        });

        final critCount = recs.where((r) => r.isCritical).length;
        final warnCount = recs.where((r) => r.isWarning).length;

        return Container(
          constraints: const BoxConstraints(maxHeight: 240),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Section Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 8),
                child: Row(
                  children: [
                    Container(
                      width: 6, height: 6,
                      decoration: BoxDecoration(
                        color: critCount > 0 ? AuraColors.red : AuraColors.amber,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'ACTIONABLE RECOMMENDATIONS',
                      style: TextStyle(
                        color: AuraColors.textDim,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 1.0,
                      ),
                    ),
                    const Spacer(),
                    if (critCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        margin: const EdgeInsets.only(right: 6),
                        decoration: BoxDecoration(
                          color: AuraColors.red.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '$critCount CRIT',
                          style: const TextStyle(color: AuraColors.red, fontSize: 9, fontWeight: FontWeight.w800),
                        ),
                      ),
                    if (warnCount > 0)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AuraColors.amber.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          '$warnCount WARN',
                          style: const TextStyle(color: AuraColors.amber, fontSize: 9, fontWeight: FontWeight.w800),
                        ),
                      ),
                  ],
                ),
              ),
              // Recommendation Cards (scrollable)
              Flexible(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  itemCount: recs.length,
                  itemBuilder: (context, index) {
                    final rec = recs[index];
                    return _RecommendationCard(rec: rec);
                  },
                ),
              ),
              // Divider
              Container(
                height: 1,
                margin: const EdgeInsets.symmetric(horizontal: 16),
                color: AuraColors.border,
              ),
            ],
          ),
        );
      },
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

// ── Recommendation Card (Actionable Alerts) ──
class _RecommendationCard extends StatefulWidget {
  final Recommendation rec;

  const _RecommendationCard({required this.rec});

  @override
  State<_RecommendationCard> createState() => _RecommendationCardState();
}

class _RecommendationCardState extends State<_RecommendationCard> {
  bool _sent = false;
  final FirebaseService _firebase = FirebaseService();

  Color get _sevColor {
    if (widget.rec.isCritical) return AuraColors.statusCritical;
    if (widget.rec.isWarning) return AuraColors.statusWarning;
    return const Color(0xFF3B82F6);
  }

  IconData get _sevIcon {
    if (widget.rec.isCritical) return Icons.shield_rounded;
    if (widget.rec.isWarning) return Icons.warning_amber_rounded;
    return Icons.info_outline_rounded;
  }

  IconData get _targetIcon {
    switch (widget.rec.targetType) {
      case 'worker': return Icons.person_rounded;
      case 'machine': return Icons.precision_manufacturing_rounded;
      default: return Icons.place_rounded;
    }
  }

  Future<void> _dispatchCommand() async {
    if (_sent) return;
    setState(() => _sent = true);

    await _firebase.sendCommand(
      action: widget.rec.action,
      targetType: widget.rec.targetType,
      targetId: widget.rec.targetId,
      severity: widget.rec.severity,
      durationS: widget.rec.isCritical ? 180 : 120,
    );

    // Reset after 2 seconds
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _sent = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: _sevColor.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _sevColor.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Severity + Target Row
          Row(
            children: [
              Icon(_sevIcon, size: 14, color: _sevColor),
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                decoration: BoxDecoration(
                  color: _sevColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  widget.rec.severity,
                  style: TextStyle(color: _sevColor, fontSize: 8, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                ),
              ),
              const SizedBox(width: 8),
              Icon(_targetIcon, size: 10, color: AuraColors.textDim),
              const SizedBox(width: 3),
              Text(
                widget.rec.targetId,
                style: const TextStyle(color: AuraColors.textDim, fontSize: 10, fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 6),
          // Message
          Text(
            widget.rec.message,
            style: const TextStyle(color: AuraColors.textSecondary, fontSize: 12, height: 1.4),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 8),
          // Action Pill (TAPPABLE)
          GestureDetector(
            onTap: _dispatchCommand,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: _sent
                    ? AuraColors.statusSafe.withValues(alpha: 0.15)
                    : AuraColors.bgSurface,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(
                  color: _sent
                      ? AuraColors.statusSafe.withValues(alpha: 0.4)
                      : AuraColors.border,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: _sent
                    ? [
                        const Icon(Icons.check_circle_rounded, size: 12, color: AuraColors.statusSafe),
                        const SizedBox(width: 4),
                        const Text(
                          'SENT ✓',
                          style: TextStyle(color: AuraColors.statusSafe, fontSize: 10, fontWeight: FontWeight.w700),
                        ),
                      ]
                    : [
                        const Icon(Icons.send_rounded, size: 10, color: AuraColors.textDim),
                        const SizedBox(width: 4),
                        const Text(
                          'ACTION: ',
                          style: TextStyle(color: AuraColors.textDim, fontSize: 9, fontWeight: FontWeight.w600, letterSpacing: 0.3),
                        ),
                        Flexible(
                          child: Text(
                            widget.rec.action,
                            style: TextStyle(color: _sevColor, fontSize: 10, fontWeight: FontWeight.w700),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Rest Request Card (Supervisor → Approve/Deny) ──
class _RestRequestCard extends StatefulWidget {
  final String requestId;
  final Map data;
  final FirebaseService firebase;

  const _RestRequestCard({
    required this.requestId,
    required this.data,
    required this.firebase,
  });

  @override
  State<_RestRequestCard> createState() => _RestRequestCardState();
}

class _RestRequestCardState extends State<_RestRequestCard> {
  bool _acted = false;
  String _actionLabel = '';

  Future<void> _approve() async {
    if (_acted) return;
    setState(() { _acted = true; _actionLabel = 'APPROVED ✓'; });

    await widget.firebase.updateRestRequestStatus(widget.requestId, 'APPROVED');

    // Also dispatch a FORCE_BREAK command so the simulation responds
    final workerId = widget.data['worker_id']?.toString() ?? '';
    await widget.firebase.sendCommand(
      action: 'ASSIGN 15-MIN MANDATORY BREAK',
      targetType: 'worker',
      targetId: workerId,
      severity: 'WARNING',
      durationS: 900, // 15 min break
    );
  }

  Future<void> _deny() async {
    if (_acted) return;
    setState(() { _acted = true; _actionLabel = 'DENIED'; });
    await widget.firebase.updateRestRequestStatus(widget.requestId, 'DENIED');
  }

  @override
  Widget build(BuildContext context) {
    final name = widget.data['worker_name']?.toString() ?? widget.data['worker_id']?.toString() ?? 'Unknown';
    final workerId = widget.data['worker_id']?.toString() ?? '';
    final machineId = widget.data['machine_id']?.toString() ?? '';
    final vitals = widget.data['vitals'] as Map? ?? {};
    final hr = vitals['heart_rate'] ?? 0;
    final fatigue = (vitals['fatigue'] ?? 0).toDouble();
    final cis = (vitals['cis_score'] ?? 0).toDouble();
    final riskLevel = vitals['cis_risk_level']?.toString() ?? 'Safe';

    final riskColor = riskLevel == 'Critical'
        ? AuraColors.statusCritical
        : riskLevel == 'Warning'
            ? AuraColors.statusWarning
            : AuraColors.statusSafe;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AuraColors.cyan.withValues(alpha: 0.06),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AuraColors.cyan.withValues(alpha: 0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Name + Worker ID
          Row(
            children: [
              const Icon(Icons.airline_seat_flat_rounded, size: 16, color: AuraColors.cyan),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  '$name requests rest',
                  style: const TextStyle(color: AuraColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                decoration: BoxDecoration(
                  color: riskColor.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  riskLevel.toUpperCase(),
                  style: TextStyle(color: riskColor, fontSize: 8, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),

          // Vitals snapshot row
          Row(
            children: [
              _miniChip(Icons.person_rounded, workerId, AuraColors.cyan),
              const SizedBox(width: 6),
              _miniChip(Icons.favorite_rounded, '${hr} BPM', Colors.redAccent),
              const SizedBox(width: 6),
              _miniChip(Icons.bolt_rounded, '${fatigue.toStringAsFixed(0)}% Fatigue', AuraColors.amber),
              const SizedBox(width: 6),
              _miniChip(Icons.shield_rounded, 'CIS ${cis.toStringAsFixed(2)}', riskColor),
            ],
          ),
          const SizedBox(height: 8),

          // Machine chip
          _miniChip(Icons.precision_manufacturing_rounded, machineId, AuraColors.emerald),
          const SizedBox(height: 10),

          // Action Buttons
          if (_acted)
            Center(
              child: Text(
                _actionLabel,
                style: TextStyle(
                  color: _actionLabel.contains('APPROVED') ? AuraColors.statusSafe : AuraColors.statusCritical,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            )
          else
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: _approve,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: AuraColors.statusSafe.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AuraColors.statusSafe.withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.check_rounded, size: 14, color: AuraColors.statusSafe),
                          SizedBox(width: 4),
                          Text('APPROVE', style: TextStyle(color: AuraColors.statusSafe, fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: GestureDetector(
                    onTap: _deny,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      decoration: BoxDecoration(
                        color: AuraColors.statusCritical.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AuraColors.statusCritical.withValues(alpha: 0.3)),
                      ),
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.close_rounded, size: 14, color: AuraColors.statusCritical),
                          SizedBox(width: 4),
                          Text('DENY', style: TextStyle(color: AuraColors.statusCritical, fontSize: 11, fontWeight: FontWeight.w700)),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _miniChip(IconData icon, String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 9, color: color.withValues(alpha: 0.7)),
          const SizedBox(width: 3),
          Text(text, style: TextStyle(color: color, fontSize: 9, fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }
}
