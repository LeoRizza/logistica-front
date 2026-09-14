import React, { useState, useEffect } from 'react';
import { CreateTripRequest, UnforeseeExpense, Driver, Vehicle, Client, FuelLog } from '../../types/index';
import { Button } from '../common/Button';

interface TripFormProps {
  drivers: Driver[];
  vehicles: Vehicle[];
  clients: Client[];
  onSubmit: (data: CreateTripRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<CreateTripRequest>;
}

const defaultValues: CreateTripRequest = {
  date: new Date().toISOString().split('T')[0],
  driver_id: '',
  vehicle_id: '',
  client_id: '',
  bill_of_lading: '',
  estimated_km: 0,
  km_start: undefined,
  km_end: undefined,
  amount_to_pay: 0,
  per_diems_delivered: 0,
  unforesee_expenses: [],
  fuelLogs: [],
  is_active: true,
  origin: '',
  destination: '',
  status: 'PENDING',
  loaded_weight_kg: 0,
  net_weight_kg: 0,
  rate_per_kg: 0,
  load_description: '',
  invoice_number: '',
};

export const TripForm: React.FC<TripFormProps> = ({
  drivers,
  vehicles,
  clients,
  onSubmit,
  onCancel,
  loading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<CreateTripRequest>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [newExpense, setNewExpense] = useState<UnforeseeExpense>({
    detail: '',
    amount: 0,
  });
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);

  // Initialize form with data when editing (initialData present)
  useEffect(() => {
    if (initialData) {
      // Modo edición: combinar initialData con defaultValues
      const fuelLogsData = (initialData.fuelLogs as FuelLog[]) || [];
      setFuelLogs(fuelLogsData);
      setFormData((prev) => ({
        ...defaultValues,
        ...initialData,
        fuelLogs: fuelLogsData,
      }));
    } else {
      // Modo creación: resetear a defaultValues limpios
      setFormData(defaultValues);
      setFuelLogs([]);
    }
    setErrors({});
  }, [initialData]);


  // Get selected driver info
  const selectedDriver = drivers.find((d) => d.id === formData.driver_id);
  const isDriverOwned = selectedDriver?.type === 'PROPIO';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    }

    if (!formData.driver_id) {
      newErrors.driver_id = 'Debes seleccionar un chofer';
    }

    if (!formData.vehicle_id) {
      newErrors.vehicle_id = 'Debes seleccionar un vehículo';
    }

    if (!formData.bill_of_lading.trim()) {
      newErrors.bill_of_lading = 'La carta de porte es requerida';
    }

    if (formData.estimated_km <= 0) {
      newErrors.estimated_km = 'Los KM estimados deben ser mayores a 0';
    }

    if (isDriverOwned) {
      if (
        formData.km_start === undefined ||
        formData.km_start === null ||
        formData.km_start < 0
      ) {
        newErrors.km_start = 'KM Inicio es requerido para choferes PROPIO';
      }
      
      // Validación estricta de km_end para choferes PROPIO cuando viaje está completado
      if (formData.km_end !== undefined && formData.km_end !== null) {
        if (formData.km_start !== undefined && formData.km_start !== null) {
          if (formData.km_end <= formData.km_start) {
            newErrors.km_end = 'KM Final debe ser mayor que KM Inicio';
          }
        }
      }
    }

    if (formData.amount_to_pay < 0) {
      newErrors.amount_to_pay = 'El monto a pagar no puede ser negativo';
    }

    if (formData.per_diems_delivered < 0) {
      newErrors.per_diems_delivered = 'Los viáticos no pueden ser negativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'number') {
      finalValue = value === '' ? 0 : parseFloat(value);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddExpense = () => {
    if (!newExpense.detail.trim()) {
      alert('Por favor ingresa un detalle para el gasto');
      return;
    }

    if (newExpense.amount <= 0) {
      alert('El monto debe ser mayor a 0');
      return;
    }

    setFormData((prev) => ({
      ...prev,
      unforesee_expenses: [
        ...prev.unforesee_expenses,
        {
          id: `temp_${Date.now()}`,
          detail: newExpense.detail,
          amount: newExpense.amount,
        },
      ],
    }));

    setNewExpense({ detail: '', amount: 0 });
  };

  const handleRemoveExpense = (expenseId: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      unforesee_expenses: prev.unforesee_expenses.filter(
        (e) => e.id !== expenseId
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
      {/* COLUMNA IZQUIERDA */}
      <div className="lg:w-2/3 space-y-6">
        {/* Información Principal */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Viaje
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.date && (
              <p className="text-red-600 text-xs mt-1">{errors.date}</p>
            )}
          </div>

          {/* Chofer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chofer *
            </label>
            <select
              name="driver_id"
              value={formData.driver_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.driver_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            >
              <option value="">-- Seleccionar Chofer --</option>
              {drivers
                .filter((d) => d.is_active)
                .map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.full_name} ({driver.type})
                  </option>
                ))}
            </select>
            {errors.driver_id && (
              <p className="text-red-600 text-xs mt-1">{errors.driver_id}</p>
            )}
          </div>

          {/* Origen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origen *
            </label>
            <input
              type="text"
              name="origin"
              value={formData.origin || ''}
              onChange={handleChange}
              placeholder="Ej: Buenos Aires"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.origin ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.origin && (
              <p className="text-red-600 text-xs mt-1">{errors.origin}</p>
            )}
          </div>

          {/* Destino */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Destino *
            </label>
            <input
              type="text"
              name="destination"
              value={formData.destination || ''}
              onChange={handleChange}
              placeholder="Ej: Córdoba"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.destination ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.destination && (
              <p className="text-red-600 text-xs mt-1">{errors.destination}</p>
            )}
          </div>

          {/* Vehículo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vehículo *
            </label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vehicle_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            >
              <option value="">-- Seleccionar Vehículo --</option>
              {vehicles
                .filter((v) => v.is_active)
                .map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate} - {vehicle.vehicle_type}
                  </option>
                ))}
            </select>
            {errors.vehicle_id && (
              <p className="text-red-600 text-xs mt-1">{errors.vehicle_id}</p>
            )}
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente (Opcional)
            </label>
            <select
              name="client_id"
              value={formData.client_id || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            >
              <option value="">-- Sin Cliente --</option>
              {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.business_name}
                  </option>
                ))}
            </select>
          </div>

          {/* Carta de Porte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Carta de Porte *
            </label>
            <input
              type="text"
              name="bill_of_lading"
              value={formData.bill_of_lading}
              onChange={handleChange}
              placeholder="Ej: BL-2024-001"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.bill_of_lading ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.bill_of_lading && (
              <p className="text-red-600 text-xs mt-1">
                {errors.bill_of_lading}
              </p>
            )}
          </div>

          {/* KM Estimados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KM Estimados *
            </label>
            <input
              type="number"
              name="estimated_km"
              value={formData.estimated_km}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.estimated_km ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.estimated_km && (
              <p className="text-red-600 text-xs mt-1">
                {errors.estimated_km}
              </p>
            )}
          </div>

          {/* KM Inicio - Solo para choferes PROPIO */}
          <div
            className={`transition-opacity ${
              isDriverOwned ? 'opacity-100' : 'opacity-50 pointer-events-none'
            }`}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KM Inicio {isDriverOwned && '*'}
            </label>
            <input
              type="number"
              name="km_start"
              value={formData.km_start ?? ''}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.km_start ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!isDriverOwned || submitLoading || loading}
            />
            {errors.km_start && (
              <p className="text-red-600 text-xs mt-1">{errors.km_start}</p>
            )}
            {!isDriverOwned && (
              <p className="text-gray-500 text-xs mt-1">
                Solo para choferes PROPIO
              </p>
            )}
          </div>

          {/* KM Final - Solo para choferes PROPIO */}
          <div
            className={`transition-opacity ${
              isDriverOwned ? 'opacity-100' : 'opacity-50 pointer-events-none'
            }`}
          >
            <label className="block text-sm font-medium text-gray-700 mb-1">
              KM Final {isDriverOwned && '*'}
            </label>
            <input
              type="number"
              name="km_end"
              value={formData.km_end ?? ''}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.km_end ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={!isDriverOwned || submitLoading || loading}
            />
            {errors.km_end && (
              <p className="text-red-600 text-xs mt-1">{errors.km_end}</p>
            )}
            {!isDriverOwned && (
              <p className="text-gray-500 text-xs mt-1">
                Solo para choferes PROPIO
              </p>
            )}
          </div>



          {/* Monto a Pagar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Pagar *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 px-4 py-2">$</span>
              <input
                type="number"
                name="amount_to_pay"
                value={formData.amount_to_pay}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.amount_to_pay ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={submitLoading || loading}
              />
            </div>
            {errors.amount_to_pay && (
              <p className="text-red-600 text-xs mt-1">
                {errors.amount_to_pay}
              </p>
            )}
          </div>

          {/* Viáticos Entregados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Viáticos Entregados *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 px-4 py-2">$</span>
              <input
                type="number"
                name="per_diems_delivered"
                value={formData.per_diems_delivered}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.per_diems_delivered
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                disabled={submitLoading || loading}
              />
            </div>
            {errors.per_diems_delivered && (
              <p className="text-red-600 text-xs mt-1">
                {errors.per_diems_delivered}
              </p>
            )}
          </div>

          {/* Estado del Viaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Viaje
            </label>
            <select
              name="status"
              value={formData.status || 'PENDING'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            >
              <option value="PENDING">Pendiente</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="COMPLETED">Completado</option>
              <option value="CANCELLED">Cancelado</option>
            </select>
          </div>

          {/* Descripción de la Carga */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción de la Carga
            </label>
            <input
              type="text"
              name="load_description"
              value={formData.load_description || ''}
              onChange={handleChange}
              placeholder="Ej: Soja, Pallets de papel..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>

          {/* Número de Factura */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de Factura (Opcional)
            </label>
            <input
              type="text"
              name="invoice_number"
              value={formData.invoice_number || ''}
              onChange={handleChange}
              placeholder="Ej: FC-0001-00001234"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>
        </div>
      </div>

        {/* Información de Carga */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información de Carga
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Kilos Cargados */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilos Cargados
            </label>
            <input
              type="number"
              name="loaded_weight_kg"
              value={formData.loaded_weight_kg || 0}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>

          {/* Kilos Netos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilos Netos
            </label>
            <input
              type="number"
              name="net_weight_kg"
              value={formData.net_weight_kg || 0}
              onChange={handleChange}
              placeholder="0"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>

          {/* Tarifa por Kilo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tarifa por Kilo ($)
            </label>
            <input
              type="number"
              name="rate_per_kg"
              value={formData.rate_per_kg || 0}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>
        </div>
      </div>



        {/* Gastos Imprevistos */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gastos Imprevistos
        </h2>

        {/* Nueva línea de gasto */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Detalle
              </label>
              <input
                type="text"
                value={newExpense.detail}
                onChange={(e) =>
                  setNewExpense((prev) => ({ ...prev, detail: e.target.value }))
                }
                placeholder="Ej: Peaje, Combustible adicional, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitLoading || loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto ($)
              </label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) =>
                  setNewExpense((prev) => ({
                    ...prev,
                    amount: parseFloat(e.target.value) || 0,
                  }))
                }
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={submitLoading || loading}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddExpense}
            disabled={submitLoading || loading}
            className="w-full bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-500 font-medium py-2 rounded-lg transition-colors"
          >
            + Agregar Gasto
          </button>
        </div>

        {/* Lista de gastos agregados */}
        {formData.unforesee_expenses.length > 0 ? (
          <div className="space-y-2">
            {formData.unforesee_expenses.map((expense, index) => (
              <div
                key={expense.id}
                className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {expense.detail}
                  </p>
                  <p className="text-xs text-gray-500">Monto: ${expense.amount.toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(expense.id)}
                  disabled={submitLoading || loading}
                  className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-600 disabled:text-gray-400 text-sm font-medium rounded transition-colors"
                >
                  Eliminar
                </button>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-semibold text-gray-900">
                Total de Gastos:{' '}
                <span className="text-blue-600">
                  ${formData.unforesee_expenses
                    .reduce((sum, exp) => sum + exp.amount, 0)
                    .toFixed(2)}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No hay gastos agregados</p>
          </div>
        )}
        </div>
      </div>

      {/* COLUMNA DERECHA - STICKY */}
      <div className="lg:w-1/3">
        <div className="sticky top-0 space-y-6">
          {/* Resumen Financiero del Viaje - Invoice Style */}
          {formData.driver_id && formData.vehicle_id && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Resumen Financiero</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* INGRESOS */}
                {(formData.loaded_weight_kg || 0) > 0 && (formData.rate_per_kg || 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ingresos</p>
                    <div className="flex justify-between items-center text-gray-900">
                      <span className="text-sm">Flete ({formData.loaded_weight_kg}kg × ${formData.rate_per_kg})</span>
                      <span className="font-semibold">${((formData.loaded_weight_kg || 0) * (formData.rate_per_kg || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {/* COSTOS */}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Costos Operativos</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Honorarios del Chofer</span>
                      <span className="text-gray-900 font-medium">${formData.amount_to_pay.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Viáticos</span>
                      <span className="text-gray-900 font-medium">${formData.per_diems_delivered.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos de Ruta</span>
                      <span className="text-gray-900 font-medium">${formData.unforesee_expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-800">Costo Total</span>
                    <span className="text-base font-bold text-red-600">-${(formData.amount_to_pay + formData.per_diems_delivered + formData.unforesee_expenses.reduce((sum, exp) => sum + exp.amount, 0)).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {/* GANANCIA NETA */}
              {(() => {
                const totalRevenue = (formData.loaded_weight_kg || 0) * (formData.rate_per_kg || 0);
                const totalCosts = formData.amount_to_pay + formData.per_diems_delivered + formData.unforesee_expenses.reduce((sum, exp) => sum + exp.amount, 0);
                const netProfit = totalRevenue - totalCosts;
                const profitIsPositive = netProfit >= 0;
                return (
                  <div className={`px-6 py-5 ${profitIsPositive ? 'bg-emerald-50 border-t border-emerald-100' : 'bg-red-50 border-t border-red-100'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${profitIsPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                      {profitIsPositive ? 'Ganancia Neta' : 'Pérdida Neta'}
                    </p>
                    <div className="flex justify-between items-end">
                      <span className={`text-3xl font-black tracking-tight ${profitIsPositive ? 'text-emerald-700' : 'text-red-700'}`}>
                        ${Math.abs(netProfit).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={submitLoading}
          disabled={loading}
        >
          Cargar Viaje
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onCancel}
            disabled={submitLoading || loading}
          >
            Cancelar
          </Button>
        )}
          </div>
        </div>
      </div>
    </form>
  );
};
