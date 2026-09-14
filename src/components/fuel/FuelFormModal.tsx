import React, { useState, useEffect } from 'react';
import { Vehicle, Trip, FuelLog } from '../../types/index';
import { Modal } from '../common/Modal';
import { useApi } from '../../hooks/useApi';

interface FuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  trip?: Trip | null;
  onSuccess?: () => void;
}

export const FuelFormModal: React.FC<FuelFormModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  trip,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [odometerReading, setOdometerReading] = useState('');
  const [litersLoaded, setLitersLoaded] = useState('');
  const [totalCostInput, setTotalCostInput] = useState('');
  const [stationName, setStationName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [lastOdometer, setLastOdometer] = useState<number | null>(null);
  const [fuelHistory, setFuelHistory] = useState<FuelLog[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fuelDate, setFuelDate] = useState(new Date().toISOString().split('T')[0]);

  const { post, get } = useApi();

  // Load fuel history and last odometer reading when vehicle is selected
  useEffect(() => {
    if (vehicle && isOpen) {
      const fetchFuelHistory = async () => {
        try {
          setHistoryLoading(true);
          // Increased limit to 100 to fetch more history for context-aware filtering
          const response = await get(`/fuel/vehicle/${vehicle.id}?limit=100`);
          
          // Extract logs from response - handle both formats
          const logs: FuelLog[] = response?.data?.data || response?.data || [];
          
          if (Array.isArray(logs) && logs.length > 0) {
            setFuelHistory(logs);
            // Always set lastOdometer from the most recent entry (index 0)
            setLastOdometer(logs[0].odometer_reading);
          } else {
            setFuelHistory([]);
            setLastOdometer(null);
          }
        } catch (err) {
          console.error('Error fetching fuel history:', err);
          setFuelHistory([]);
          setLastOdometer(null);
        } finally {
          setHistoryLoading(false);
        }
      };
      fetchFuelHistory();
    }
  }, [vehicle, isOpen, get]);

  // Reset form when modal closes or vehicle changes
  useEffect(() => {
    if (!isOpen) {
      setOdometerReading('');
      setLitersLoaded('');
      setTotalCostInput('');
      setStationName('');
      setNotes('');
      setError('');
      setLastOdometer(null);
      setFuelDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  // Calculate price per liter dynamically
  const calculatePricePerLiter = (): number => {
    const liters = parseFloat(litersLoaded) || 0;
    const totalCost = parseFloat(totalCostInput) || 0;
    if (liters <= 0) return 0;
    return totalCost / liters;
  };

  const pricePerLiter = calculatePricePerLiter();
  const totalCost = parseFloat(totalCostInput) || 0;
  
  // Filter history based on context: show only trip logs if trip is provided, else all vehicle logs
  let displayedHistory = trip 
    ? fuelHistory.filter(log => log.trip_id === trip.id)
    : fuelHistory;
  
  // Apply local date range filtering
  if (startDate) {
    // Agregamos T00:00:00 para forzar el parseo en la zona horaria local
    const startTimestamp = new Date(startDate + 'T00:00:00').getTime();
    displayedHistory = displayedHistory.filter(
      (log) => new Date(log.created_at).getTime() >= startTimestamp
    );
  }
  if (endDate) {
    // Agregamos T23:59:59 para incluir todo el último día en hora local
    const endTimestamp = new Date(endDate + 'T23:59:59').getTime();
    displayedHistory = displayedHistory.filter(
      (log) => new Date(log.created_at).getTime() <= endTimestamp
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!vehicle) {
      setError('No vehicle selected');
      return;
    }

    if (!odometerReading.trim()) {
      setError('Odometer reading is required');
      return;
    }

    if (!litersLoaded.trim()) {
      setError('Liters loaded is required');
      return;
    }

    if (!totalCostInput.trim()) {
      setError('Total cost paid is required');
      return;
    }

    const odometer = parseFloat(odometerReading);
    const liters = parseFloat(litersLoaded);
    const cost = parseFloat(totalCostInput);

    if (isNaN(odometer) || odometer < 0) {
      setError('Odometer reading must be a valid non-negative number');
      return;
    }

    if (isNaN(liters) || liters <= 0) {
      setError('Liters loaded must be a valid number greater than 0');
      return;
    }

    if (isNaN(cost) || cost <= 0) {
      setError('Total cost must be a valid number greater than 0');
      return;
    }

    try {
      setLoading(true);

      const response = await post('/fuel', {
        vehicle_id: vehicle.id,
        odometer_reading: odometer,
        liters_loaded: liters,
        total_cost: cost,
        station_name: stationName.trim() || undefined,
        notes: notes.trim() || undefined,
        trip_id: trip?.id || undefined,
        date: fuelDate,
      });

      if (!response?.success) {
        throw new Error(response?.message || 'Error creating fuel log');
      }

      // Reset form and close modal
      setOdometerReading('');
      setLitersLoaded('');
      setTotalCostInput('');
      setStationName('');
      setNotes('');
      setError('');

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create fuel log';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate fuel efficiency (km/L)
  const calculateFuelEfficiency = (kmDifference: number, liters: number): number => {
    if (liters === 0) return 0;
    return kmDifference / liters;
  };

  if (!vehicle) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Cargar Combustible - ${vehicle.plate}`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[80vh] overflow-y-auto">
        {/* Left Column: Form */}
        <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Fuel Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Carga *
          </label>
          <input
            type="date"
            value={fuelDate}
            onChange={(e) => setFuelDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        {/* Odometer Reading */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lectura del Odómetro (km)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={odometerReading}
            onChange={(e) => setOdometerReading(e.target.value)}
            placeholder="Ej: 125450.50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
          {lastOdometer !== null && (
            <p className="text-xs text-gray-500 mt-2">
              Último registro del vehículo: {lastOdometer.toFixed(2)} km
            </p>
          )}
        </div>

        {/* Liters Loaded */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Litros Cargados
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={litersLoaded}
            onChange={(e) => setLitersLoaded(e.target.value)}
            placeholder="Ej: 150.50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        {/* Total Cost Paid - REPLACES Precio por Litro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monto Total Pagado ($)
          </label>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={totalCostInput}
            onChange={(e) => setTotalCostInput(e.target.value)}
            placeholder="Ej: 12800.50"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-2">
            Precio/L = ${pricePerLiter.toFixed(2)} (calculado automáticamente)
          </p>
        </div>

        {/* Total Cost Display */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Costo Total</span>
            <span className="text-2xl font-bold text-blue-600">
              ${totalCost.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Station Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estación de Servicio (Opcional)
          </label>
          <input
            type="text"
            value={stationName}
            onChange={(e) => setStationName(e.target.value)}
            placeholder="Ej: YPF, Shell, Axion..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            disabled={loading}
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (Opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej: Combustible premium, etc."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
                Guardar
              </>
            )}
          </button>
        </div>
      </form>
        </div>

        {/* Right Column: Fuel History */}
        <div className="border-l border-gray-200 pl-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Historial de Combustible</h3>
            {historyLoading && (
              <div className="h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            )}
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              />
            </div>
          </div>

          {displayedHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                {trip 
                  ? 'No hay cargas de combustible registradas en este viaje'
                  : 'No hay registros de combustible para este vehículo'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Fecha</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">Odómetro</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">Litros</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">Precio/L</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">Total</th>
                      <th className="px-3 py-2 text-right font-medium text-gray-700">Rendimiento</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {displayedHistory.map((log, index) => {
                      const nextLog = displayedHistory[index + 1];
                      const kmDifference = nextLog
                        ? log.odometer_reading - nextLog.odometer_reading
                        : 0;
                      const efficiency = calculateFuelEfficiency(Math.abs(kmDifference), log.liters_loaded);

                      return (
                        <tr key={log.id} className="hover:bg-blue-50 transition-colors">
                          <td className="px-3 py-2 whitespace-nowrap text-gray-900">
                            {new Date(log.created_at).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900 font-medium">
                            {log.odometer_reading.toFixed(2)} km
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            {log.liters_loaded.toFixed(2)} L
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900">
                            ${log.fuel_price_per_liter.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-900 font-medium">
                            ${log.total_cost.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {efficiency > 0 ? (
                              <span className="text-sm font-medium text-green-600">
                                {efficiency.toFixed(2)} km/L
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Summary Stats */}
              <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Litros:</span>
                  <span className="font-medium text-gray-900">
                    {displayedHistory.reduce((sum, log) => sum + log.liters_loaded, 0).toFixed(2)} L
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Total Invertido:</span>
                  <span className="font-medium text-gray-900">
                    ${displayedHistory
                      .reduce((sum, log) => sum + log.total_cost, 0)
                      .toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Promedio Precio/L:</span>
                  <span className="font-medium text-gray-900">
                    $
                    {(
                      displayedHistory.reduce((sum, log) => sum + log.total_cost, 0) /
                      (displayedHistory.reduce((sum, log) => sum + log.liters_loaded, 0) || 1)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default FuelFormModal;
