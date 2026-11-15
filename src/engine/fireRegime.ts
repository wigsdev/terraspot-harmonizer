/**
 * Fire Regime Diagnostic Transformation Engine.
 * Adheres to docs/02-modis-viirs-harmonization-methodology.md Section 6
 * and specs/008-fire-regime-classifier/spec.md.
 */

import type { HarmonizedMonthlyRecord, FireRegimeClass } from '../types/harmonization';
import type {
  FireRegimePoint,
  FireRegimeScatterData,
  FireRegimeDistribution,
  FireRegimeMitigationPackage,
  AlertLevel,
  OperationalAgencyAdvice
} from '../types/regime';
import type { Language } from '../types/language';

const DEFAULT_MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DEFAULT_MONTH_NAMES_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

/**
 * Classifies a monthly observation into one of the three scientific quadrants
 * if regime_class is not already assigned.
 */
export function classifyRegime(
  meanFrp: number,
  nightFraction: number,
  regimeIndex: number
): FireRegimeClass {
  if (meanFrp > 45 || nightFraction > 0.20 || regimeIndex >= 65) {
    return 'SEVERE_WILDFIRE';
  }
  if (meanFrp >= 25 || nightFraction >= 0.10 || regimeIndex >= 35) {
    return 'TRANSITIONAL';
  }
  return 'AGRICULTURAL_BURN';
}

/**
 * Filter to exclude zero-fire months and unobserved future records.
 */
export function isActiveFireMonth(record: HarmonizedMonthlyRecord): boolean {
  // Exclude future incomplete months in 2026 (Nov-Dec)
  if (record.year === 2026 && record.month > 10) {
    return false;
  }
  // Exclude months with zero detected fires
  if (record.harmonized_hotspots === 0 && record.mean_frp_mw === 0 && record.night_fraction === 0) {
    return false;
  }
  return true;
}

/**
 * Transforms monthly records into Recharts 2D scatter plot series.
 */
export function generateFireRegimeScatterData(
  records: HarmonizedMonthlyRecord[],
  activeYear?: number,
  language: Language = 'en'
): FireRegimeScatterData {
  const monthNames = language === 'es' ? DEFAULT_MONTH_NAMES_ES : DEFAULT_MONTH_NAMES_EN;
  const activeRecords = records.filter(isActiveFireMonth);

  const agricultural: FireRegimePoint[] = [];
  const transitional: FireRegimePoint[] = [];
  const severeWildfire: FireRegimePoint[] = [];
  const activeYearPoints: FireRegimePoint[] = [];

  let maxFrp = 0;
  let maxNightFraction = 0;

  for (const record of activeRecords) {
    const regimeClass = record.regime_class ?? classifyRegime(
      record.mean_frp_mw,
      record.night_fraction,
      record.fire_regime_index
    );

    const point: FireRegimePoint = {
      x: Number((record.mean_frp_mw || 0).toFixed(2)),
      y: Number((record.night_fraction || 0).toFixed(3)),
      z: record.harmonized_hotspots || 1,
      year: record.year,
      month: record.month,
      monthName: monthNames[record.month - 1] ?? `M${record.month}`,
      mean_frp_mw: record.mean_frp_mw || 0,
      p90_frp_mw: record.p90_frp_mw || 0,
      night_fraction: record.night_fraction || 0,
      fire_regime_index: record.fire_regime_index || 0,
      regime_class: regimeClass,
      isActiveYear: activeYear !== undefined && record.year === activeYear
    };

    if (point.x > maxFrp) maxFrp = point.x;
    if (point.y > maxNightFraction) maxNightFraction = point.y;

    if (regimeClass === 'SEVERE_WILDFIRE') {
      severeWildfire.push(point);
    } else if (regimeClass === 'TRANSITIONAL') {
      transitional.push(point);
    } else {
      agricultural.push(point);
    }

    if (point.isActiveYear) {
      activeYearPoints.push(point);
    }
  }

  return {
    agricultural,
    transitional,
    severeWildfire,
    activeYearPoints,
    maxFrp,
    maxNightFraction
  };
}

/**
 * Computes historical distribution percentages for the selected AOI.
 */
export function computeFireRegimeDistribution(
  records: HarmonizedMonthlyRecord[]
): FireRegimeDistribution {
  const activeRecords = records.filter(isActiveFireMonth);
  const totalActiveMonths = activeRecords.length;

  if (totalActiveMonths === 0) {
    return {
      totalActiveMonths: 0,
      agriculturalCount: 0,
      agriculturalPct: 0,
      transitionalCount: 0,
      transitionalPct: 0,
      severeWildfireCount: 0,
      severeWildfirePct: 0,
      dominantRegime: 'AGRICULTURAL_BURN',
      meanRegimeIndex: 0
    };
  }

  let agriculturalCount = 0;
  let transitionalCount = 0;
  let severeWildfireCount = 0;
  let totalIndex = 0;

  for (const record of activeRecords) {
    const regimeClass = record.regime_class ?? classifyRegime(
      record.mean_frp_mw,
      record.night_fraction,
      record.fire_regime_index
    );

    if (regimeClass === 'SEVERE_WILDFIRE') {
      severeWildfireCount++;
    } else if (regimeClass === 'TRANSITIONAL') {
      transitionalCount++;
    } else {
      agriculturalCount++;
    }

    totalIndex += record.fire_regime_index || 0;
  }

  const agriculturalPct = Number(((agriculturalCount / totalActiveMonths) * 100).toFixed(1));
  const transitionalPct = Number(((transitionalCount / totalActiveMonths) * 100).toFixed(1));
  const severeWildfirePct = Number(((severeWildfireCount / totalActiveMonths) * 100).toFixed(1));
  const meanRegimeIndex = Number((totalIndex / totalActiveMonths).toFixed(1));

  let dominantRegime: FireRegimeClass = 'AGRICULTURAL_BURN';
  if (severeWildfireCount >= transitionalCount && severeWildfireCount >= agriculturalCount) {
    dominantRegime = 'SEVERE_WILDFIRE';
  } else if (transitionalCount >= agriculturalCount) {
    dominantRegime = 'TRANSITIONAL';
  }

  return {
    totalActiveMonths,
    agriculturalCount,
    agriculturalPct,
    transitionalCount,
    transitionalPct,
    severeWildfireCount,
    severeWildfirePct,
    dominantRegime,
    meanRegimeIndex
  };
}

/**
 * Generates context-aware tactical mitigation recommendations for
 * Civil Defense, Park Rangers, and Agricultural Authorities.
 */
export function generateOperationalMitigation(
  records: HarmonizedMonthlyRecord[],
  activeYear?: number,
  language: Language = 'en'
): FireRegimeMitigationPackage {
  const isEs = language === 'es';
  const effectiveYear = activeYear ?? 2024;
  const yearRecords = records.filter(
    (r) => r.year === effectiveYear && isActiveFireMonth(r)
  );

  const evaluationRecords = yearRecords.length > 0 ? yearRecords : records.filter(isActiveFireMonth);

  let peakRegime: FireRegimeClass = 'AGRICULTURAL_BURN';
  let peakRegimeIndex = 0;

  for (const r of evaluationRecords) {
    const idx = r.fire_regime_index || 0;
    if (idx > peakRegimeIndex) peakRegimeIndex = idx;

    const cls = r.regime_class ?? classifyRegime(r.mean_frp_mw, r.night_fraction, idx);
    if (cls === 'SEVERE_WILDFIRE') {
      peakRegime = 'SEVERE_WILDFIRE';
    } else if (cls === 'TRANSITIONAL' && peakRegime !== 'SEVERE_WILDFIRE') {
      peakRegime = 'TRANSITIONAL';
    }
  }

  let postureLevel: AlertLevel = 'ADVISORY';
  if (peakRegime === 'SEVERE_WILDFIRE' || peakRegimeIndex >= 65) {
    postureLevel = 'EMERGENCY';
  } else if (peakRegime === 'TRANSITIONAL' || peakRegimeIndex >= 35) {
    postureLevel = 'WARNING';
  }

  const agencies: OperationalAgencyAdvice[] = [
    {
      agencyId: 'civil_defense',
      agencyName: isEs ? 'Defensa Civil / Respuesta de Emergencia' : 'Civil Defense & Emergency Response',
      alertLevel: postureLevel,
      headline: isEs
        ? postureLevel === 'EMERGENCY'
          ? 'Activación de Emergencia Nivel 3: Alerta Máxima por Incendios de Copa'
          : postureLevel === 'WARNING'
          ? 'Alerta Amarilla: Monitoreo Reforzado por Riesgo de Escape'
          : 'Condición Normal: Supervisión Preventiva de Temporada Seca'
        : postureLevel === 'EMERGENCY'
        ? 'Level 3 Emergency Mobilization: Severe Crown Wildfire Threat'
        : postureLevel === 'WARNING'
        ? 'Yellow Advisory: Heightened Surveillance for Fire Escapes'
        : 'Routine Readiness: Dry Season Preventive Surveillance',
      actionItems: isEs
        ? postureLevel === 'EMERGENCY'
          ? [
              'Preposicionar brigadas forestales y cisternas de agua en la interfaz urbano-forestal (IUF).',
              'Activar protocolos del Centro de Operaciones de Emergencia (COEN) y enlace de apoyo aéreo.',
              'Emitir alertas tempranas de evacuación preventiva a comunidades rurales en sotavento.'
            ]
          : postureLevel === 'WARNING'
          ? [
              'Supervisar zonas de amortiguamiento y verificar operatividad de cuadrillas municipales.',
              'Restringir temporalmente permisos de quema a cielo abierto durante ráfagas de viento > 20 km/h.',
              'Monitorear reportes de humo diurno con patrullas de primera respuesta en terreno.'
            ]
          : [
              'Mantener inventario de herramientas forestales y fuentes hídricas rurales actualizado.',
              'Coordinar talleres comunitarios de prevención y notificación inmediata de focos.',
              'Monitorear índices meteorológicos de peligro de fuego (FWI) semanalmente.'
            ]
        : postureLevel === 'EMERGENCY'
        ? [
              'Pre-position tactical forest fire brigades and high-capacity water tenders near WUI zones.',
              'Activate National Emergency Operations Center (EOC) and request aerial water bomber readiness.',
              'Issue pre-evacuation advisories and clear escape corridors for downwind agrarian communities.'
            ]
        : postureLevel === 'WARNING'
        ? [
              'Conduct ground patrols along agrarian-forest margins and inspect fire containment lines.',
              'Enforce provisional burning permit holds during wind advisories (> 20 km/h).',
              'Establish rapid-dispatch reconnaissance teams for immediate smoke investigation.'
            ]
        : [
              'Maintain readiness rosters and verify municipal firefighting equipment inventories.',
              'Conduct rural community briefing sessions on safe agricultural fire containment.',
              'Track multi-day Fire Weather Index (FWI) forecasts across regional dispatch zones.'
            ]
    },
    {
      agencyId: 'park_rangers',
      agencyName: isEs ? 'Guardaparques & Unidades de Conservación' : 'Park Rangers & Protected Areas (SERNANP)',
      alertLevel: postureLevel,
      headline: isEs
        ? postureLevel === 'EMERGENCY'
          ? 'Operativo Crítico: Defensa Perimetral de Áreas Naturales Protegidas'
          : postureLevel === 'WARNING'
          ? 'Vigilancia Activa de Zonas de Amortiguamiento'
          : 'Patrullaje Preventivo y Mantenimiento de Cortafuegos'
        : postureLevel === 'EMERGENCY'
        ? 'Critical Operations: Protected Reserve Perimeter Defense'
        : postureLevel === 'WARNING'
        ? 'Active Patrols across Buffer Zone Boundaries'
        : 'Routine Buffer Patrols & Firebreak Maintenance',
      actionItems: isEs
        ? postureLevel === 'EMERGENCY'
          ? [
              'Desplegar drones con cámaras térmicas para rastreo nocturno de focos de calor activos.',
              'Cerrar inmediatamente senderos turísticos y accesos a zonas intangibles de reserva.',
              'Ejecutar líneas de defensa y contrafuegos tácticos supervisados por técnicos certificados.'
            ]
          : postureLevel === 'WARNING'
          ? [
              'Intensificar patrullajes motorizados y a pie a lo largo del límite del parque.',
              'Verificar el despeje de brechas cortafuego perimetrales (ancho mínimo 5 metros).',
              'Coordinar con las comunidades campesinas colindantes sobre quemas programadas.'
            ]
          : [
              'Realizar inspección periódica de mojones limítrofes y señalización preventiva.',
              'Monitorear la humedad del combustible fino en parcelas de muestreo forestal.',
              'Promover programas de guardaparques voluntarios comunitarios en caseríos vecinos.'
            ]
        : postureLevel === 'EMERGENCY'
        ? [
              'Deploy thermal-imaging UAV drones for overnight monitoring of active crown fire perimeters.',
              'Enforce immediate closure of protected reserve trails and evacuate recreational visitors.',
              'Construct secondary bulldozer lines and execute controlled tactical backburns.'
            ]
        : postureLevel === 'WARNING'
        ? [
              'Increase ranger patrol frequency along boundaries adjacent to agricultural settlements.',
              'Verify clearing of 5-meter boundary firebreaks and remove dry fuel accumulations.',
              'Coordinate with buffer-zone farmer associations regarding prescribed burning schedules.'
            ]
        : [
              'Inspect boundary marker firebreaks and install standardized warning signage.',
              'Collect weekly fuel moisture samples across permanent forest monitoring plots.',
              'Conduct collaborative wildland stewardship workshops with local community leaders.'
            ]
    },
    {
      agencyId: 'agricultural',
      agencyName: isEs ? 'Autoridades Agrarias & Extensión Rural' : 'Agricultural & Agrarian Extension Authorities',
      alertLevel: postureLevel,
      headline: isEs
        ? postureLevel === 'EMERGENCY'
          ? 'Prohibición Total de Quemas y Sanciones Administrativas'
          : postureLevel === 'WARNING'
          ? 'Restricción Horaria Estricta de Quemas de Rastrojos'
          : 'Calendario Agrícola y Promoción de Manejo Sostenible de Residuos'
        : postureLevel === 'EMERGENCY'
        ? 'Total Agricultural Burning Moratorium & Strict Sanctions'
        : postureLevel === 'WARNING'
        ? 'Restricted Burn Windows & Mandatory Farmer Escorts'
        : 'Scheduled Burning Windows & Stubble Management Best Practices',
      actionItems: isEs
        ? postureLevel === 'EMERGENCY'
          ? [
              'Decretar veda absoluta de quemas agrícolas y rozas en toda la jurisdicción provincial.',
              'Inspeccionar predios denunciados y aplicar multas severas por desacato a la prohibición.',
              'Activar asistencia técnica y fondos de emergencia para productores con pérdidas de cultivo.'
            ]
          : postureLevel === 'WARNING'
          ? [
              'Limitar quemas autorizadas exclusivamente a la ventana diurna de 10:00 a 14:00 horas.',
              'Exigir zanjas cortafuego obligatorias de 3 metros alrededor de cada parcela antes de quemar.',
              'Suspender automáticamente permisos si la humedad relativa desciende del 30%.'
            ]
          : [
              'Capacitar a comités de regantes en triturado e incorporación mecánica de rastrojos al suelo.',
              'Administrar el calendario de quemas rotativas para evitar acumulación de humo.',
              'Fomentar la elaboración de compostaje y abonos orgánicos a partir de biomasa de cosecha.'
            ]
        : postureLevel === 'EMERGENCY'
        ? [
              'Enforce comprehensive provincial burn bans with zero exceptions for agrarian clearing.',
              'Deploy enforcement officers to investigate unpermitted field fires and levy penalties.',
              'Mobilize agricultural relief funds for smallholders impacted by crop damage.'
            ]
        : postureLevel === 'WARNING'
        ? [
              'Restrict burning strictly to morning hours (10:00–14:00) with required adjacent water reserves.',
              'Mandate minimum 3-meter perimeter disked firebreaks around all burn plots.',
              'Automatically void burning permits whenever relative humidity drops below 30%.'
            ]
        : [
              'Deliver technical extension on mechanical residue shredding and mulch incorporation.',
              'Coordinate agrarian burning calendar rotations to prevent valley smoke inversion.',
              'Incentivize agricultural waste composting as an alternative to slash-and-burn cycles.'
            ]
    }
  ];

  return {
    postureLevel,
    activeYear: effectiveYear,
    peakRegime,
    peakRegimeIndex,
    agencies
  };
}
