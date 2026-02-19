import 'package:flutter/material.dart';
import 'package:firebase_database/firebase_database.dart';
import '../core/theme.dart';
import '../models/models.dart';
import '../services/firebase_service.dart';
import '../widgets/worker_card.dart';
import '../widgets/environment_banner.dart';
import 'workforce_screen.dart';
import 'machines_screen.dart';
import 'alerts_screen.dart';

/// Main app shell — Navigation hub with bottom tabs.
/// Hosts Overview, Workforce, Machines, and Alerts screens.

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    _OverviewTab(),
    WorkforceScreen(),
    MachinesScreen(),
    AlertsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AuraColors.bgSurface,
          border: Border(top: BorderSide(color: AuraColors.border, width: 1)),
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (i) => setState(() => _currentIndex = i),
          backgroundColor: Colors.transparent,
          elevation: 0,
          selectedItemColor: AuraColors.cyan,
          unselectedItemColor: AuraColors.textDim,
          selectedFontSize: 11,
          unselectedFontSize: 11,
          type: BottomNavigationBarType.fixed,
          items: const [
            BottomNavigationBarItem(icon: Icon(Icons.dashboard_rounded), label: 'Overview'),
            BottomNavigationBarItem(icon: Icon(Icons.people_rounded), label: 'Workforce'),
            BottomNavigationBarItem(icon: Icon(Icons.precision_manufacturing_rounded), label: 'Machines'),
            BottomNavigationBarItem(icon: Icon(Icons.notifications_rounded), label: 'Alerts'),
          ],
        ),
      ),
    );
  }
}

// ════════════════════════════════════════════════════════════════
// Overview Tab (the original dashboard content, now isolated)
// ════════════════════════════════════════════════════════════════

class _OverviewTab extends StatefulWidget {
  const _OverviewTab();

  @override
  State<_OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<_OverviewTab> {
  final FirebaseService _firebase = FirebaseService();
  String _filter = 'All';
  bool _riskSimActive = false;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          _buildHeader(),
          _buildEnvironmentBanner(),
          _buildFilterBar(),
          Expanded(child: _buildWorkerList()),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 12),
      decoration: const BoxDecoration(
        color: AuraColors.bgSurface,
        border: Border(bottom: BorderSide(color: AuraColors.border, width: 1)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // Logo
              Row(
                children: [
                  Container(
                    width: 8, height: 8,
                    decoration: const BoxDecoration(color: AuraColors.cyan, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  RichText(
                    text: const TextSpan(children: [
                      TextSpan(text: 'Harmony', style: TextStyle(color: AuraColors.textPrimary, fontSize: 20, fontWeight: FontWeight.w700)),
                      TextSpan(text: 'Aura', style: TextStyle(color: AuraColors.cyan, fontSize: 20, fontWeight: FontWeight.w700)),
                    ]),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AuraColors.cyan.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Text('MOBILE', style: TextStyle(color: AuraColors.cyan, fontSize: 9, fontWeight: FontWeight.w700, letterSpacing: 1.2)),
                  ),
                ],
              ),
              // Risk Sim Toggle
              StreamBuilder<DatabaseEvent>(
                stream: _firebase.escalationStream,
                builder: (context, snapshot) {
                  if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
                    final data = snapshot.data!.snapshot.value as Map?;
                    _riskSimActive = data?['escalation_trigger'] == true;
                  }
                  return Row(
                    children: [
                      Text(
                        _riskSimActive ? 'RISK SIM' : 'RISK SIM OFF',
                        style: TextStyle(
                          color: _riskSimActive ? AuraColors.red : AuraColors.textDim,
                          fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(width: 8),
                      SizedBox(
                        height: 24,
                        child: Switch(
                          value: _riskSimActive,
                          onChanged: (val) => _firebase.toggleEscalation(val),
                          activeThumbColor: AuraColors.red,
                          activeTrackColor: AuraColors.red.withValues(alpha: 0.3),
                          inactiveThumbColor: AuraColors.textDim,
                          inactiveTrackColor: AuraColors.border,
                        ),
                      ),
                    ],
                  );
                },
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text('One-View Overwatch', style: TextStyle(color: AuraColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Widget _buildEnvironmentBanner() {
    return StreamBuilder<DatabaseEvent>(
      stream: _firebase.environmentStream,
      builder: (context, snapshot) {
        SiteEnvironmentData env = SiteEnvironmentData.defaults();
        if (snapshot.hasData && snapshot.data!.snapshot.value != null) {
          env = SiteEnvironmentData.fromMap(
            snapshot.data!.snapshot.value as Map,
          );
        }
        return EnvironmentBanner(env: env);
      },
    );
  }

  Widget _buildFilterBar() {
    return Container(
      height: 48,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      color: AuraColors.bgSurface,
      child: StreamBuilder<DatabaseEvent>(
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
          return Row(
            children: [
              _FilterChip('All', total, AuraColors.cyan, _filter == 'All', () => setState(() => _filter = 'All')),
              _FilterChip('Critical', critical, AuraColors.statusCritical, _filter == 'Critical', () => setState(() => _filter = 'Critical')),
              _FilterChip('Warning', warning, AuraColors.statusWarning, _filter == 'Warning', () => setState(() => _filter = 'Warning')),
              _FilterChip('Safe', safe, AuraColors.statusSafe, _filter == 'Safe', () => setState(() => _filter = 'Safe')),
            ],
          );
        },
      ),
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
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.wifi_off_rounded, size: 48, color: AuraColors.textDim),
                const SizedBox(height: 12),
                const Text('Waiting for telemetry data...', style: TextStyle(color: AuraColors.textSecondary)),
                const SizedBox(height: 4),
                const Text('Ensure the backend simulation is running.', style: TextStyle(color: AuraColors.textDim, fontSize: 12)),
              ],
            ),
          );
        }

        final data = snapshot.data!.snapshot.value as Map;
        List<WorkerData> workers = data.entries
            .map((e) => WorkerData.fromMap(e.key.toString(), e.value as Map))
            .toList();

        workers.sort((a, b) {
          const order = {'Critical': 0, 'Warning': 1, 'Safe': 2};
          return (order[a.cisRiskLevel] ?? 2).compareTo(order[b.cisRiskLevel] ?? 2);
        });

        if (_filter != 'All') {
          workers = workers.where((w) => w.cisRiskLevel == _filter).toList();
        }

        return ListView.builder(
          padding: const EdgeInsets.only(top: 8, bottom: 16),
          itemCount: workers.length,
          itemBuilder: (context, index) => WorkerCard(worker: workers[index], index: index),
        );
      },
    );
  }
}

// ── Filter Chip ──
class _FilterChip extends StatelessWidget {
  final String label;
  final int count;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip(this.label, this.count, this.color, this.selected, this.onTap);

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
