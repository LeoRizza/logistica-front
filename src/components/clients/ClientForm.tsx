import React, { useState, useEffect } from 'react';
import { CreateClientInput, UpdateClientInput } from '../../types/index';
import { Button } from '../common/Button';

interface ClientFormProps {
  onSubmit: (data: CreateClientInput | UpdateClientInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<CreateClientInput>;
  isEditing?: boolean;
}

const defaultValues: CreateClientInput = {
  business_name: '',
  contact_email: '',
  contact_phone: '',
  contact_name: '',
  city: '',
};

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateClientInput>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Initialize form with data when editing (initialData present)
  useEffect(() => {
    if (initialData) {
      // Modo edición: combinar initialData con defaultValues
      setFormData((prev) => ({
        ...defaultValues,
        ...initialData,
      }));
    } else {
      // Modo creación: resetear a defaultValues limpios
      setFormData(defaultValues);
    }
    setErrors({});
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.business_name || !formData.business_name.trim()) {
      newErrors.business_name = 'La razón social es requerida';
    }

    // Validar email si se proporciona
    if (formData.contact_email && formData.contact_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.contact_email.trim())) {
        newErrors.contact_email = 'El email no es válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información Principal */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Cliente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Razón Social */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Razón Social *
            </label>
            <input
              type="text"
              name="business_name"
              value={formData.business_name}
              onChange={handleChange}
              placeholder="Ej: Empresa S.A., Transportes XYZ"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.business_name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.business_name && (
              <p className="text-red-600 text-xs mt-1">{errors.business_name}</p>
            )}
          </div>

          {/* Nombre de Contacto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de Contacto
            </label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name || ''}
              onChange={handleChange}
              placeholder="Ej: Juan Pérez"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contact_name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.contact_name && (
              <p className="text-red-600 text-xs mt-1">{errors.contact_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email || ''}
              onChange={handleChange}
              placeholder="contacto@empresa.com"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contact_email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.contact_email && (
              <p className="text-red-600 text-xs mt-1">{errors.contact_email}</p>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone || ''}
              onChange={handleChange}
              placeholder="+54 9 11 1234-5678"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.contact_phone ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.contact_phone && (
              <p className="text-red-600 text-xs mt-1">{errors.contact_phone}</p>
            )}
          </div>

          {/* Ciudad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              name="city"
              value={formData.city || ''}
              onChange={handleChange}
              placeholder="Ej: Buenos Aires, Córdoba"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.city ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.city && (
              <p className="text-red-600 text-xs mt-1">{errors.city}</p>
            )}
          </div>
        </div>
      </div>

      {/* Información de Resumen */}
      {formData.business_name && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen del Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Razón Social
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formData.business_name}
              </p>
            </div>
            {formData.contact_name && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  Contacto
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.contact_name}
                </p>
              </div>
            )}
            {formData.contact_email && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.contact_email}
                </p>
              </div>
            )}
            {formData.contact_phone && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  Teléfono
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.contact_phone}
                </p>
              </div>
            )}
            {formData.city && (
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">
                  Ciudad
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.city}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t border-gray-200">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          loading={submitLoading}
          disabled={loading}
        >
          {isEditing ? 'Actualizar Cliente' : 'Crear Cliente'}
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
