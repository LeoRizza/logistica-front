import { Trip, CreateTripRequest } from '../types/index';

/**
 * Verifica si un campo tiene un valor significativo
 * Considera vacío: null, undefined, string vacío, 0 para números
 */
const hasValue = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return value > 0;
  return true;
};

/**
 * Lista de los 11 campos importantes para completitud documental
 */
export const IMPORTANT_FIELDS = [
  'origin',
  'destination',
  'scheduled_date',
  'actual_start_date',
  'actual_end_date',
  'distance_km',
  'estimated_cost',
  'loaded_weight_kg',
  'net_weight_kg',
  'invoice_number',
  'rate_per_kg',
] as const;

export type ImportantField = typeof IMPORTANT_FIELDS[number];

/**
 * Mapeo de campos a nombres en español
 */
export const FIELD_LABELS: Record<ImportantField, string> = {
  origin: 'Origen',
  destination: 'Destino',
  scheduled_date: 'Fecha Programada',
  actual_start_date: 'Fecha de Inicio Real',
  actual_end_date: 'Fecha de Fin Real',
  distance_km: 'Distancia en km',
  estimated_cost: 'Costo Estimado',
  loaded_weight_kg: 'Peso Cargado',
  net_weight_kg: 'Peso Neto',
  invoice_number: 'Número de Factura',
  rate_per_kg: 'Tarifa por Kg',
};

/**
 * Determina si estimated_cost debe considerarse cubierto
 * Se cubre si: (loaded_weight_kg > 0 && rate_per_kg > 0) || estimated_cost > 0
 */
const isEstimatedCostCovered = (trip: Trip | CreateTripRequest): boolean => {
  const loadedWeight = trip.loaded_weight_kg || 0;
  const ratePerKg = trip.rate_per_kg || 0;
  const estimatedCost = trip.estimated_cost || 0;

  return (loadedWeight > 0 && ratePerKg > 0) || estimatedCost > 0;
};

/**
 * Retorna lista de campos faltantes en una Trip
 */
export const getMissingFields = (trip: Trip | CreateTripRequest): ImportantField[] => {
  const missing: ImportantField[] = [];

  // origin
  if (!hasValue(trip.origin)) missing.push('origin');

  // destination
  if (!hasValue(trip.destination)) missing.push('destination');

  // scheduled_date
  if (!hasValue(trip.scheduled_date)) missing.push('scheduled_date');

  // actual_start_date
  if (!hasValue(trip.actual_start_date)) missing.push('actual_start_date');

  // actual_end_date
  if (!hasValue(trip.actual_end_date)) missing.push('actual_end_date');

  // distance_km
  if (!hasValue(trip.distance_km)) missing.push('distance_km');

  // estimated_cost - caso especial
  if (!isEstimatedCostCovered(trip)) missing.push('estimated_cost');

  // loaded_weight_kg
  if (!hasValue(trip.loaded_weight_kg)) missing.push('loaded_weight_kg');

  // net_weight_kg
  if (!hasValue(trip.net_weight_kg)) missing.push('net_weight_kg');

  // invoice_number
  if (!hasValue(trip.invoice_number)) missing.push('invoice_number');

  // rate_per_kg
  if (!hasValue(trip.rate_per_kg)) missing.push('rate_per_kg');

  return missing;
};

/**
 * Determina si una Trip está completa documentalmente
 */
export const isTripComplete = (trip: Trip | CreateTripRequest): boolean => {
  return getMissingFields(trip).length === 0;
};

/**
 * Retorna los nombres en español de los campos faltantes
 */
export const getMissingFieldsLabels = (trip: Trip | CreateTripRequest): string[] => {
  return getMissingFields(trip).map((field) => FIELD_LABELS[field]);
};
