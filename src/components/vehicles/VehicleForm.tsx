import React, { useState, useEffect } from 'react';
import { Vehicle, CreateVehicleRequest } from '../../types/index';
import { Button } from '../common/Button';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: CreateVehicleRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const defaultValues: CreateVehicleRequest = {
  plate: '',
  is_owned: true,
  truck_rto_exp_date: '',
  trailer_plate: '',
  trailer_rto_exp_date: '',
  truck_insurance_exp_date: '',
  trailer_insurance_exp_date: '',
  is_active: true,
  vehicle_type: 'Camion',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  capacity_tons: undefined,
  capacity_m3: undefined,
  registration_number: '',
};

export const VehicleForm: React.FC<VehicleFormProps> = ({
  vehicle,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateVehicleRequest>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        is_owned: vehicle.is_owned,
        truck_rto_exp_date: vehicle.truck_rto_exp_date?.split('T')[0] || '',
        trailer_plate: vehicle.trailer_plate || '',
        trailer_rto_exp_date: vehicle.trailer_rto_exp_date?.split('T')[0] || '',
        truck_insurance_exp_date: vehicle.truck_insurance_exp_date?.split('T')[0] || '',
        trailer_insurance_exp_date: vehicle.trailer_insurance_exp_date?.split('T')[0] || '',
        is_active: vehicle.is_active,
        vehicle_type: vehicle.vehicle_type,
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        capacity_tons: vehicle.capacity_tons,
        capacity_m3: vehicle.capacity_m3,
        registration_number: vehicle.registration_number || '',
      });
    }
  }, [vehicle]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.plate.trim()) {
      newErrors.plate = 'La patente es requerida';
    } else if (!/^[A-Z0-9]{2,7}$/.test(formData.plate.toUpperCase())) {
      newErrors.plate = 'Formato de patente invalido';
    }

    if (!formData.vehicle_type.trim()) {
      newErrors.vehicle_type = 'El tipo de vehiculo es requerido';
    }

    if (formData.truck_rto_exp_date) {
      const expDate = new Date(formData.truck_rto_exp_date);
      if (isNaN(expDate.getTime())) {
        newErrors.truck_rto_exp_date = 'Fecha invalida';
      }
    }

    if (formData.trailer_rto_exp_date) {
      const expDate = new Date(formData.trailer_rto_exp_date);
      if (isNaN(expDate.getTime())) {
        newErrors.trailer_rto_exp_date = 'Fecha invalida';
      }
    }

    if (formData.truck_insurance_exp_date) {
      const expDate = new Date(formData.truck_insurance_exp_date);
      if (isNaN(expDate.getTime())) {
        newErrors.truck_insurance_exp_date = 'Fecha invalida';
      }
    }

    if (formData.trailer_insurance_exp_date) {
      const expDate = new Date(formData.trailer_insurance_exp_date);
      if (isNaN(expDate.getTime())) {
        newErrors.trailer_insurance_exp_date = 'Fecha invalida';
      }
    }

    if (formData.year && (formData.year < 1900 || formData.year > new Date().getFullYear() + 1)) {
      newErrors.year = 'Ano invalido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (type === 'number') {
      finalValue = value ? parseFloat(value) : undefined;
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
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
      {/* Plate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patente *
        </label>
        <input
          type="text"
          name="plate"
          value={formData.plate}
          onChange={handleChange}
          placeholder="Ej: ABC1234"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase ${
            errors.plate ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.plate && (
          <p className="text-red-600 text-xs mt-1">{errors.plate}</p>
        )}
      </div>

      {/* Vehicle Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Vehiculo *
        </label>
        <input
          type="text"
          name="vehicle_type"
          value={formData.vehicle_type}
          onChange={handleChange}
          placeholder="Ej: Camion, Acoplado, Furgon"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.vehicle_type ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.vehicle_type && (
          <p className="text-red-600 text-xs mt-1">{errors.vehicle_type}</p>
        )}
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Marca
        </label>
        <input
          type="text"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          placeholder="Ej: Scania, Volvo, Mercedes"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        />
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Modelo
        </label>
        <input
          type="text"
          name="model"
          value={formData.model}
          onChange={handleChange}
          placeholder="Ej: R580, FH16"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        />
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ano
        </label>
        <input
          type="number"
          name="year"
          value={formData.year || ''}
          onChange={handleChange}
          min="1900"
          max={new Date().getFullYear() + 1}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.year ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.year && (
          <p className="text-red-600 text-xs mt-1">{errors.year}</p>
        )}
      </div>

      {/* Capacity in tons */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacidad (toneladas)
        </label>
        <input
          type="number"
          name="capacity_tons"
          value={formData.capacity_tons || ''}
          onChange={handleChange}
          placeholder="Ej: 25"
          step="0.1"
          min="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        />
      </div>

      {/* Capacity in m3 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Capacidad (m3)
        </label>
        <input
          type="number"
          name="capacity_m3"
          value={formData.capacity_m3 || ''}
          onChange={handleChange}
          placeholder="Ej: 40"
          step="0.1"
          min="0"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        />
      </div>

      {/* Registration Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Numero de Registro
        </label>
        <input
          type="text"
          name="registration_number"
          value={formData.registration_number}
          onChange={handleChange}
          placeholder="Ej: REG123456"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        />
      </div>

      {/* Truck RTO Expiration Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vencimiento RTO (Camion)
        </label>
        <input
          type="date"
          name="truck_rto_exp_date"
          value={formData.truck_rto_exp_date}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.truck_rto_exp_date ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.truck_rto_exp_date && (
          <p className="text-red-600 text-xs mt-1">{errors.truck_rto_exp_date}</p>
        )}
      </div>

      {/* Truck Insurance Expiration Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vencimiento Seguro (Camion)
        </label>
        <input
          type="date"
          name="truck_insurance_exp_date"
          value={formData.truck_insurance_exp_date}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.truck_insurance_exp_date ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.truck_insurance_exp_date && (
          <p className="text-red-600 text-xs mt-1">{errors.truck_insurance_exp_date}</p>
        )}
      </div>

      {/* Trailer Plate */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Patente Acoplado
        </label>
        <input
          type="text"
          name="trailer_plate"
          value={formData.trailer_plate}
          onChange={handleChange}
          placeholder="Ej: DEF5678"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
          disabled={submitLoading || loading}
        />
      </div>

      {/* Trailer RTO Expiration Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vencimiento RTO (Acoplado)
        </label>
        <input
          type="date"
          name="trailer_rto_exp_date"
          value={formData.trailer_rto_exp_date}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.trailer_rto_exp_date ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.trailer_rto_exp_date && (
          <p className="text-red-600 text-xs mt-1">{errors.trailer_rto_exp_date}</p>
        )}
      </div>

      {/* Trailer Insurance Expiration Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vencimiento Seguro (Acoplado)
        </label>
        <input
          type="date"
          name="trailer_insurance_exp_date"
          value={formData.trailer_insurance_exp_date}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.trailer_insurance_exp_date ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.trailer_insurance_exp_date && (
          <p className="text-red-600 text-xs mt-1">{errors.trailer_insurance_exp_date}</p>
        )}
      </div>

      {/* Ownership */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_owned"
          name="is_owned"
          checked={formData.is_owned}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
          disabled={submitLoading || loading}
        />
        <label htmlFor="is_owned" className="text-sm font-medium text-gray-700">
          Vehiculo Propio
        </label>
      </div>

      {/* Active Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_active"
          name="is_active"
          checked={formData.is_active}
          onChange={handleChange}
          className="w-4 h-4 rounded border-gray-300 text-blue-600"
          disabled={submitLoading || loading}
        />
        <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
          Activo
        </label>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={submitLoading}
          disabled={loading}
        >
          {vehicle ? 'Actualizar' : 'Crear'} Vehiculo
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
    </form>
  );
};
