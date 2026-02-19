import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/models.dart';

/// Premium glassmorphic worker card matching the web dashboard aesthetic.
/// Shows heart rate, fatigue, CIS score with risk-colored borders and glows.

class WorkerCard extends StatelessWidget {
  final WorkerData worker;
  final int index;

  const WorkerCard({super.key, required this.worker, required this.index});

  Color get _statusColor {
    switch (worker.cisRiskLevel) {
      case 'Critical':
        return AuraColors.statusCritical;
      case 'Warning':
        return AuraColors.statusWarning;
      default:
        return AuraColors.statusSafe;
    }
  }

  Color get _bgColor {
    switch (worker.cisRiskLevel) {
      case 'Critical':
        return const Color(0xFF1A0A0A);
      case 'Warning':
        return const Color(0xFF1A1508);
      default:
        return AuraColors.bgCard;
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = WorkerMappings.getWorkerName(worker.workerId);
    final machine = WorkerMappings.getMachineName(worker.assignedMachine);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: _bgColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: _statusColor.withValues(alpha: worker.isSafe ? 0.15 : 0.5),
          width: worker.isSafe ? 1 : 1.5,
        ),
        boxShadow: worker.isSafe
            ? []
            : [
                BoxShadow(
                  color: _statusColor.withValues(alpha: 0.15),
                  blurRadius: 12,
                  spreadRadius: 1,
                ),
              ],
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header Row ──
            Row(
              children: [
                // Worker number badge
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(
                      '${index + 1}',
                      style: TextStyle(
                        color: _statusColor,
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // Name and machine
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        name,
                        style: const TextStyle(
                          color: AuraColors.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 15,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '📍 $machine',
                        style: const TextStyle(
                          color: AuraColors.textDim,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                // Status badge
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _statusColor.withValues(alpha: 0.3),
                    ),
                  ),
                  child: Text(
                    worker.cisRiskLevel.toUpperCase(),
                    style: TextStyle(
                      color: _statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // ── Metrics Row ──
            Row(
              children: [
                _MetricTile(
                  icon: Icons.favorite_rounded,
                  iconColor: Colors.redAccent,
                  label: 'HEART RATE',
                  value: '${worker.heartRate}',
                  unit: 'BPM',
                ),
                _MetricTile(
                  icon: Icons.bolt_rounded,
                  iconColor: AuraColors.amber,
                  label: 'FATIGUE',
                  value: worker.fatigue.toStringAsFixed(1),
                  unit: '%',
                ),
                _MetricTile(
                  icon: Icons.shield_rounded,
                  iconColor: _statusColor,
                  label: 'CIS SCORE',
                  value: worker.cisScore.toStringAsFixed(2),
                  unit: '',
                ),
              ],
            ),

            // ── CIS Bar ──
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: worker.cisScore.clamp(0.0, 1.0),
                backgroundColor: AuraColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(_statusColor),
                minHeight: 4,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _MetricTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String unit;

  const _MetricTile({
    required this.icon,
    required this.iconColor,
    required this.label,
    required this.value,
    required this.unit,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: iconColor),
              const SizedBox(width: 4),
              Text(
                label,
                style: const TextStyle(
                  color: AuraColors.textDim,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                  letterSpacing: 0.5,
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          RichText(
            text: TextSpan(
              children: [
                TextSpan(
                  text: value,
                  style: const TextStyle(
                    color: AuraColors.textPrimary,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                TextSpan(
                  text: ' $unit',
                  style: const TextStyle(
                    color: AuraColors.textDim,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
