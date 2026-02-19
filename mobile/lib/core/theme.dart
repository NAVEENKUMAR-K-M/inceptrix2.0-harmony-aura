import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

/// Harmony Aura — Industrial Premium Design System
/// Dark industrial theme with cyan/emerald accents,
/// matching the web dashboard's aesthetic.

class AuraColors {
  AuraColors._();

  // ── Core Backgrounds ──
  static const Color bgDeep = Color(0xFF0A0E17);
  static const Color bgCard = Color(0xFF111827);
  static const Color bgCardHover = Color(0xFF1A2332);
  static const Color bgSurface = Color(0xFF0D1321);

  // ── Accent Colors ──
  static const Color cyan = Color(0xFF06D6A0);
  static const Color cyanDim = Color(0xFF0A8F6B);
  static const Color emerald = Color(0xFF34D399);
  static const Color amber = Color(0xFFFBBF24);
  static const Color red = Color(0xFFEF4444);
  static const Color redGlow = Color(0x40EF4444);

  // ── Text ──
  static const Color textPrimary = Color(0xFFF1F5F9);
  static const Color textSecondary = Color(0xFF94A3B8);
  static const Color textDim = Color(0xFF64748B);

  // ── Risk Status ──
  static const Color statusSafe = Color(0xFF22C55E);
  static const Color statusWarning = Color(0xFFFBBF24);
  static const Color statusCritical = Color(0xFFEF4444);

  // ── Borders ──
  static const Color border = Color(0xFF1E293B);
  static const Color borderGlow = Color(0xFF06D6A0);
}

class AuraTheme {
  AuraTheme._();

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AuraColors.bgDeep,
      primaryColor: AuraColors.cyan,
      colorScheme: const ColorScheme.dark(
        primary: AuraColors.cyan,
        secondary: AuraColors.emerald,
        surface: AuraColors.bgCard,
        error: AuraColors.red,
        onPrimary: AuraColors.bgDeep,
        onSecondary: AuraColors.bgDeep,
        onSurface: AuraColors.textPrimary,
        onError: Colors.white,
      ),
      textTheme: GoogleFonts.interTextTheme(
        const TextTheme(
          displayLarge: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.w700,
            color: AuraColors.textPrimary,
            letterSpacing: -0.5,
          ),
          displayMedium: TextStyle(
            fontSize: 22,
            fontWeight: FontWeight.w600,
            color: AuraColors.textPrimary,
          ),
          titleLarge: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            color: AuraColors.textPrimary,
          ),
          titleMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AuraColors.textSecondary,
          ),
          bodyLarge: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w400,
            color: AuraColors.textPrimary,
          ),
          bodyMedium: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: AuraColors.textSecondary,
          ),
          labelLarge: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: AuraColors.cyan,
            letterSpacing: 0.8,
          ),
          labelSmall: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w500,
            color: AuraColors.textDim,
            letterSpacing: 0.5,
          ),
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: AuraColors.bgSurface,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: GoogleFonts.inter(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: AuraColors.textPrimary,
        ),
        iconTheme: const IconThemeData(color: AuraColors.cyan),
      ),
      cardTheme: CardThemeData(
        color: AuraColors.bgCard,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: AuraColors.border, width: 1),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: AuraColors.bgSurface,
        selectedItemColor: AuraColors.cyan,
        unselectedItemColor: AuraColors.textDim,
        type: BottomNavigationBarType.fixed,
        elevation: 0,
      ),
    );
  }
}
