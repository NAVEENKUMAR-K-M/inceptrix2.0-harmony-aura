import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme.dart';
import 'firebase_options.dart';
import 'screens/dashboard_screen.dart';

/// Harmony Aura Mobile — Supervisor App
/// Entry point: initializes Firebase then launches the premium dashboard.

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock to portrait for optimal dashboard layout
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
  ]);

  // System UI overlay style (dark status bar)
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: AuraColors.bgSurface,
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const HarmonyAuraApp());
}

class HarmonyAuraApp extends StatelessWidget {
  const HarmonyAuraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Harmony Aura',
      debugShowCheckedModeBanner: false,
      theme: AuraTheme.darkTheme,
      home: const DashboardScreen(),
    );
  }
}
