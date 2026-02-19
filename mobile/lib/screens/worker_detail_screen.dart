import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'dart:math' as math;
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';

/// Worker Detail Screen — Biometric deep-dive for a specific worker.
/// Shows a large CIS gauge, vital metrics grid, and real-time status.

class WorkerDetailScreen extends StatelessWidget {
  final String workerId;

  const WorkerDetailScreen({super.key, required this.workerId});

  @override
  Widget build(BuildContext context) {
    final firebase = FirebaseService();

    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: StreamBuilder<DatabaseEvent>(
        stream: firebase.workersStream,
        builder: (context, snapshot) {
          if (!snapshot.hasData || snapshot.data!.snapshot.value == null) {
            return const Center(child: CircularProgressIndicator(color: AuraColors.cyan));
          }

          final data = snapshot.data!.snapshot.value as Map;
          if (!data.containsKey(workerId)) {
            return const Center(child: Text('Worker not found', style: TextStyle(color: AuraColors.textSecondary)));
          }

          final worker = WorkerData.fromMap(workerId, data[workerId] as Map);
          return _buildContent(context, worker);
        },
      ),
    );
  }

  Widget _buildContent(BuildContext context, WorkerData worker) {
    final name = WorkerMappings.getWorkerName(worker.workerId);
    final machine = WorkerMappings.getMachineName(worker.assignedMachine);
    final statusColor = _getStatusColor(worker.cisRiskLevel);

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 32),
        child: Column(
          children: [
            // ── Header with Back Button ──
            _buildHeader(context, name, machine, worker, statusColor),

            const SizedBox(height: 20),

            // ── CIS Gauge ──
            _CISGauge(score: worker.cisScore, riskLevel: worker.cisRiskLevel)
                .animate()
                .fadeIn(duration: 500.ms)
                .scale(begin: const Offset(0.9, 0.9), end: const Offset(1, 1), duration: 500.ms),

            const SizedBox(height: 24),

            // ── Vitals Grid ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'VITAL SIGNS',
                    style: TextStyle(
                      color: AuraColors.textDim,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _VitalCard(
                          icon: Icons.favorite_rounded,
                          iconColor: Colors.redAccent,
                          label: 'Heart Rate',
                          value: '${worker.heartRate}',
                          unit: 'BPM',
                          status: worker.heartRate > 120 ? 'ELEVATED' : 'NORMAL',
                          statusColor: worker.heartRate > 120 ? AuraColors.statusWarning : AuraColors.statusSafe,
                        ).animate().fadeIn(duration: 400.ms, delay: 100.ms).slideY(begin: 0.1, end: 0),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _VitalCard(
                          icon: Icons.timeline_rounded,
                          iconColor: AuraColors.cyan,
                          label: 'HRV',
                          value: '${worker.hrv}',
                          unit: 'ms',
                          status: worker.hrv < 30 ? 'LOW' : 'NORMAL',
                          statusColor: worker.hrv < 30 ? AuraColors.statusWarning : AuraColors.statusSafe,
                        ).animate().fadeIn(duration: 400.ms, delay: 200.ms).slideY(begin: 0.1, end: 0),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: _VitalCard(
                          icon: Icons.bolt_rounded,
                          iconColor: AuraColors.amber,
                          label: 'Fatigue',
                          value: worker.fatigue.toStringAsFixed(1),
                          unit: '%',
                          status: worker.fatigue > 60 ? 'HIGH' : 'OPTIMAL',
                          statusColor: worker.fatigue > 60 ? AuraColors.statusCritical : AuraColors.statusSafe,
                        ).animate().fadeIn(duration: 400.ms, delay: 300.ms).slideY(begin: 0.1, end: 0),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _VitalCard(
                          icon: Icons.psychology_rounded,
                          iconColor: Colors.purpleAccent,
                          label: 'Stress',
                          value: worker.stress.toStringAsFixed(1),
                          unit: '%',
                          status: worker.stress > 60 ? 'HIGH' : 'OPTIMAL',
                          statusColor: worker.stress > 60 ? AuraColors.statusCritical : AuraColors.statusSafe,
                        ).animate().fadeIn(duration: 400.ms, delay: 400.ms).slideY(begin: 0.1, end: 0),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ── Assignment Info ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AuraColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AuraColors.border),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: AuraColors.emerald.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.precision_manufacturing_rounded, color: AuraColors.emerald, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('ASSIGNED MACHINE', style: TextStyle(color: AuraColors.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
                          const SizedBox(height: 4),
                          Text(machine, style: const TextStyle(color: AuraColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                          Text(worker.assignedMachine, style: const TextStyle(color: AuraColors.textDim, fontSize: 11)),
                        ],
                      ),
                    ),
                    const Icon(Icons.link_rounded, color: AuraColors.textDim, size: 18),
                  ],
                ),
              ),
            ).animate().fadeIn(duration: 400.ms, delay: 500.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(BuildContext context, String name, String machine, WorkerData worker, Color statusColor) {
    return Container(
      padding: const EdgeInsets.fromLTRB(8, 8, 20, 16),
      decoration: const BoxDecoration(
        color: AuraColors.bgSurface,
        border: Border(bottom: BorderSide(color: AuraColors.border)),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.arrow_back_rounded, color: AuraColors.textPrimary),
          ),
          const SizedBox(width: 4),
          // Avatar
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [statusColor.withValues(alpha: 0.25), statusColor.withValues(alpha: 0.05)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(
                name.substring(0, 1),
                style: TextStyle(color: statusColor, fontWeight: FontWeight.w700, fontSize: 18),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(color: AuraColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 17)),
                const SizedBox(height: 2),
                Text(
                  '${worker.workerId} • $machine',
                  style: const TextStyle(color: AuraColors.textDim, fontSize: 12),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: statusColor.withValues(alpha: 0.3)),
            ),
            child: Text(
              worker.cisRiskLevel.toUpperCase(),
              style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String riskLevel) {
    switch (riskLevel) {
      case 'Critical': return AuraColors.statusCritical;
      case 'Warning': return AuraColors.statusWarning;
      default: return AuraColors.statusSafe;
    }
  }
}

// ── CIS Gauge Widget ──
class _CISGauge extends StatelessWidget {
  final double score;
  final String riskLevel;

  const _CISGauge({required this.score, required this.riskLevel});

  Color get _color {
    switch (riskLevel) {
      case 'Critical': return AuraColors.statusCritical;
      case 'Warning': return AuraColors.statusWarning;
      default: return AuraColors.statusSafe;
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 200,
      height: 200,
      child: CustomPaint(
        painter: _GaugePainter(
          score: score.clamp(0, 1),
          color: _color,
        ),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                score.toStringAsFixed(2),
                style: TextStyle(
                  color: _color,
                  fontSize: 36,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'CIS SCORE',
                style: TextStyle(
                  color: AuraColors.textDim,
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 1.0,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: _color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  riskLevel.toUpperCase(),
                  style: TextStyle(color: _color, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Custom Gauge Painter ──
class _GaugePainter extends CustomPainter {
  final double score;
  final Color color;

  _GaugePainter({required this.score, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 12;

    // Background arc
    final bgPaint = Paint()
      ..color = AuraColors.border
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75,
      math.pi * 1.5,
      false,
      bgPaint,
    );

    // Value arc
    final valuePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75,
      math.pi * 1.5 * score,
      false,
      valuePaint,
    );

    // Glow effect
    final glowPaint = Paint()
      ..color = color.withValues(alpha: 0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 16
      ..strokeCap = StrokeCap.round
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      math.pi * 0.75,
      math.pi * 1.5 * score,
      false,
      glowPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _GaugePainter oldDelegate) =>
      oldDelegate.score != score || oldDelegate.color != color;
}

// ── Vital Card ──
class _VitalCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String unit;
  final String status;
  final Color statusColor;

  const _VitalCard({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.unit,
    required this.status,
    required this.statusColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AuraColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AuraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: iconColor),
              const SizedBox(width: 6),
              Text(label, style: const TextStyle(color: AuraColors.textDim, fontSize: 11, fontWeight: FontWeight.w600)),
            ],
          ),
          const SizedBox(height: 10),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: value,
                  style: const TextStyle(color: AuraColors.textPrimary, fontSize: 26, fontWeight: FontWeight.w800),
                ),
                TextSpan(
                  text: ' $unit',
                  style: const TextStyle(color: AuraColors.textDim, fontSize: 13, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: statusColor.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              status,
              style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.5),
            ),
          ),
        ],
      ),
    );
  }
}
