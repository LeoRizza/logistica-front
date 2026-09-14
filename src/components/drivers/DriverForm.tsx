import React, { useState, useEffect } from 'react';
import { Driver, CreateDriverRequest } from '../../types/index';
import { Button } from '../common/Button';

interface DriverFormProps {
  driver?: Driver;
  onSubmit: (data: CreateDriverRequest) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const defaultValues: CreateDriverRequest = {
  full_name: '',
  type: 'CONTRATADO',
  license_exp_date: '',
  license_number: '',
  phone: '',
  cuit_cuil: '',
  is_active: true,
};

export const DriverForm: React.FC<DriverFormProps> = ({
  driver,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<CreateDriverRequest>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    if (driver) {
      setFormData({
        full_name: driver.full_name,
        type: driver.type,
        license_exp_date: driver.license_exp_date.split('T')[0],
        license_number: driver.license_number,
        phone: driver.phone ?? '',
        cuit_cuil: driver.cuit_cuil ?? '',
        is_active: driver.is_active,
      });
    }
  }, [driver]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'El nombre es requerido';
    }

    if (!formData.license_number.trim()) {
      newErrors.license_number = 'El número de licencia es requerido';
    }

    if (!formData.license_exp_date) {
      newErrors.license_exp_date = 'La fecha de vencimiento es requerida';
    } else {
      const expDate = new Date(formData.license_exp_date);
      if (isNaN(expDate.getTime())) {
        newErrors.license_exp_date = 'Fecha inválida';
      }
    }

    if (formData.cuit_cuil && formData.cuit_cuil.length < 10) {
      newErrors.cuit_cuil = 'El CUIT/CUIL debe tener al menos 10 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const finalValue =
      type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre Completo *
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
          placeholder="Ej: Juan García"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.full_name ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.full_name && (
          <p className="text-red-600 text-xs mt-1">{errors.full_name}</p>
        )}
      </div>

      {/* License Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Número de Licencia *
        </label>
        <input
          type="text"
          name="license_number"
          value={formData.license_number}
          onChange={handleChange}
          placeholder="Ej: ABC123456"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.license_number ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.license_number && (
          <p className="text-red-600 text-xs mt-1">{errors.license_number}</p>
        )}
      </div>

      {/* Driver Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Chofer *
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        >
          <option value="CONTRATADO">Contratado</option>
          <option value="PROPIO">Propio</option>
        </select>
      </div>

      {/* License Expiration Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vencimiento de Licencia *
        </label>
        <input
          type="date"
          name="license_exp_date"
          value={formData.license_exp_date}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.license_exp_date ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.license_exp_date && (
          <p className="text-red-600 text-xs mt-1">{errors.license_exp_date}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Ej: +34 666 123 456"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={submitLoading || loading}
        />
      </div>

      {/* CUIT / CUIL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          CUIT / CUIL
        </label>
        <input
          type="text"
          name="cuit_cuil"
          value={formData.cuit_cuil ?? ''}
          onChange={handleChange}
          placeholder="Ej: 20-36011935-9"
          className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.cuit_cuil ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={submitLoading || loading}
        />
        {errors.cuit_cuil && (
          <p className="text-red-600 text-xs mt-1">{errors.cuit_cuil}</p>
        )}
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
          {driver ? 'Actualizar' : 'Crear'} Chofer
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
