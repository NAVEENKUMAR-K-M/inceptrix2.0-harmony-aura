import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';

/// Machine Detail Screen — Real-time telemetry for the operator's assigned machine.
/// Automatically detects the assigned machine from the worker's data.

class MachineDetailScreen extends StatelessWidget {
  final String workerId;
  const MachineDetailScreen({super.key, required this.workerId});

  @override
  Widget build(BuildContext context) {
    final firebase = FirebaseService();

    // First, get the worker's assigned machine, then stream that machine's data.
    return StreamBuilder<DatabaseEvent>(
      stream: firebase.workerStream(workerId),
      builder: (context, workerSnap) {
        if (!workerSnap.hasData || workerSnap.data!.snapshot.value == null) {
          return const Center(child: CircularProgressIndicator(color: AuraColors.emerald));
        }

        final worker = WorkerData.fromMap(workerId, workerSnap.data!.snapshot.value as Map);
        final machineId = worker.assignedMachine;

        return StreamBuilder<DatabaseEvent>(
          stream: firebase.machineStream(machineId),
          builder: (context, machineSnap) {
            if (!machineSnap.hasData || machineSnap.data!.snapshot.value == null) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.construction_rounded, size: 48, color: AuraColors.textDim),
                    const SizedBox(height: 12),
                    Text('Machine $machineId not found.', style: const TextStyle(color: AuraColors.textSecondary)),
                  ],
                ),
              );
            }

            final machine = MachineData.fromMap(machineId, machineSnap.data!.snapshot.value as Map);
            return _buildContent(context, machine);
          },
        );
      },
    );
  }

  Widget _buildContent(BuildContext context, MachineData machine) {
    final name = WorkerMappings.getMachineName(machine.machineId);
    final stressColor = _getStressColor(machine.stressIndex);

    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 32),
        child: Column(
          children: [
            // ── Header ──
            _buildHeader(name, machine, stressColor),

            const SizedBox(height: 20),

            // ── Status Banner ──
            if (machine.stressIndex >= 40)
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 16),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                decoration: BoxDecoration(
                  color: stressColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: stressColor.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    Icon(
                      machine.stressIndex >= 70 ? Icons.warning_rounded : Icons.info_rounded,
                      color: stressColor, size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        machine.stressIndex >= 70
                            ? 'CRITICAL STRESS — Reduce load or shut down!'
                            : 'Machine under elevated stress. Monitor closely.',
                        style: TextStyle(color: stressColor, fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ],
                ),
              ).animate().fadeIn(duration: 300.ms),

            const SizedBox(height: 24),

            // ── Primary Metrics ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('ENGINE TELEMETRY', style: TextStyle(color: AuraColors.textDim, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(child: _TelemetryCard(
                        icon: Icons.speed_rounded, iconColor: AuraColors.cyan,
                        label: 'RPM', value: '${machine.engineRpm}', unit: '',
                        status: machine.engineRpm > 2500 ? 'HIGH' : 'NORMAL',
                        statusColor: machine.engineRpm > 2500 ? AuraColors.statusWarning : AuraColors.statusSafe,
                      ).animate().fadeIn(duration: 400.ms, delay: 100.ms).slideY(begin: 0.1, end: 0)),
                      const SizedBox(width: 10),
                      Expanded(child: _TelemetryCard(
                        icon: Icons.bolt_rounded, iconColor: AuraColors.amber,
                        label: 'Load', value: machine.engineLoad.toStringAsFixed(1), unit: '%',
                        status: machine.engineLoad > 80 ? 'OVERLOAD' : 'NOMINAL',
                        statusColor: machine.engineLoad > 80 ? AuraColors.statusCritical : AuraColors.statusSafe,
                      ).animate().fadeIn(duration: 400.ms, delay: 200.ms).slideY(begin: 0.1, end: 0)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(child: _TelemetryCard(
                        icon: Icons.thermostat_rounded, iconColor: Colors.orangeAccent,
                        label: 'Temperature', value: machine.coolantTemp.toStringAsFixed(1), unit: '°C',
                        status: machine.coolantTemp > 100 ? 'OVERHEAT' : 'NORMAL',
                        statusColor: machine.coolantTemp > 100 ? AuraColors.statusCritical : AuraColors.statusSafe,
                      ).animate().fadeIn(duration: 400.ms, delay: 300.ms).slideY(begin: 0.1, end: 0)),
                      const SizedBox(width: 10),
                      Expanded(child: _TelemetryCard(
                        icon: Icons.vibration_rounded, iconColor: Colors.purpleAccent,
                        label: 'Vibration', value: machine.vibration.toStringAsFixed(1), unit: 'mm/s',
                        status: machine.vibration > 8 ? 'HIGH' : 'SAFE',
                        statusColor: machine.vibration > 8 ? AuraColors.statusWarning : AuraColors.statusSafe,
                      ).animate().fadeIn(duration: 400.ms, delay: 400.ms).slideY(begin: 0.1, end: 0)),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // ── Stress Index Bar ──
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AuraColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: stressColor.withValues(alpha: 0.2)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(Icons.shield_rounded, size: 16, color: stressColor),
                        const SizedBox(width: 8),
                        const Text('STRESS INDEX', style: TextStyle(color: AuraColors.textDim, fontSize: 11, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
                        const Spacer(),
                        Text(
                          '${machine.stressIndex.toStringAsFixed(1)}%',
                          style: TextStyle(color: stressColor, fontSize: 20, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(6),
                      child: LinearProgressIndicator(
                        value: (machine.stressIndex / 100).clamp(0.0, 1.0),
                        backgroundColor: AuraColors.border,
                        valueColor: AlwaysStoppedAnimation<Color>(stressColor),
                        minHeight: 8,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Mode: ${machine.operatingMode}', style: const TextStyle(color: AuraColors.textDim, fontSize: 11)),
                        Text('Type: ${machine.machineType}', style: const TextStyle(color: AuraColors.textDim, fontSize: 11)),
                      ],
                    ),
                  ],
                ),
              ),
            ).animate().fadeIn(duration: 400.ms, delay: 500.ms),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader(String name, MachineData machine, Color stressColor) {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 14),
      decoration: const BoxDecoration(
        color: AuraColors.bgSurface,
        border: Border(bottom: BorderSide(color: AuraColors.border)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AuraColors.emerald.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.precision_manufacturing_rounded, color: AuraColors.emerald, size: 22),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(color: AuraColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 17)),
                const SizedBox(height: 2),
                Text('${machine.machineType} • ${machine.machineId}', style: const TextStyle(color: AuraColors.textDim, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: stressColor.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: stressColor.withValues(alpha: 0.3)),
            ),
            child: Text(
              machine.operatingMode,
              style: TextStyle(color: stressColor, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5),
            ),
          ),
        ],
      ),
    );
  }

  Color _getStressColor(double stress) {
    if (stress >= 70) return AuraColors.statusCritical;
    if (stress >= 40) return AuraColors.statusWarning;
    return AuraColors.statusSafe;
  }
}

// ── Telemetry Card ──
class _TelemetryCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String label;
  final String value;
  final String unit;
  final String status;
  final Color statusColor;

  const _TelemetryCard({
    required this.icon, required this.iconColor, required this.label,
    required this.value, required this.unit, required this.status, required this.statusColor,
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
            text: TextSpan(children: [
              TextSpan(text: value, style: const TextStyle(color: AuraColors.textPrimary, fontSize: 28, fontWeight: FontWeight.w800)),
              if (unit.isNotEmpty)
                TextSpan(text: ' $unit', style: const TextStyle(color: AuraColors.textDim, fontSize: 13, fontWeight: FontWeight.w500)),
            ]),
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(color: statusColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
            child: Text(status, style: TextStyle(color: statusColor, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 0.5)),
          ),
        ],
      ),
    );
  }
}
