import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';

/// Machines Screen — Real-time telemetry dashboard for heavy equipment.
/// Shows RPM, Load, Temperature, Vibration, and Stress Index for each machine.

class MachinesScreen extends StatelessWidget {
  const MachinesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final firebase = FirebaseService();

    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(firebase),
            Expanded(child: _buildMachineList(firebase)),
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
              color: AuraColors.emerald.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.precision_manufacturing_rounded, color: AuraColors.emerald, size: 20),
          ),
          const SizedBox(width: 12),
          const Text(
            'Machine Fleet',
            style: TextStyle(
              color: AuraColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          StreamBuilder<DatabaseEvent>(
            stream: firebase.machinesStream,
            builder: (context, snapshot) {
              int count = 0;
              if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
                count = (snapshot.data!.snapshot.value as Map).length;
              }
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AuraColors.emerald.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count UNITS',
                  style: const TextStyle(
                    color: AuraColors.emerald,
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

  Widget _buildMachineList(FirebaseService firebase) {
    return StreamBuilder<DatabaseEvent>(
      stream: firebase.machinesStream,
      builder: (context, machineSnap) {
        return StreamBuilder<DatabaseEvent>(
          stream: firebase.maintenanceStream,
          builder: (context, pdmSnap) {
            if (machineSnap.connectionState == ConnectionState.waiting) {
              return const Center(child: CircularProgressIndicator(color: AuraColors.emerald));
            }
            if (!machineSnap.hasData || machineSnap.data!.snapshot.value == null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.construction_rounded, size: 48, color: AuraColors.textDim),
                    const SizedBox(height: 12),
                    const Text('Waiting for machine telemetry...', style: TextStyle(color: AuraColors.textSecondary)),
                  ],
                ),
              );
            }

            final data = machineSnap.data!.snapshot.value as Map;
            final machines = data.entries
                .map((e) => MachineData.fromMap(e.key.toString(), e.value as Map))
                .toList();

            // Parse PdM data
            Map<String, dynamic> pdmData = {};
            if (pdmSnap.hasData && pdmSnap.data!.snapshot.value != null) {
              pdmData = Map<String, dynamic>.from(pdmSnap.data!.snapshot.value as Map);
            }

            machines.sort((a, b) => b.stressIndex.compareTo(a.stressIndex));

            return ListView.builder(
              padding: const EdgeInsets.only(top: 8, bottom: 16),
              itemCount: machines.length,
              itemBuilder: (context, index) {
                final pdm = pdmData[machines[index].machineId];
                return _MachineCard(
                  machine: machines[index],
                  healthLabel: pdm != null ? (pdm['health_label'] ?? '') : '',
                  healthScore: pdm != null ? ((pdm['health_score'] ?? 0).toDouble()) : null,
                  confidence: pdm != null ? ((pdm['confidence'] ?? 0).toDouble()) : null,
                )
                    .animate()
                    .fadeIn(duration: 350.ms, delay: (80 * index).ms)
                    .slideY(begin: 0.05, end: 0, duration: 350.ms, delay: (80 * index).ms);
              },
            );
          },
        );
      },
    );
  }
}

// ── Machine Card ──
class _MachineCard extends StatelessWidget {
  final MachineData machine;
  final String healthLabel;
  final double? healthScore;
  final double? confidence;

  const _MachineCard({
    required this.machine,
    this.healthLabel = '',
    this.healthScore,
    this.confidence,
  });

  Color get _stressColor {
    if (machine.stressIndex >= 70) return AuraColors.statusCritical;
    if (machine.stressIndex >= 40) return AuraColors.statusWarning;
    return AuraColors.statusSafe;
  }

  Color get _healthColor {
    switch (healthLabel) {
      case 'Critical': return AuraColors.statusCritical;
      case 'Serious': return const Color(0xFFF97316);
      case 'Caution': return AuraColors.statusWarning;
      case 'Healthy': return AuraColors.statusSafe;
      default: return AuraColors.textDim;
    }
  }

  IconData get _machineIcon {
    switch (machine.machineType) {
      case 'Excavator': return Icons.foundation_rounded;
      case 'Bulldozer': return Icons.landscape_rounded;
      case 'Crane': return Icons.cell_tower_rounded;
      case 'Loader': return Icons.forklift;
      case 'Truck': return Icons.local_shipping_rounded;
      default: return Icons.precision_manufacturing_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = WorkerMappings.getMachineName(machine.machineId);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      decoration: BoxDecoration(
        color: AuraColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: _stressColor.withValues(alpha: 0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AuraColors.emerald.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(_machineIcon, color: AuraColors.emerald, size: 22),
                ),
                const SizedBox(width: 12),
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
                        '${machine.machineType} • ${machine.machineId}',
                        style: const TextStyle(color: AuraColors.textDim, fontSize: 11),
                      ),
                    ],
                  ),
                ),
                // Mode badge
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _stressColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: _stressColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    machine.operatingMode,
                    style: TextStyle(color: _stressColor, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),

            // ── Metrics Grid ──
            Row(
              children: [
                _TelemetryMetric(
                  icon: Icons.speed_rounded,
                  label: 'RPM',
                  value: '${machine.engineRpm}',
                  color: machine.engineRpm > 2500 ? AuraColors.statusWarning : AuraColors.cyan,
                ),
                _TelemetryMetric(
                  icon: Icons.bolt_rounded,
                  label: 'LOAD',
                  value: '${machine.engineLoad.toStringAsFixed(1)}%',
                  color: machine.engineLoad > 80 ? AuraColors.statusCritical : AuraColors.cyan,
                ),
                _TelemetryMetric(
                  icon: Icons.thermostat_rounded,
                  label: 'TEMP',
                  value: '${machine.coolantTemp.toStringAsFixed(1)}°C',
                  color: machine.coolantTemp > 100 ? AuraColors.statusCritical : AuraColors.cyan,
                ),
                _TelemetryMetric(
                  icon: Icons.vibration_rounded,
                  label: 'VIB',
                  value: '${machine.vibration.toStringAsFixed(1)}',
                  color: machine.vibration > 8 ? AuraColors.statusWarning : AuraColors.cyan,
                ),
              ],
            ),

            const SizedBox(height: 12),

            // ── Stress Bar ──
            Row(
              children: [
                const Text(
                  'STRESS INDEX',
                  style: TextStyle(color: AuraColors.textDim, fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.5),
                ),
                const Spacer(),
                Text(
                  '${machine.stressIndex.toStringAsFixed(1)}%',
                  style: TextStyle(color: _stressColor, fontSize: 12, fontWeight: FontWeight.w700),
                ),
              ],
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: (machine.stressIndex / 100).clamp(0.0, 1.0),
                backgroundColor: AuraColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(_stressColor),
                minHeight: 5,
              ),
            ),

            // ── PdM Health Badge ──
            if (healthLabel.isNotEmpty) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: _healthColor.withValues(alpha: 0.06),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: _healthColor.withValues(alpha: 0.15)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.smart_toy_rounded, color: _healthColor, size: 16),
                    const SizedBox(width: 8),
                    const Text(
                      'AI HEALTH',
                      style: TextStyle(color: AuraColors.textDim, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.6),
                    ),
                    const Spacer(),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: _healthColor.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        healthLabel.toUpperCase(),
                        style: TextStyle(color: _healthColor, fontSize: 10, fontWeight: FontWeight.w800, letterSpacing: 0.5),
                      ),
                    ),
                    if (confidence != null) ...[
                      const SizedBox(width: 8),
                      Text(
                        '${(confidence! * 100).toStringAsFixed(0)}%',
                        style: const TextStyle(color: AuraColors.textDim, fontSize: 10, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── Telemetry Metric ──
class _TelemetryMetric extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _TelemetryMetric({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 12, color: color.withValues(alpha: 0.7)),
              const SizedBox(width: 3),
              Text(label, style: const TextStyle(color: AuraColors.textDim, fontSize: 9, fontWeight: FontWeight.w600, letterSpacing: 0.4)),
            ],
          ),
          const SizedBox(height: 5),
          Text(
            value,
            style: const TextStyle(color: AuraColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
          ),
        ],
      ),
    );
  }
}
