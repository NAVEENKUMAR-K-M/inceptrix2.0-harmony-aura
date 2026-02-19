import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';
import 'worker_detail_screen.dart';

/// Workforce Screen — Detailed personnel management view.
/// Shows all workers with search, category filters, and tap-to-detail navigation.

class WorkforceScreen extends StatefulWidget {
  const WorkforceScreen({super.key});

  @override
  State<WorkforceScreen> createState() => _WorkforceScreenState();
}

class _WorkforceScreenState extends State<WorkforceScreen> {
  final FirebaseService _firebase = FirebaseService();
  final TextEditingController _searchController = TextEditingController();
  String _searchQuery = '';
  String _filter = 'All';

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: SafeArea(
        child: Column(
          children: [
            _buildHeader(),
            _buildSearchBar(),
            _buildCategoryBar(),
            Expanded(child: _buildWorkerList()),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
      decoration: const BoxDecoration(
        color: AuraColors.bgSurface,
        border: Border(bottom: BorderSide(color: AuraColors.border)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AuraColors.cyan.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.people_rounded, color: AuraColors.cyan, size: 20),
          ),
          const SizedBox(width: 12),
          const Text(
            'Workforce Monitor',
            style: TextStyle(
              color: AuraColors.textPrimary,
              fontSize: 20,
              fontWeight: FontWeight.w700,
            ),
          ),
          const Spacer(),
          // Live count badge
          StreamBuilder<DatabaseEvent>(
            stream: _firebase.workersStream,
            builder: (context, snapshot) {
              int count = 0;
              if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
                count = (snapshot.data!.snapshot.value as Map).length;
              }
              return Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: AuraColors.cyan.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$count ACTIVE',
                  style: const TextStyle(
                    color: AuraColors.cyan,
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

  Widget _buildSearchBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      color: AuraColors.bgSurface,
      child: Container(
        height: 40,
        decoration: BoxDecoration(
          color: AuraColors.bgDeep,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: AuraColors.border),
        ),
        child: TextField(
          controller: _searchController,
          onChanged: (val) => setState(() => _searchQuery = val.toLowerCase()),
          style: const TextStyle(color: AuraColors.textPrimary, fontSize: 14),
          decoration: const InputDecoration(
            hintText: 'Search by name or ID...',
            hintStyle: TextStyle(color: AuraColors.textDim, fontSize: 13),
            prefixIcon: Icon(Icons.search_rounded, color: AuraColors.textDim, size: 18),
            border: InputBorder.none,
            contentPadding: EdgeInsets.symmetric(vertical: 10),
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryBar() {
    return StreamBuilder<DatabaseEvent>(
      stream: _firebase.workersStream,
      builder: (context, snapshot) {
        int total = 0, critical = 0, warning = 0, safe = 0;
        if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
          final data = snapshot.data!.snapshot.value as Map;
          total = data.length;
          data.forEach((_, val) {
            final risk = val['cis_risk_level'] ?? 'Safe';
            if (risk == 'Critical') critical++;
            else if (risk == 'Warning') warning++;
            else safe++;
          });
        }
        return Container(
          height: 48,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          decoration: const BoxDecoration(
            color: AuraColors.bgSurface,
            border: Border(bottom: BorderSide(color: AuraColors.border)),
          ),
          child: Row(
            children: [
              _CategoryChip('All', total, AuraColors.cyan, _filter == 'All', () => setState(() => _filter = 'All')),
              _CategoryChip('Critical', critical, AuraColors.statusCritical, _filter == 'Critical', () => setState(() => _filter = 'Critical')),
              _CategoryChip('Warning', warning, AuraColors.statusWarning, _filter == 'Warning', () => setState(() => _filter = 'Warning')),
              _CategoryChip('Safe', safe, AuraColors.statusSafe, _filter == 'Safe', () => setState(() => _filter = 'Safe')),
            ],
          ),
        );
      },
    );
  }

  Widget _buildWorkerList() {
    return StreamBuilder<DatabaseEvent>(
      stream: _firebase.workersStream,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator(color: AuraColors.cyan));
        }
        if (!snapshot.hasData || snapshot.data!.snapshot.value == null) {
          return _buildEmptyState();
        }

        final data = snapshot.data!.snapshot.value as Map;
        List<WorkerData> workers = data.entries
            .map((e) => WorkerData.fromMap(e.key.toString(), e.value as Map))
            .toList();

        // Sort: Critical → Warning → Safe
        workers.sort((a, b) {
          const order = {'Critical': 0, 'Warning': 1, 'Safe': 2};
          return (order[a.cisRiskLevel] ?? 2).compareTo(order[b.cisRiskLevel] ?? 2);
        });

        // Apply filter
        if (_filter != 'All') {
          workers = workers.where((w) => w.cisRiskLevel == _filter).toList();
        }

        // Apply search
        if (_searchQuery.isNotEmpty) {
          workers = workers.where((w) {
            final name = WorkerMappings.getWorkerName(w.workerId).toLowerCase();
            return name.contains(_searchQuery) || w.workerId.toLowerCase().contains(_searchQuery);
          }).toList();
        }

        if (workers.isEmpty) {
          return _buildEmptyState(message: 'No workers match your criteria.');
        }

        return ListView.builder(
          padding: const EdgeInsets.only(top: 8, bottom: 16),
          itemCount: workers.length,
          itemBuilder: (context, index) {
            final w = workers[index];
            return _WorkforceDetailTile(worker: w, index: index)
                .animate()
                .fadeIn(duration: 300.ms, delay: (50 * index).ms)
                .slideX(begin: 0.05, end: 0, duration: 300.ms, delay: (50 * index).ms);
          },
        );
      },
    );
  }

  Widget _buildEmptyState({String message = 'Waiting for telemetry data...'}) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.groups_rounded, size: 48, color: AuraColors.textDim),
          const SizedBox(height: 12),
          Text(message, style: const TextStyle(color: AuraColors.textSecondary)),
        ],
      ),
    );
  }
}

// ── Workforce Detail Tile ──
class _WorkforceDetailTile extends StatelessWidget {
  final WorkerData worker;
  final int index;

  const _WorkforceDetailTile({required this.worker, required this.index});

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
    final machine = WorkerMappings.getMachineName(worker.assignedMachine);

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => WorkerDetailScreen(workerId: worker.workerId),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 5),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AuraColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: _statusColor.withValues(alpha: worker.isSafe ? 0.1 : 0.4),
          ),
          boxShadow: worker.isCritical
              ? [BoxShadow(color: _statusColor.withValues(alpha: 0.1), blurRadius: 10)]
              : [],
        ),
        child: Row(
          children: [
            // Avatar / Index badge
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
                  style: TextStyle(
                    color: _statusColor,
                    fontWeight: FontWeight.w700,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Name + Machine
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      color: AuraColors.textPrimary,
                      fontWeight: FontWeight.w600,
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    '📍 $machine',
                    style: const TextStyle(color: AuraColors.textDim, fontSize: 11),
                  ),
                ],
              ),
            ),

            // Metrics column
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.favorite_rounded, size: 12, color: Colors.redAccent.withValues(alpha: 0.8)),
                    const SizedBox(width: 4),
                    Text(
                      '${worker.heartRate} BPM',
                      style: const TextStyle(color: AuraColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w500),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: _statusColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    'CIS ${worker.cisScore.toStringAsFixed(2)}',
                    style: TextStyle(
                      color: _statusColor,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 8),
            Icon(Icons.chevron_right_rounded, color: AuraColors.textDim.withValues(alpha: 0.5), size: 20),
          ],
        ),
      ),
    );
  }
}

// ── Category Chip ──
class _CategoryChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _CategoryChip(this.label, this.count, this.color, this.selected, this.onTap);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? color.withValues(alpha: 0.15) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: selected ? color.withValues(alpha: 0.4) : AuraColors.border),
        ),
        child: Row(
          children: [
            Text(label, style: TextStyle(color: selected ? color : AuraColors.textDim, fontSize: 12, fontWeight: FontWeight.w600)),
            const SizedBox(width: 4),
            Text('$count', style: TextStyle(color: selected ? color : AuraColors.textDim, fontSize: 12, fontWeight: FontWeight.w700)),
          ],
        ),
      ),
    );
  }
}
