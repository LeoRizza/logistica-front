/**
 * Settlement Receipt Component
 * Recibo visual de liquidación que emula un comprobante físico
 */

import React, { useState, useCallback, useMemo } from 'react';
import { SettlementData, SettlementReceipt as SettlementReceiptType } from '../../types/settlement';
import { Button } from '../common/Button';
import { formatCurrency } from '../../utils/dateUtils';

interface SettlementReceiptProps {
  settlementData: SettlementData;
  onSave: (receipt: SettlementReceiptType) => void;
  onCancel: () => void;
  saving: boolean;
}

export const SettlementReceipt: React.FC<SettlementReceiptProps> = ({
  settlementData,
  onSave,
  onCancel,
  saving,
}) => {
  const [extraDiscounts, setExtraDiscounts] = useState<number>(0);
  const [bonifications, setBonifications] = useState<number>(0);

  // Calcular monto final en tiempo real
  const finalAmount = useMemo(() => {
    return settlementData.total_to_pay - extraDiscounts + bonifications;
  }, [settlementData.total_to_pay, extraDiscounts, bonifications]);

  const handleSave = useCallback(() => {
    const receipt: SettlementReceiptType = {
      ...settlementData,
      extra_discounts: extraDiscounts,
      bonifications: bonifications,
      final_amount: finalAmount,
    };
    onSave(receipt);
  }, [settlementData, extraDiscounts, bonifications, finalAmount, onSave]);

  const handleExtraDiscountsChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setExtraDiscounts(Math.max(0, num));
  };

  const handleBonificationsChange = (value: string) => {
    const num = parseFloat(value) || 0;
    setBonifications(Math.max(0, num));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
      {/* Header del Recibo */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6 text-center">
        <h2 className="text-3xl font-bold text-gray-900">RECIBO DE LIQUIDACIÓN</h2>
        <p className="text-sm text-gray-600 mt-2">
          Liquidación de viáticos y comisiones del Chofer
        </p>
      </div>

      {/* Información del Chofer y Fechas */}
      <div className="grid grid-cols-2 gap-6 mb-6 pb-4 border-b border-gray-300">
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Chofer</p>
          <p className="text-lg font-bold text-gray-900">{settlementData.driver_name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Período</p>
          <p className="text-lg font-bold text-gray-900">
            {settlementData.start_date} al {settlementData.end_date}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">ID Chofer</p>
          <p className="text-sm text-gray-700 font-mono">{settlementData.driver_id}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase">Fecha de Emisión</p>
          <p className="text-sm text-gray-700">
            {new Date().toLocaleDateString('es-AR')}
          </p>
        </div>
      </div>

      {/* Detalle de Viajes */}
      {settlementData.trips.length > 0 && (
        <div className="mb-6 pb-4 border-b border-gray-300">
          <h3 className="text-sm font-bold text-gray-900 uppercase mb-3">Detalle de Viajes</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-800">
                  <th className="text-left px-2 py-2 font-bold text-gray-900">Fecha</th>
                  <th className="text-left px-2 py-2 font-bold text-gray-900">Comprobante</th>
                  <th className="text-right px-2 py-2 font-bold text-gray-900">Monto</th>
                  <th className="text-right px-2 py-2 font-bold text-gray-900">Viáticos</th>
                  <th className="text-right px-2 py-2 font-bold text-gray-900">Gastos</th>
                </tr>
              </thead>
              <tbody>
                {settlementData.trips.map((trip) => (
                  <tr key={trip.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-2 py-2 text-gray-700">{trip.date}</td>
                    <td className="px-2 py-2 text-gray-700 font-mono">{trip.reference_number}</td>
                    <td className="px-2 py-2 text-right text-gray-900 font-semibold">
                      ${Number(trip.estimated_cost || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right text-red-600">
                      -${Number(trip.per_diems_delivered || 0).toFixed(2)}
                    </td>
                    <td className="px-2 py-2 text-right text-red-600">
                      -${Number(trip.tripExpenses_total || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sección de Totales - Diseño de Comprobante */}
      <div className="mb-6 pb-4 border-2 border-gray-800 rounded-lg bg-gray-50 p-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase mb-4 pb-2 border-b border-gray-400">
          Detalle de Cálculo
        </h3>

        {/* Fila 1: Total Ganado */}
        <div className="flex justify-between items-center py-3 border-b border-gray-300">
          <span className="text-sm font-semibold text-gray-700">Total Ganado (Viajes)</span>
          <span className="text-lg font-bold text-gray-900">
            ${settlementData.total_amount_earned.toFixed(2)}
          </span>
        </div>

        {/* Fila 2: Descuentos de Viáticos */}
        <div className="flex justify-between items-center py-3 border-b border-gray-300">
          <span className="text-sm font-semibold text-gray-700">(-) Viáticos Entregados</span>
          <span className="text-lg font-bold text-red-600">
            -${settlementData.total_per_diems_delivered.toFixed(2)}
          </span>
        </div>

        {/* Fila 3: Gastos Imprevistos */}
        <div className="flex justify-between items-center py-3 border-b border-gray-300">
          <span className="text-sm font-semibold text-gray-700">(-) Gastos Imprevistos</span>
          <span className="text-lg font-bold text-red-600">
            -${settlementData.total_unforesee_expenses.toFixed(2)}
          </span>
        </div>

        {/* Subtotal */}
        <div className="flex justify-between items-center py-4 border-b-2 border-gray-400 bg-white rounded p-2 my-2">
          <span className="text-sm font-bold text-gray-900">SUBTOTAL NETO</span>
          <span className="text-xl font-bold text-blue-600">
            ${settlementData.total_to_pay.toFixed(2)}
          </span>
        </div>

        {/* Descuentos Extras - Input Editable */}
        <div className="flex justify-between items-center py-3 border-b border-gray-300">
          <label htmlFor="extraDiscounts" className="text-sm font-semibold text-gray-700">
            (-) Descuentos Extra
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">$</span>
            <input
              type="number"
              id="extraDiscounts"
              value={extraDiscounts}
              onChange={(e) => handleExtraDiscountsChange(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-24 px-2 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-red-400 text-right font-semibold"
            />
          </div>
        </div>

        {/* Bonificaciones - Input Editable */}
        <div className="flex justify-between items-center py-3 border-b-2 border-gray-400">
          <label htmlFor="bonifications" className="text-sm font-semibold text-gray-700">
            (+) Bonificaciones
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">$</span>
            <input
              type="number"
              id="bonifications"
              value={bonifications}
              onChange={(e) => handleBonificationsChange(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-24 px-2 py-1 border border-gray-400 rounded focus:outline-none focus:ring-2 focus:ring-green-400 text-right font-semibold"
            />
          </div>
        </div>

        {/* TOTAL FINAL - Monto a Pagar */}
        <div className="flex justify-between items-center py-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 mt-3 text-white">
          <span className="text-lg font-bold">TOTAL A PAGAR</span>
          <span className="text-3xl font-black">${finalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Notas y Acciones */}
      <div className="flex flex-col-reverse md:flex-row gap-4">
        {/* Botones de Acción */}
        <div className="flex gap-3 w-full md:w-auto md:ml-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 md:flex-none"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 md:flex-none"
          >
            {saving ? 'Guardando...' : 'Guardar Liquidación'}
          </Button>
        </div>
      </div>

      {/* Pie de Página */}
      <div className="mt-8 pt-4 border-t-2 border-gray-800 text-center">
        <p className="text-xs text-gray-600">
          Este comprobante representa el cálculo de liquidación del período indicado
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Para cambios o reclamaciones, dirígete a administración dentro de 7 días hábiles
        </p>
      </div>
    </div>
  );
};
