import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';
import 'operator_home_screen.dart';

/// Worker Selection Screen — Entry point for the Operator App.
/// Operators tap their name/ID to access their personal dashboard.

class WorkerSelectScreen extends StatelessWidget {
  const WorkerSelectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final firebase = FirebaseService();

    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 40),

            // ── Branding Header ──
            _buildBranding().animate().fadeIn(duration: 600.ms).slideY(begin: -0.1, end: 0),

            const SizedBox(height: 32),

            // ── Instruction ──
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 24),
              child: Text(
                'Select your operator profile to access your personal safety dashboard.',
                textAlign: TextAlign.center,
                style: TextStyle(color: AuraColors.textSecondary, fontSize: 14, height: 1.5),
              ),
            ).animate().fadeIn(duration: 600.ms, delay: 200.ms),

            const SizedBox(height: 24),

            // ── Worker Grid ──
            Expanded(
              child: StreamBuilder<DatabaseEvent>(
                stream: firebase.allWorkersStream,
                builder: (context, snapshot) {
                  if (snapshot.connectionState == ConnectionState.waiting) {
                    return const Center(child: CircularProgressIndicator(color: AuraColors.cyan));
                  }
                  if (!snapshot.hasData || snapshot.data!.snapshot.value == null) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.wifi_off_rounded, size: 48, color: AuraColors.textDim),
                          const SizedBox(height: 12),
                          const Text('Waiting for backend...', style: TextStyle(color: AuraColors.textSecondary)),
                          const SizedBox(height: 4),
                          const Text('Start the simulation engine first.', style: TextStyle(color: AuraColors.textDim, fontSize: 12)),
                        ],
                      ),
                    );
                  }

                  final data = snapshot.data!.snapshot.value as Map;
                  final workers = data.entries
                      .map((e) => WorkerData.fromMap(e.key.toString(), e.value as Map))
                      .toList();
                  workers.sort((a, b) => a.workerId.compareTo(b.workerId));

                  return GridView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      mainAxisSpacing: 12,
                      crossAxisSpacing: 12,
                      childAspectRatio: 1.3,
                    ),
                    itemCount: workers.length,
                    itemBuilder: (context, index) {
                      return _WorkerTile(worker: workers[index])
                          .animate()
                          .fadeIn(duration: 400.ms, delay: (60 * index).ms)
                          .scale(begin: const Offset(0.95, 0.95), end: const Offset(1, 1), duration: 400.ms, delay: (60 * index).ms);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBranding() {
    return Column(
      children: [
        // Glowing dot
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: AuraColors.cyan.withValues(alpha: 0.1),
            border: Border.all(color: AuraColors.cyan.withValues(alpha: 0.3)),
            boxShadow: [
              BoxShadow(color: AuraColors.cyan.withValues(alpha: 0.15), blurRadius: 20, spreadRadius: 2),
            ],
          ),
          child: const Icon(Icons.person_pin_rounded, color: AuraColors.cyan, size: 24),
        ),
        const SizedBox(height: 16),
        RichText(
          text: const TextSpan(children: [
            TextSpan(text: 'Harmony', style: TextStyle(color: AuraColors.textPrimary, fontSize: 24, fontWeight: FontWeight.w700)),
            TextSpan(text: 'Aura', style: TextStyle(color: AuraColors.cyan, fontSize: 24, fontWeight: FontWeight.w700)),
          ]),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
          decoration: BoxDecoration(
            color: AuraColors.emerald.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: AuraColors.emerald.withValues(alpha: 0.3)),
          ),
          child: const Text(
            'OPERATOR',
            style: TextStyle(color: AuraColors.emerald, fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 1.5),
          ),
        ),
      ],
    );
  }
}

// ── Worker Selection Tile ──
class _WorkerTile extends StatelessWidget {
  final WorkerData worker;

  const _WorkerTile({required this.worker});

  Color get _statusColor {
    switch (worker.cisRiskLevel) {
      case 'Critical': return AuraColors.statusCritical;
      case 'Warning': return AuraColors.statusWarning;
      default: return AuraColors.statusSafe;
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = WorkerMappings.getWorkerName(worker.workerId);

    return GestureDetector(
      onTap: () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (_) => OperatorHomeScreen(workerId: worker.workerId),
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: AuraColors.bgCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: _statusColor.withValues(alpha: 0.2)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Avatar
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [_statusColor.withValues(alpha: 0.2), _statusColor.withValues(alpha: 0.05)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Center(
                  child: Text(
                    name.substring(0, 1),
                    style: TextStyle(color: _statusColor, fontWeight: FontWeight.w700, fontSize: 18),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              Text(
                name,
                style: const TextStyle(color: AuraColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                worker.workerId,
                style: const TextStyle(color: AuraColors.textDim, fontSize: 11),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
