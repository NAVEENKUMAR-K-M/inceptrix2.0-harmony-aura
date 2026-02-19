import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Aura Design System — Industrial Premium Dark Theme
/// Consistent with the Supervisor app for brand unity.

class AuraColors {
  static const Color bgDeep = Color(0xFF0A0E17);
  static const Color bgSurface = Color(0xFF111827);
  static const Color bgCard = Color(0xFF1A2332);
  static const Color border = Color(0xFF2A3444);

  static const Color cyan = Color(0xFF06B6D4);
  static const Color emerald = Color(0xFF10B981);
  static const Color amber = Color(0xFFF59E0B);
  static const Color red = Color(0xFFEF4444);

  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textDim = Color(0xFF64748B);

  static const Color statusCritical = Color(0xFFEF4444);
  static const Color statusWarning = Color(0xFFF59E0B);
  static const Color statusSafe = Color(0xFF10B981);
}

class AuraTheme {
  static ThemeData get dark {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AuraColors.bgDeep,
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
      colorScheme: const ColorScheme.dark(
        primary: AuraColors.cyan,
        surface: AuraColors.bgSurface,
      ),
    );
  }
}
