import React, { useState, useEffect, useCallback } from 'react';
import { Driver, CreateDriverRequest, PaginatedResponse } from '../types/index';
import { useApi } from '../hooks/useApi';
import { DriverTable } from '../components/drivers/DriverTable';
import { DriverForm } from '../components/drivers/DriverForm';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

// La URL base se configura en useApi por defecto usando REACT_APP_API_BASE_URL

export const DriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { loading, error, get, post, put, delete: del, clearError } = useApi();

  // Fetch drivers on component mount ONLY
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await get<PaginatedResponse<Driver>>('/drivers');
        if (response && response.data) {
          // response.data es PaginatedResponse<Driver>, extraemos el array de data
          setDrivers(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching drivers:', err);
      }
    };

    fetchDrivers();
  }, []);

  const handleOpenModal = useCallback((driver?: Driver) => {
    setSelectedDriver(driver);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedDriver(undefined);
  }, []);

  const handleSubmit = useCallback(async (data: CreateDriverRequest) => {
    try {
      if (selectedDriver) {
        // Update existing driver
        const result = await put<Driver>(`/drivers/${selectedDriver.id}`, data);
        if (result && result.data) {
          setDrivers((prev) =>
            prev.map((d) => (d.id === selectedDriver.id ? result.data : d))
          );
          handleCloseModal();
        }
      } else {
        // Create new driver
        const result = await post<Driver>('/drivers', data);
        if (result && result.data) {
          setDrivers((prev) => [...prev, result.data]);
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error('Error submitting driver:', err);
    }
  }, [selectedDriver, put, post]);

  const handleDelete = useCallback(async (driver: Driver) => {
    try {
      await del(`/drivers/${driver.id}`);
      setDrivers((prev) => prev.filter((d) => d.id !== driver.id));
    } catch (err) {
      console.error('Error deleting driver:', err);
    }
  }, [del]);

  const filteredDrivers = drivers.filter((driver) =>
    driver.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Choferes</h1>
          <p className="text-gray-600 mt-1">
            Administra los choferes de tu flota
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => handleOpenModal()}
        >
          + Nuevo Chofer
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          </div>
          <button
            onClick={clearError}
            className="text-red-400 hover:text-red-600"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar por nombre, licencia o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Drivers Table */}
      <DriverTable
        drivers={filteredDrivers}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedDriver ? 'Editar Chofer' : 'Nuevo Chofer'}
        size="md"
      >
        <DriverForm
          driver={selectedDriver}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={loading}
        />
      </Modal>
    </div>
  );
};
