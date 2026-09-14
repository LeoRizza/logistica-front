import React, { useState, useEffect, useCallback } from 'react';
import { Client, CreateClientInput, UpdateClientInput } from '../types/index';
import { ClientForm } from '../components/clients/ClientForm';
import { Modal } from '../components/common/Modal';
import { useApi } from '../hooks/useApi';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalClients, setTotalClients] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Use the API hook with default base URL
  const { post, get, put, delete: deleteRequest } = useApi();

  // Load clients with useCallback
  const loadClients = useCallback(async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(pageSize));

      const response = await get(`/clients?${params.toString()}`);
      if (response && response.data) {
        const clientsData = Array.isArray(response.data) ? response.data : response.data.data || [];
        setClients(clientsData);

        // Update total from paginated response
        if (response.data && response.data.total) {
          setTotalClients(response.data.total);
        }
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  }, [get, pageSize]);

  // Load initial data on mount
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleSubmit = async (formData: CreateClientInput | UpdateClientInput) => {
    try {
      setFormLoading(true);
      const response = selectedClient
        ? await put(`/clients/${selectedClient.id}`, formData)
        : await post('/clients', formData);

      if (!response || !response.success) {
        throw new Error(selectedClient ? 'Error al actualizar el cliente' : 'Error al crear el cliente');
      }

      await loadClients(currentPage);
      setShowForm(false);
      setSelectedClient(null);
      alert(selectedClient ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(selectedClient ? 'Error al actualizar el cliente' : 'Error al crear el cliente');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowForm(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      return;
    }

    try {
      const response = await deleteRequest(`/clients/${clientId}`);

      if (!response || !response.success) {
        throw new Error('Error al eliminar el cliente');
      }

      await loadClients(currentPage);
      alert('Cliente eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Error al eliminar el cliente');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedClient(null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadClients(newPage);
  };

  const totalPages = Math.ceil(totalClients / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestión de clientes y contactos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
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
          Nuevo Cliente
        </button>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={selectedClient ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
        size="lg"
      >
        <ClientForm
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          loading={formLoading}
          initialData={selectedClient ? {
            business_name: selectedClient.business_name,
            contact_email: selectedClient.contact_email || '',
            contact_phone: selectedClient.contact_phone || '',
            contact_name: selectedClient.contact_name || '',
            city: selectedClient.city || '',
          } : undefined}
          isEditing={!!selectedClient}
        />
      </Modal>

      {/* Clients Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Razón Social
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Ciudad
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="inline-block">
                      <div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No hay clientes registrados
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.business_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.contact_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.contact_email ? (
                        <a
                          href={`mailto:${client.contact_email}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {client.contact_email}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.contact_phone ? (
                        <a
                          href={`tel:${client.contact_phone}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {client.contact_phone}
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {client.city || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center space-x-2">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition-colors text-xs"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        className="px-3 py-1 bg-red-100 text-red-700 font-medium rounded hover:bg-red-200 transition-colors text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando página {currentPage} de {totalPages} ({totalClients} clientes)
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
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
              ))}
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
