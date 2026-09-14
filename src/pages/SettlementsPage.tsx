/**
 * Settlements Page
 * Página principal para gestión de liquidaciones
 */

import React, { useState } from 'react';
import { SettlementForm } from '../components/settlements/SettlementForm';
import { SettlementReceipt } from '../components/settlements/SettlementReceipt';
import { useSettlement } from '../hooks/useSettlement';
import { SettlementData } from '../types/settlement';

export const SettlementsPage: React.FC = () => {
  const { settlementData, loading, error, calculateSettlement, createReceipt, saveSettlement } =
    useSettlement();
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCalculate = async (driverId: string, startDate: string, endDate: string) => {
    setSaveError(null);
    setSaveSuccess(false);
    await calculateSettlement(driverId, startDate, endDate);
  };

  const handleSaveSettlement = async (receipt: any) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await saveSettlement(receipt);
      setSaveSuccess(true);

      // Mostrar mensaje de éxito
      setTimeout(() => {
        // Limpiar el formulario
        setSaveSuccess(false);
      }, 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar la liquidación');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Limpiar estado y volver al formulario
    setSaveError(null);
    setSaveSuccess(false);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Módulo de Liquidaciones</h1>
          <p className="text-gray-600">
            Calcula y visualiza las liquidaciones de tus choferes de forma segura
          </p>
        </div>

        {/* Notificaciones */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {saveError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  ¡Liquidación guardada exitosamente! 🎉
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario de Búsqueda */}
        <SettlementForm onCalculate={handleCalculate} loading={loading} />

        {/* Recibo de Liquidación */}
        {settlementData && (
          <SettlementReceipt
            settlementData={settlementData}
            onSave={handleSaveSettlement}
            onCancel={handleCancel}
            saving={saving}
          />
        )}

        {/* Estado Vacío */}
        {!settlementData && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">
              No hay datos para mostrar
            </h3>
            <p className="mt-2 text-gray-600">
              Selecciona un chofer, rango de fechas y haz clic en "Calcular Liquidación" para
              comenzar
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
