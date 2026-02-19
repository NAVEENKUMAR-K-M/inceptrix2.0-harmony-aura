import 'package:flutter/material.dart';
import '../core/theme.dart';
import '../models/models.dart';

/// Environment Banner — Compact, premium widget showing real-time site conditions.
/// Displays ambient temperature, humidity, wind speed, and weather status.

class EnvironmentBanner extends StatelessWidget {
  final SiteEnvironmentData env;

  const EnvironmentBanner({super.key, required this.env});

  Color _tempColor(double t) {
    if (t >= 45) return AuraColors.statusCritical;
    if (t >= 38) return const Color(0xFFF97316);
    if (t >= 30) return AuraColors.statusWarning;
    return AuraColors.statusSafe;
  }

  Color _humColor(double h) {
    if (h >= 80) return AuraColors.statusCritical;
    if (h >= 65) return const Color(0xFFF97316);
    if (h >= 50) return const Color(0xFF3B82F6);
    return AuraColors.statusSafe;
  }

  IconData _weatherIcon(String w) {
    switch (w) {
      case 'Heatwave': return Icons.local_fire_department_rounded;
      case 'Rain': return Icons.water_drop_rounded;
      case 'Overcast': return Icons.cloud_rounded;
      default: return Icons.wb_sunny_rounded;
    }
  }

  Color _weatherColor(String w) {
    switch (w) {
      case 'Heatwave': return const Color(0xFFF97316);
      case 'Rain': return const Color(0xFF60A5FA);
      case 'Overcast': return const Color(0xFF94A3B8);
      default: return const Color(0xFFFACC15);
    }
  }

  @override
  Widget build(BuildContext context) {
    final tc = _tempColor(env.ambientTemp);
    final hc = _humColor(env.humidity);
    final wIcon = _weatherIcon(env.weather);
    final wColor = _weatherColor(env.weather);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AuraColors.bgCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AuraColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──
          Row(
            children: [
              Container(
                width: 6, height: 6,
                decoration: BoxDecoration(color: wColor, shape: BoxShape.circle),
              ),
              const SizedBox(width: 8),
              const Text(
                'SITE ENVIRONMENT',
                style: TextStyle(
                  color: AuraColors.textDim,
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 1.2,
                ),
              ),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: wColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: wColor.withValues(alpha: 0.25)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(wIcon, size: 12, color: wColor),
                    const SizedBox(width: 4),
                    Text(
                      env.weather,
                      style: TextStyle(
                        color: wColor,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          const SizedBox(height: 12),

          // ── Metrics Row ──
          Row(
            children: [
              _EnvMetric(
                icon: Icons.thermostat_rounded,
                label: 'AMBIENT',
                value: '${env.ambientTemp.toStringAsFixed(1)}°C',
                color: tc,
                progress: ((env.ambientTemp - 18) / 34).clamp(0.0, 1.0),
              ),
              const SizedBox(width: 10),
              _EnvMetric(
                icon: Icons.water_drop_outlined,
                label: 'HUMIDITY',
                value: '${env.humidity.toStringAsFixed(0)}%',
                color: hc,
                progress: (env.humidity / 100).clamp(0.0, 1.0),
              ),
              const SizedBox(width: 10),
              _EnvMetric(
                icon: Icons.air_rounded,
                label: 'WIND',
                value: '${env.windSpeed.toStringAsFixed(0)} km/h',
                color: const Color(0xFF38BDF8),
                progress: (env.windSpeed / 40).clamp(0.0, 1.0),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Individual Environment Metric ──
class _EnvMetric extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final double progress;

  const _EnvMetric({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: color.withValues(alpha: 0.12)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Icon(icon, size: 14, color: color.withValues(alpha: 0.7)),
            const SizedBox(height: 6),
            Text(
              value,
              style: TextStyle(
                color: color,
                fontSize: 16,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                color: AuraColors.textDim,
                fontSize: 8,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.5,
              ),
            ),
            const SizedBox(height: 6),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: AuraColors.border,
                valueColor: AlwaysStoppedAnimation<Color>(color),
                minHeight: 3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
