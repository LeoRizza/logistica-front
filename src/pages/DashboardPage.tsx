import React, { useState, useCallback } from 'react';
import { DashboardPnLResponse } from '../types/index';
import { Button } from '../components/common/Button';
import { useApi } from '../hooks/useApi';

const CATEGORY_LABELS: Record<string, string> = {
  SALARIES: 'Salarios',
  FUEL: 'Combustible',
  MAINTENANCE: 'Mantenimiento',
  INSURANCE: 'Seguros',
  RENT: 'Alquiler',
  UTILITIES: 'Servicios',
  OFFICE_SUPPLIES: 'Artículos de Oficina',
  EQUIPMENT: 'Equipamiento',
  LEGAL: 'Trámites Legales',
  MARKETING: 'Marketing',
  OTHER: 'Otro',
};

export const DashboardPage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0]
  );
  const [endDate, setEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dashboardData, setDashboardData] = useState<DashboardPnLResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { get } = useApi();

  const handleCalculate = useCallback(async () => {
    if (!startDate || !endDate) {
      setError('Por favor selecciona ambas fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await get(`/dashboard/pnl?startDate=${startDate}&endDate=${endDate}`);

      if (!response || !response.success) {
        throw new Error('Error al consultar el estado de resultados');
      }

      setDashboardData(response.data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Error al consultar el dashboard';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, get]);

  const isNetProfitPositive =
    dashboardData && dashboardData.netProfitCompany >= 0;

  const formatLocalDate = (dateVal: string | Date) => {
    const dateStr = typeof dateVal === 'string' ? dateVal : dateVal.toISOString();
    const [year, month, day] = dateStr.split('T')[0].split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard Gerencial
        </h1>
        <p className="text-gray-600 mt-1">
          Estado de Resultados y Análisis Financiero
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Selector de Período
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Calculate Button */}
          <div>
            <Button
              onClick={handleCalculate}
              variant="primary"
              fullWidth
              loading={loading}
            >
              Calcular Estado de Resultados
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Dashboard Content */}
      {dashboardData ? (
        <>
          {/* Main KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ingresos Operativos */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm uppercase tracking-wide font-medium">
                    Ingresos Operativos
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    ${dashboardData.operatingIncome.grossRevenue.toFixed(2)}
                  </p>
                </div>
                <svg
                  className="h-12 w-12 text-blue-200 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <p className="text-blue-100 text-sm">
                Total de ingresos generados en el período
              </p>
            </div>

            {/* Costos Indirectos */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg shadow-lg p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-orange-100 text-sm uppercase tracking-wide font-medium">
                    Costos Indirectos
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    ${dashboardData.indirectCosts.total.toFixed(2)}
                  </p>
                </div>
                <svg
                  className="h-12 w-12 text-orange-200 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 17h8m0 0v8m0-8l-8-8-4 4-6-6"
                  />
                </svg>
              </div>
              <p className="text-orange-100 text-sm">
                Gastos generales de la empresa
              </p>
            </div>

            {/* Ganancia Neta Empresa */}
            <div
              className={`bg-gradient-to-br rounded-lg shadow-lg p-8 text-white ${
                isNetProfitPositive
                  ? 'from-green-500 to-emerald-600'
                  : 'from-red-500 to-rose-600'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p
                    className={`text-sm uppercase tracking-wide font-medium ${
                      isNetProfitPositive
                        ? 'text-green-100'
                        : 'text-red-100'
                    }`}
                  >
                    Ganancia Neta Empresa
                  </p>
                  <p className="text-4xl font-bold mt-2">
                    ${dashboardData.netProfitCompany.toFixed(2)}
                  </p>
                </div>
                <svg
                  className={`h-12 w-12 opacity-50 ${
                    isNetProfitPositive
                      ? 'text-green-200'
                      : 'text-red-200'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isNetProfitPositive
                        ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                        : 'M13 17h8m0 0v8m0-8l-8-8-4 4-6-6'
                    }
                  />
                </svg>
              </div>
              <p
                className={`text-sm ${
                  isNetProfitPositive
                    ? 'text-green-100'
                    : 'text-red-100'
                }`}
              >
                Resultado final después de costos indirectos
              </p>
            </div>
          </div>

          {/* Expenses by Category */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Desglose de Gastos por Categoría
            </h2>

            {dashboardData.indirectCosts.byCategory &&
            Object.entries(dashboardData.indirectCosts.byCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(dashboardData.indirectCosts.byCategory).map(
                  ([category, amount]) => {
                    const percentage =
                      dashboardData.indirectCosts.total > 0
                        ? (amount / dashboardData.indirectCosts.total) * 100
                        : 0;

                    return (
                      <div key={category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {CATEGORY_LABELS[category] || category}
                          </span>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">
                              ${amount.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {percentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.min(percentage, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No hay datos de gastos para mostrar en este período
                </p>
              </div>
            )}
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Resumen Financiero
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">
                      Período Analizado
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                      {formatLocalDate(dashboardData.period.startDate)} - {formatLocalDate(dashboardData.period.endDate)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-blue-50">
                    <td className="px-4 py-3 text-sm font-medium text-blue-900">
                      Ingresos Operativos
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-900 text-right">
                      ${dashboardData.operatingIncome.grossRevenue.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200 bg-red-50">
                    <td className="px-4 py-3 text-sm font-medium text-red-900">
                      Costos Indirectos (Gastos Empresa)
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-900 text-right">
                      -${dashboardData.indirectCosts.total.toFixed(2)}
                    </td>
                  </tr>
                  <tr
                    className={`${
                      isNetProfitPositive
                        ? 'bg-green-50'
                        : 'bg-red-50'
                    }`}
                  >
                    <td
                      className={`px-4 py-3 text-sm font-bold ${
                        isNetProfitPositive
                          ? 'text-green-900'
                          : 'text-red-900'
                      }`}
                    >
                      Ganancia Neta Empresa
                    </td>
                    <td
                      className={`px-4 py-3 text-sm font-bold text-right ${
                        isNetProfitPositive
                          ? 'text-green-900'
                          : 'text-red-900'
                      }`}
                    >
                      ${dashboardData.netProfitCompany.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <svg
            className="h-12 w-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">
            Selecciona un rango de fechas y haz clic en "Calcular Estado de
            Resultados" para ver el análisis financiero.
          </p>
        </div>
      )}
    </div>
  );
};
