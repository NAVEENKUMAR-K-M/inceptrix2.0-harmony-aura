import 'package:flutter/material.dart';
import '../core/theme.dart';
import 'vitals_screen.dart';
import 'machine_detail_screen.dart';
import 'worker_select_screen.dart';

/// Operator Home Screen — Two-tab navigation shell.
/// Hosts "My Vitals" and "My Machine" tabs for the selected worker.

class OperatorHomeScreen extends StatefulWidget {
  final String workerId;
  const OperatorHomeScreen({super.key, required this.workerId});

  @override
  State<OperatorHomeScreen> createState() => _OperatorHomeScreenState();
}

class _OperatorHomeScreenState extends State<OperatorHomeScreen> {
  int _currentIndex = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      VitalsScreen(workerId: widget.workerId),
      MachineDetailScreen(workerId: widget.workerId),
    ];

    return Scaffold(
      backgroundColor: AuraColors.bgDeep,
      body: IndexedStack(index: _currentIndex, children: screens),
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
            BottomNavigationBarItem(icon: Icon(Icons.favorite_rounded), label: 'My Vitals'),
            BottomNavigationBarItem(icon: Icon(Icons.precision_manufacturing_rounded), label: 'My Machine'),
          ],
        ),
      ),
      // Logout FAB
      floatingActionButton: FloatingActionButton.small(
        backgroundColor: AuraColors.bgCard,
        foregroundColor: AuraColors.textDim,
        elevation: 2,
        onPressed: () {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (_) => const WorkerSelectScreen()),
          );
        },
        child: const Icon(Icons.swap_horiz_rounded, size: 20),
      ),
    );
  }
}
