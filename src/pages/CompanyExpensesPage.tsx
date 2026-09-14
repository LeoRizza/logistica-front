import React, { useState, useEffect, useCallback } from 'react';
import {
  CompanyExpense,
  CreateCompanyExpenseInput,
  UpdateCompanyExpenseInput,
} from '../types/index';
import { CompanyExpenseForm } from '../components/expenses/CompanyExpenseForm';
import { Modal } from '../components/common/Modal';
import { Table } from '../components/common/Table';
import { Button } from '../components/common/Button';
import { useApi } from '../hooks/useApi';

export const CompanyExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<CompanyExpense | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Use the API hook with default base URL
  const { post, get, put, delete: deleteRequest } = useApi();

  const EXPENSE_CATEGORIES = [
    { value: 'SALARIES', label: 'Salarios' },
    { value: 'FUEL', label: 'Combustible' },
    { value: 'MAINTENANCE', label: 'Mantenimiento' },
    { value: 'INSURANCE', label: 'Seguros' },
    { value: 'RENT', label: 'Alquiler' },
    { value: 'UTILITIES', label: 'Servicios' },
    { value: 'OFFICE_SUPPLIES', label: 'Artículos de Oficina' },
    { value: 'EQUIPMENT', label: 'Equipamiento' },
    { value: 'LEGAL', label: 'Trámites Legales' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'OTHER', label: 'Otro' },
  ];

  // Load expenses with useCallback
  const loadExpenses = useCallback(
    async (page: number = 1, search: string = '', category: string = '') => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', String(page));
        params.append('limit', String(pageSize));

        if (search) {
          params.append('search', search);
        }

        if (category) {
          params.append('category', category);
        }

        const response = await get(`/expenses/company?${params.toString()}`);
        if (response && response.data) {
          const expensesData = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];
          setExpenses(expensesData);

          // Update total from paginated response
          if (response.data && response.data.total) {
            setTotalExpenses(response.data.total);
          }
        }
      } catch (error) {
        console.error('Error loading expenses:', error);
      } finally {
        setLoading(false);
      }
    },
    [get, pageSize]
  );

  // Load initial data on mount
  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const handleSubmit = async (
    formData: CreateCompanyExpenseInput | UpdateCompanyExpenseInput
  ) => {
    try {
      setFormLoading(true);
      const response = selectedExpense
        ? await put(`/expenses/company/${selectedExpense.id}`, formData)
        : await post('/expenses/company', formData);

      if (!response || !response.success) {
        throw new Error(
          selectedExpense
            ? 'Error al actualizar el gasto'
            : 'Error al crear el gasto'
        );
      }

      await loadExpenses(currentPage, searchQuery, categoryFilter);
      setShowForm(false);
      setSelectedExpense(null);
      alert(
        selectedExpense
          ? 'Gasto actualizado exitosamente'
          : 'Gasto creado exitosamente'
      );
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(
        selectedExpense
          ? 'Error al actualizar el gasto'
          : 'Error al crear el gasto'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditExpense = (expense: CompanyExpense) => {
    setSelectedExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }

    try {
      const response = await deleteRequest(
        `/expenses/company/${expenseId}`
      );

      if (!response || !response.success) {
        throw new Error('Error al eliminar el gasto');
      }

      await loadExpenses(currentPage, searchQuery, categoryFilter);
      alert('Gasto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error al eliminar el gasto');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedExpense(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadExpenses(newPage, searchQuery, categoryFilter);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    loadExpenses(1, query, categoryFilter);
  };

  const handleCategoryFilter = (category: string) => {
    setCategoryFilter(category);
    setCurrentPage(1);
    loadExpenses(1, searchQuery, category);
  };

  const totalPages = Math.ceil(totalExpenses / pageSize);

  // Calculate total expenses for display
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gastos Generales</h1>
          <p className="text-gray-600 mt-1">
            Gestión de gastos estructurales de la empresa
          </p>
        </div>
        <Button
          onClick={() => {
            setSelectedExpense(null);
            setShowForm(true);
          }}
          variant="primary"
          size="lg"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nuevo Gasto
        </Button>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={
          selectedExpense ? 'Editar Gasto General' : 'Crear Nuevo Gasto General'
        }
        size="lg"
      >
        <CompanyExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          loading={formLoading}
          initialData={
            selectedExpense
              ? {
                  name: selectedExpense.name,
                  description: selectedExpense.description || '',
                  category: selectedExpense.category,
                  amount: selectedExpense.amount,
                  currency: selectedExpense.currency,
                  expense_date: selectedExpense.expense_date ? new Date(selectedExpense.expense_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                  notes: selectedExpense.notes || '',
                }
              : undefined
          }
          isEditing={!!selectedExpense}
        />
      </Modal>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Gastos</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total de Registros</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalExpenses}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-green-600"
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
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Promedio de Gasto</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                ${totalExpenses > 0 ? (totalAmount / totalExpenses).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por nombre
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar gastos..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => handleCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={[
            {
              key: 'expense_date',
              label: 'Fecha del Gasto',
              render: (value) =>
                value ? new Date(value).toLocaleDateString('es-ES') : '-',
              width: '18%',
            },
            {
              key: 'name',
              label: 'Nombre',
              width: '28%',
            },
            {
              key: 'category',
              label: 'Categoría',
              render: (value) => {
                const cat = EXPENSE_CATEGORIES.find((c) => c.value === value);
                return cat ? cat.label : value;
              },
              width: '22%',
            },
            {
              key: 'amount',
              label: 'Monto',
              render: (value, item) =>
                `$${value?.toFixed(2)} ${item.currency || 'USD'}`,
              align: 'right',
              width: '20%',
            },
            {
              key: 'id',
              label: 'Acciones',
              render: (value, item) => (
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => handleEditExpense(item)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition-colors text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDeleteExpense(value)}
                    className="px-3 py-1 bg-red-100 text-red-700 font-medium rounded hover:bg-red-200 transition-colors text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ),
              width: '12%',
            },
          ]}
          data={expenses}
          keyExtractor={(item) => item.id}
          loading={loading}
          emptyMessage="No hay gastos registrados"
          striped
          hover
        />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando página {currentPage} de {totalPages} ({totalExpenses}{' '}
              gastos)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
