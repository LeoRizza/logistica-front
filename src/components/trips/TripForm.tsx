import React, { useState, useEffect } from 'react';
import { CreateTripRequest, UnforeseeExpense, Driver, Vehicle, Client, FuelLog } from '../../types/index';
import { Button } from '../common/Button';
import { getMissingFieldsLabels } from '../../utils/tripUtils';

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
  driver_id: null,
  vehicle_id: null,
  client_id: null,
  bill_of_lading: null,
  reference_number: null,
  estimated_km: null,
  km_start: undefined,
  km_end: undefined,
  amount_to_pay: null,
  per_diems_delivered: null,
  unforesee_expenses: [],
  fuelLogs: [],
  is_active: true,
  origin: null,
  destination: null,
  status: 'COMPLETED',
  loaded_weight_kg: null,
  net_weight_kg: null,
  rate_per_kg: null,
  load_description: null,
  invoice_number: null,
  ctg: null,
  scheduled_date: null,
  actual_start_date: null,
  actual_end_date: null,
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
  const [driverPercentage, setDriverPercentage] = useState<number>(17);
  const [newExpense, setNewExpense] = useState<UnforeseeExpense>({
    detail: '',
    amount: 0,
  });
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);

  const missingFields = getMissingFieldsLabels(formData);
  const showWarningBanner = missingFields.length > 0;

  useEffect(() => {
    if (initialData) {
      const fuelLogsData = (initialData.fuelLogs as FuelLog[]) || [];
      setFuelLogs(fuelLogsData);
      
      const totalRevenue = (initialData.loaded_weight_kg || 0) * (initialData.rate_per_kg || 0);
      let calculatedPercentage = 17;
      if (totalRevenue > 0 && (initialData.amount_to_pay || 0) > 0) {
        calculatedPercentage = Number((((initialData.amount_to_pay || 0) / totalRevenue) * 100).toFixed(2));
      }
      setDriverPercentage(calculatedPercentage);
      
      setFormData((prev) => ({
        ...defaultValues,
        ...initialData,
        fuelLogs: fuelLogsData,
        scheduled_date: initialData.scheduled_date || initialData.date || defaultValues.scheduled_date,
      }));
    } else {
      setFormData(defaultValues);
      setFuelLogs([]);
      setDriverPercentage(17);
    }
    setErrors({});
  }, [initialData]);

  const selectedDriver = drivers.find((d) => d.id === formData.driver_id);
  const isDriverOwned = selectedDriver?.type === 'PROPIO';

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.km_start !== undefined && formData.km_start !== null && formData.km_start < 0) {
      newErrors.km_start = 'KM Inicio no puede ser negativo';
    }

    if (formData.km_end !== undefined && formData.km_end !== null) {
      if (formData.km_start !== undefined && formData.km_start !== null) {
        if (formData.km_end <= formData.km_start) {
          newErrors.km_end = 'KM Final debe ser mayor que KM Inicio';
        }
      }
    }

    if (formData.amount_to_pay !== null && formData.amount_to_pay !== undefined && formData.amount_to_pay < 0) {
      newErrors.amount_to_pay = 'El monto a pagar no puede ser negativo';
    }

    if (formData.per_diems_delivered !== null && formData.per_diems_delivered !== undefined && formData.per_diems_delivered < 0) {
      newErrors.per_diems_delivered = 'Los viáticos no pueden ser negativos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'number') {
      finalValue = value === '' ? null : parseFloat(value);
    } else if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (value === '') {
      finalValue = null;
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: finalValue,
      };

      // Auto-calculate amount_to_pay when loaded_weight_kg or rate_per_kg changes
      if ((name === 'loaded_weight_kg' || name === 'rate_per_kg') && formData.driver_id) {
        const newLoadedWeight = name === 'loaded_weight_kg' ? finalValue : (prev.loaded_weight_kg || 0);
        const newRatePerKg = name === 'rate_per_kg' ? finalValue : (prev.rate_per_kg || 0);
        const totalRevenue = (newLoadedWeight || 0) * (newRatePerKg || 0);
        const calculatedAmount = Number(((totalRevenue * (driverPercentage / 100)).toFixed(2)));
        updatedData.amount_to_pay = calculatedAmount > 0 ? calculatedAmount : null;
      }

      // Sync scheduled_date when date changes
      if (name === 'date') {
        updatedData.scheduled_date = finalValue;
      }

      return updatedData;
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePercentageChange = (newPercentage: number) => {
    setDriverPercentage(newPercentage);
    
    // Recalculate amount_to_pay based on new percentage
    const totalRevenue = (formData.loaded_weight_kg || 0) * (formData.rate_per_kg || 0);
    const calculatedAmount = Number(((totalRevenue * (newPercentage / 100)).toFixed(2)));
    
    setFormData((prev) => ({
      ...prev,
      amount_to_pay: calculatedAmount > 0 ? calculatedAmount : null,
    }));
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

    const tempId = `temp_${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      unforesee_expenses: [
        ...prev.unforesee_expenses,
        {
          id: tempId,
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
      unforesee_expenses: prev.unforesee_expenses.filter((e) => e.id !== expenseId),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitLoading(true);
      const cleanedData: CreateTripRequest = {
        ...formData,
        status: 'COMPLETED',
        scheduled_date: formData.date || formData.scheduled_date,
      };

      (cleanedData as any).actual_cost = formData.amount_to_pay;

      Object.keys(cleanedData).forEach((key) => {
        const value = (cleanedData as any)[key];
        if (value === '' || (typeof value === 'number' && isNaN(value))) {
          (cleanedData as any)[key] = null;
        }
      });

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
      <div className="lg:w-2/3 space-y-6">
        {showWarningBanner && (
          <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
            <p className="text-amber-800 font-semibold mb-2">
              ⚠️ Atención: Hay campos importantes pendientes que afectan el cálculo de ganancias, facturación o liquidaciones:
            </p>
            <ul className="list-disc list-inside text-amber-700 text-sm space-y-1">
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
            <p className="text-amber-700 text-sm mt-3">
              Podés guardar el viaje igual y completarlo más adelante.
            </p>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del Viaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input type="date" name="date" value={formData.date || ''} onChange={handleChange} className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.date ? 'border-red-500' : 'border-gray-300'}`} disabled={submitLoading || loading} />
              {errors.date && <p className="text-red-600 text-xs mt-1">{errors.date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chofer</label>
              <select name="driver_id" value={formData.driver_id || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading}>
                <option value="">-- Seleccionar Chofer --</option>
                {drivers.filter((d) => d.is_active).map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.full_name} ({driver.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Origen</label>
              <input type="text" name="origin" value={formData.origin || ''} onChange={handleChange} placeholder="Ej: Buenos Aires" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destino</label>
              <input type="text" name="destination" value={formData.destination || ''} onChange={handleChange} placeholder="Ej: Córdoba" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehículo</label>
              <select name="vehicle_id" value={formData.vehicle_id || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading}>
                <option value="">-- Seleccionar Vehículo --</option>
                {vehicles.filter((v) => v.is_active).map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>{vehicle.plate} - {vehicle.vehicle_type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select name="client_id" value={formData.client_id || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading}>
                <option value="">-- Sin Cliente --</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.business_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carta de Porte</label>
              <input type="text" name="reference_number" value={formData.reference_number || ''} onChange={handleChange} placeholder="Ej: BL-2024-001" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CTG</label>
              <input type="text" name="ctg" value={formData.ctg || ''} onChange={handleChange} placeholder="Ej: 12345678901" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Distancia (km)</label>
              <input type="number" name="distance_km" value={formData.distance_km ?? ''} onChange={handleChange} placeholder="0" step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Costo Estimado</label>
              <div className="flex items-center">
                <span className="text-gray-500 px-4 py-2">$</span>
                <input type="number" name="estimated_cost" value={formData.estimated_cost ?? ''} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Monto a Pagar</label>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <div className="flex items-center">
                    <span className="text-gray-500 px-4 py-2">$</span>
                    <input type="number" name="amount_to_pay" value={formData.amount_to_pay ?? ''} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.amount_to_pay ? 'border-red-500' : 'border-gray-300'}`} disabled={submitLoading || loading} />
                  </div>
                  {errors.amount_to_pay && <p className="text-red-600 text-xs mt-1">{errors.amount_to_pay}</p>}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">% Chofer</label>
                  <input type="number" value={driverPercentage} onChange={(e) => handlePercentageChange(parseFloat(e.target.value) || 0)} placeholder="17" step="0.1" min="0" max="100" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Viáticos Entregados</label>
              <div className="flex items-center">
                <span className="text-gray-500 px-4 py-2">$</span>
                <input type="number" name="per_diems_delivered" value={formData.per_diems_delivered ?? ''} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.per_diems_delivered ? 'border-red-500' : 'border-gray-300'}`} disabled={submitLoading || loading} />
              </div>
              {errors.per_diems_delivered && <p className="text-red-600 text-xs mt-1">{errors.per_diems_delivered}</p>}
            </div>

            <div className={`transition-opacity ${isDriverOwned ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">KM Inicio</label>
              <input type="number" name="km_start" value={formData.km_start ?? ''} onChange={handleChange} placeholder="0" step="0.01" min="0" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.km_start ? 'border-red-500' : 'border-gray-300'}`} disabled={!isDriverOwned || submitLoading || loading} />
              {errors.km_start && <p className="text-red-600 text-xs mt-1">{errors.km_start}</p>}
              {!isDriverOwned && <p className="text-gray-500 text-xs mt-1">Solo para choferes PROPIO</p>}
            </div>

            <div className={`transition-opacity ${isDriverOwned ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-sm font-medium text-gray-700 mb-1">KM Final</label>
              <input type="number" name="km_end" value={formData.km_end ?? ''} onChange={handleChange} placeholder="0" step="0.01" min="0" className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.km_end ? 'border-red-500' : 'border-gray-300'}`} disabled={!isDriverOwned || submitLoading || loading} />
              {errors.km_end && <p className="text-red-600 text-xs mt-1">{errors.km_end}</p>}
              {!isDriverOwned && <p className="text-gray-500 text-xs mt-1">Solo para choferes PROPIO</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción de la Carga</label>
              <input type="text" name="load_description" value={formData.load_description || ''} onChange={handleChange} placeholder="Ej: Soja, Pallets de papel..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Factura</label>
              <input type="text" name="invoice_number" value={formData.invoice_number || ''} onChange={handleChange} placeholder="Ej: FC-0001-00001234" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Información de Carga</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilos Cargados</label>
              <input type="number" name="loaded_weight_kg" value={formData.loaded_weight_kg ?? ''} onChange={handleChange} placeholder="0" step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kilos Netos</label>
              <input type="number" name="net_weight_kg" value={formData.net_weight_kg ?? ''} onChange={handleChange} placeholder="0" step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa por Kilo ($)</label>
              <input type="number" name="rate_per_kg" value={formData.rate_per_kg ?? ''} onChange={handleChange} placeholder="0.00" step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Gastos Imprevistos</h2>
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
                <input type="text" value={newExpense.detail} onChange={(e) => setNewExpense((prev) => ({ ...prev, detail: e.target.value }))} placeholder="Ej: Peaje, Combustible adicional, etc." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                <input type="number" value={newExpense.amount} onChange={(e) => setNewExpense((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} placeholder="0.00" step="0.01" min="0" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={submitLoading || loading} />
              </div>
            </div>
            <button type="button" onClick={handleAddExpense} disabled={submitLoading || loading} className="w-full bg-blue-100 hover:bg-blue-200 disabled:bg-gray-100 text-blue-700 disabled:text-gray-500 font-medium py-2 rounded-lg transition-colors">+ Agregar Gasto</button>
          </div>

          {formData.unforesee_expenses && formData.unforesee_expenses.length > 0 ? (
            <div className="space-y-2">
              {formData.unforesee_expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{expense.detail}</p>
                    <p className="text-xs text-gray-500">Monto: ${expense.amount.toFixed(2)}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveExpense(expense.id)} disabled={submitLoading || loading} className="ml-3 px-3 py-1 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 text-red-600 disabled:text-gray-400 text-sm font-medium rounded transition-colors">Eliminar</button>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-900">Total de Gastos: <span className="text-blue-600">${formData.unforesee_expenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</span></p>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p className="text-sm">No hay gastos agregados</p>
            </div>
          )}
        </div>
      </div>

      <div className="lg:w-1/3">
        <div className="sticky top-0 space-y-6">
          {formData.driver_id && formData.vehicle_id && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">Resumen Financiero</h2>
              </div>
              <div className="p-6 space-y-6">
                {(formData.loaded_weight_kg || 0) > 0 && (formData.rate_per_kg || 0) > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ingresos</p>
                    <div className="flex justify-between items-center text-gray-900">
                      <span className="text-sm">Flete ({formData.loaded_weight_kg}kg × ${formData.rate_per_kg})</span>
                      <span className="font-semibold">${((formData.loaded_weight_kg || 0) * (formData.rate_per_kg || 0)).toFixed(2)}</span>
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Costos Operativos</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Honorarios del Chofer</span>
                      <span className="text-gray-900 font-medium">${(formData.amount_to_pay || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Viáticos</span>
                      <span className="text-gray-900 font-medium">${(formData.per_diems_delivered || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gastos de Ruta</span>
                      <span className="text-gray-900 font-medium">${(formData.unforesee_expenses || []).reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
                    <span className="text-sm font-bold text-gray-800">Costo Total</span>
                    <span className="text-base font-bold text-red-600">-${(((formData.amount_to_pay || 0) + (formData.per_diems_delivered || 0) + ((formData.unforesee_expenses || []).reduce((sum, exp) => sum + exp.amount, 0)))).toFixed(2)}</span>
                  </div>
                </div>
              </div>
              {(() => {
                const totalRevenue = (formData.loaded_weight_kg || 0) * (formData.rate_per_kg || 0);
                const totalCosts = (formData.amount_to_pay || 0) + (formData.per_diems_delivered || 0) + ((formData.unforesee_expenses || []).reduce((sum, exp) => sum + exp.amount, 0));
                const netProfit = totalRevenue - totalCosts;
                const profitIsPositive = netProfit >= 0;
                return (
                  <div className={`px-6 py-5 ${profitIsPositive ? 'bg-emerald-50 border-t border-emerald-100' : 'bg-red-50 border-t border-red-100'}`}>
                    <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${profitIsPositive ? 'text-emerald-600' : 'text-red-600'}`}>{profitIsPositive ? 'Ganancia Neta' : 'Pérdida Neta'}</p>
                    <div className="flex justify-between items-end">
                      <span className={`text-3xl font-black tracking-tight ${profitIsPositive ? 'text-emerald-700' : 'text-red-700'}`}>${Math.abs(netProfit).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
            <Button type="submit" variant="primary" fullWidth loading={submitLoading} disabled={loading}>Cargar Viaje</Button>
            {onCancel && <Button type="button" variant="secondary" fullWidth onClick={onCancel} disabled={submitLoading || loading}>Cancelar</Button>}
          </div>
        </div>
      </div>
    </form>
  );
};