import React, { useState, useEffect } from 'react';
import { CreateCompanyExpenseInput, UpdateCompanyExpenseInput } from '../../types/index';
import { Button } from '../common/Button';

interface CompanyExpenseFormProps {
  onSubmit: (data: CreateCompanyExpenseInput | UpdateCompanyExpenseInput) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  initialData?: Partial<CreateCompanyExpenseInput>;
  isEditing?: boolean;
}

const EXPENSE_CATEGORIES = [
  { value: 'SALARIES', label: 'Salarios' },
  { value: 'FUEL', label: 'Combustible' },
  { value: 'MAINTENANCE', label: 'Mantenimiento' },
  { value: 'INSURANCE', label: 'Seguros' },
  { value: 'RENT', label: 'Alquiler' },
  { value: 'UTILITIES', label: 'Servicios (Luz, Agua, Gas)' },
  { value: 'OFFICE_SUPPLIES', label: 'Artículos de Oficina' },
  { value: 'EQUIPMENT', label: 'Equipamiento' },
  { value: 'LEGAL', label: 'Trámites Legales' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'OTHER', label: 'Otro' },
];

const defaultValues: CreateCompanyExpenseInput = {
  name: '',
  category: 'OTHER',
  amount: 0,
  currency: 'USD',
  description: '',
  expense_date: new Date().toISOString().split('T')[0],
  notes: '',
};

export const CompanyExpenseForm: React.FC<CompanyExpenseFormProps> = ({
  onSubmit,
  onCancel,
  loading = false,
  initialData,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState<CreateCompanyExpenseInput>(defaultValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Initialize form with data when editing
  useEffect(() => {
    if (initialData) {
      // Convertir expense_date a string YYYY-MM-DD si es Date
      let expenseDate: string;
      if (initialData.expense_date) {
        if (typeof initialData.expense_date === 'string') {
          expenseDate = initialData.expense_date;
        } else if (initialData.expense_date instanceof Date) {
          expenseDate = initialData.expense_date.toISOString().split('T')[0];
        } else {
          expenseDate = new Date().toISOString().split('T')[0];
        }
      } else {
        expenseDate = new Date().toISOString().split('T')[0];
      }

      setFormData({
        ...defaultValues,
        ...initialData,
        expense_date: expenseDate,
      });
    } else {
      setFormData(defaultValues);
    }
    setErrors({});
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'El nombre del gasto es requerido';
    }

    if (!formData.category || !formData.category.trim()) {
      newErrors.category = 'La categoría es requerida';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (!formData.expense_date) {
      newErrors.expense_date = 'La fecha del gasto es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'number'
          ? value === ''
            ? 0
            : parseFloat(value)
          : value,
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
          Información del Gasto
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nombre del Gasto */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Gasto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ej: Pago de Luz, Alquiler Oficina"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.name && (
              <p className="text-red-600 text-xs mt-1">{errors.name}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            >
              <option value="">Selecciona una categoría</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-600 text-xs mt-1">{errors.category}</p>
            )}
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto ($) *
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              min="0"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.amount && (
              <p className="text-red-600 text-xs mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Fecha del Comprobante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha del Comprobante *
            </label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date && typeof formData.expense_date === 'string' ? formData.expense_date : ''}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.expense_date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={submitLoading || loading}
            />
            {errors.expense_date && (
              <p className="text-red-600 text-xs mt-1">{errors.expense_date}</p>
            )}
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda
            </label>
            <select
              name="currency"
              value={formData.currency || 'USD'}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              placeholder="Detalles adicionales del gasto..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>

          {/* Notas */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Observaciones o comentarios..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={submitLoading || loading}
            />
          </div>
        </div>
      </div>

      {/* Resumen del Gasto */}
      {formData.name && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen del Gasto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Nombre
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formData.name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Categoría
              </p>
              <p className="text-sm font-medium text-gray-900">
                {EXPENSE_CATEGORIES.find((c) => c.value === formData.category)
                  ?.label || 'No especificada'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Monto
              </p>
              <p className="text-sm font-medium text-gray-900">
                ${formData.amount?.toFixed(2) || '0.00'} {formData.currency}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide">
                Fecha
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formData.expense_date
                  ? new Date(
                      typeof formData.expense_date === 'string'
                        ? formData.expense_date + 'T00:00:00'
                        : formData.expense_date
                    ).toLocaleDateString('es-ES')
                  : 'No especificada'}
              </p>
            </div>
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
          {isEditing ? 'Actualizar Gasto' : 'Crear Gasto'}
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
