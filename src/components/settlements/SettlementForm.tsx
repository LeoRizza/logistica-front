/**
 * Settlement Form Component
 * Formulario para seleccionar chofer y rango de fechas
 */

import React, { useState, useEffect } from 'react';
import { Driver } from '../../types';
import { useApi } from '../../hooks/useApi';
import { Button } from '../common/Button';

interface SettlementFormProps {
  onCalculate: (driverId: string, startDate: string, endDate: string) => void;
  loading: boolean;
}

export const SettlementForm: React.FC<SettlementFormProps> = ({ onCalculate, loading }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const { get } = useApi();

  // Cargar choferes disponibles
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await get<Driver[]>('/drivers');
        if (response && response.data) {
          const driversList = Array.isArray(response.data) ? response.data : (response.data as any)?.data || [];
          setDrivers(driversList.filter((d: Driver) => d.is_active));
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error loading drivers';
        console.error(errorMessage, error);
      }
    };

    fetchDrivers();
  }, [get]);

  // Obtener fecha de hoy y hace 30 días
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validar campos
    if (!selectedDriver) {
      setFormError('Por favor selecciona un chofer');
      return;
    }

    if (!startDate) {
      setFormError('Por favor selecciona una fecha de inicio');
      return;
    }

    if (!endDate) {
      setFormError('Por favor selecciona una fecha de fin');
      return;
    }

    // Validar que fecha inicio sea menor que fecha fin
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setFormError('La fecha de inicio debe ser menor que la fecha de fin');
      return;
    }

    // Validar que no sean la misma fecha
    if (start.getTime() === end.getTime()) {
      setFormError('Las fechas de inicio y fin no pueden ser iguales');
      return;
    }

    onCalculate(selectedDriver, startDate, endDate);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Selecciona parámetros de búsqueda</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {formError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">{formError}</p>
          </div>
        )}

        {/* Grid de selecciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Select Driver */}
          <div>
            <label htmlFor="driver" className="block text-sm font-semibold text-gray-700 mb-2">
              Chofer
            </label>
            <select
              id="driver"
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Selecciona un chofer --</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? 'Calculando...' : 'Calcular Liquidación'}
          </Button>
        </div>
      </form>
    </div>
  );
};
