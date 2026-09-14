import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, CreateVehicleRequest, PaginatedResponse } from '../types/index';
import { useApi } from '../hooks/useApi';
import { VehicleTable } from '../components/vehicles/VehicleTable';
import { VehicleForm } from '../components/vehicles/VehicleForm';
import { FuelFormModal } from '../components/fuel/FuelFormModal';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

export const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [selectedVehicleForFuel, setSelectedVehicleForFuel] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const { loading, error, get, post, put, delete: del, clearError } = useApi();

  // Fetch vehicles callback - wrapped in useCallback to prevent infinite loops
  const fetchVehicles = useCallback(async () => {
    try {
      const response = await get<PaginatedResponse<Vehicle>>('/vehicles');

      if (response && response.data) {
        // response.data es PaginatedResponse<Vehicle>, extraemos el array de data
        setVehicles(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching vehicles:', err);
    }
  }, [get]);

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenModal = (vehicle?: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(undefined);
  };

  const handleSubmit = async (data: CreateVehicleRequest) => {
    try {
      if (selectedVehicle) {
        // Update existing vehicle
        const result = await put<Vehicle>(`/vehicles/${selectedVehicle.id}`, data);

        if (result && result.data) {
          setVehicles((prev) =>
            prev.map((v) => (v.id === selectedVehicle.id ? result.data : v))
          );
          handleCloseModal();
        }
      } else {
        // Create new vehicle
        const result = await post<Vehicle>('/vehicles', data);

        if (result && result.data) {
          setVehicles((prev) => [...prev, result.data]);
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error('Error submitting vehicle:', err);
    }
  };

  const handleDelete = async (vehicle: Vehicle) => {
    try {
      await del(`/vehicles/${vehicle.id}`);
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id));
    } catch (err) {
      console.error('Error deleting vehicle:', err);
    }
  };

  const handleOpenFuelModal = (vehicle: Vehicle) => {
    setSelectedVehicleForFuel(vehicle);
    setIsFuelModalOpen(true);
  };

  const handleCloseFuelModal = () => {
    setIsFuelModalOpen(false);
    setSelectedVehicleForFuel(null);
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filterActive === 'all' ||
      (filterActive === 'active' && vehicle.is_active) ||
      (filterActive === 'inactive' && !vehicle.is_active);

    return matchesSearch && matchesFilter;
  });

  // Count vehicles by status for stats
  const activeCount = vehicles.filter((v) => v.is_active).length;
  const inactiveCount = vehicles.filter((v) => !v.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Vehículos</h1>
          <p className="text-gray-600 mt-1">
            Administra los vehículos de tu flota
          </p>
        </div>
        <Button
          variant="primary"
          size="lg"
          onClick={() => handleOpenModal()}
        >
          + Nuevo Vehículo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm">Total de Vehículos</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{vehicles.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm">Activos</p>
          <p className="text-3xl font-bold text-green-600 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm">Inactivos</p>
          <p className="text-3xl font-bold text-red-600 mt-2">{inactiveCount}</p>
        </div>
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por patente, marca o modelo..."
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
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <VehicleTable
        vehicles={filteredVehicles}
        loading={loading}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
        onOpenFuel={handleOpenFuelModal}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedVehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        size="lg"
      >
        <VehicleForm
          vehicle={selectedVehicle}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          loading={loading}
        />
      </Modal>

      {/* Fuel Form Modal */}
      <FuelFormModal
        isOpen={isFuelModalOpen}
        onClose={handleCloseFuelModal}
        vehicle={selectedVehicleForFuel}
        onSuccess={() => {
          // Optionally refresh vehicles or handle success
          handleCloseFuelModal();
        }}
      />
    </div>
  );
};
