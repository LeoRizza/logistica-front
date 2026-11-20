import React, { useState, useEffect, useCallback } from 'react';
import { Trip, Driver, Vehicle, Client, CreateTripRequest } from '../types/index';
import { TripForm } from '../components/trips/TripForm';
import { Modal } from '../components/common/Modal';
import { useApi } from '../hooks/useApi';

const checkTripCompletion = (trip: any): { isComplete: boolean; missing: string[] } => {
  const missing: string[] = [];
  if (!trip.origin?.trim()) missing.push('Origen');
  if (!trip.destination?.trim()) missing.push('Destino');
  if (!trip.scheduled_date && !trip.date) missing.push('Fecha');
  if (!trip.distance_km || trip.distance_km <= 0) missing.push('Distancia');
  if (!trip.loaded_weight_kg || trip.loaded_weight_kg <= 0) missing.push('Kilos Cargados');
  if (!trip.net_weight_kg || trip.net_weight_kg <= 0) missing.push('Kilos Netos');
  if (!trip.rate_per_kg || trip.rate_per_kg <= 0) missing.push('Tarifa');
  if (!trip.invoice_number?.trim()) missing.push('Factura');
  const hasPay = (trip.amount_to_pay && trip.amount_to_pay > 0) || (trip.actual_cost && trip.actual_cost > 0);
  if (!hasPay) missing.push('Monto a Pagar');
  return { isComplete: missing.length === 0, missing };
};

const toDateString = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString().split('T')[0] : String(value).split('T')[0];
};

export const TripsPage: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchText, setSearchText] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTrips, setTotalTrips] = useState<number>(0);
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const LIMIT = 50;

  const { post, get, put } = useApi();

  const loadDrivers = useCallback(async () => {
    try {
      const response = await get('/drivers?limit=100');
      if (response && response.data) {
        setDrivers(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  }, [get]);

  const loadVehicles = useCallback(async () => {
    try {
      const response = await get('/vehicles?limit=100');
      if (response && response.data) {
        setVehicles(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  }, [get]);

  const loadClients = useCallback(async () => {
    try {
      const response = await get('/clients?limit=100');
      if (response && response.data) {
        setClients(Array.isArray(response.data) ? response.data : response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  }, [get]);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', String(LIMIT));
      if (selectedDriverId) params.set('driver_id', selectedDriverId);
      if (selectedClientId) params.set('client_id', selectedClientId);
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (debouncedSearch) params.set('search', debouncedSearch);
      const response = await get(`/trips?${params.toString()}`);
      if (response && response.data) {
        const payload = response.data;
        if (Array.isArray(payload)) {
          setTrips(payload);
          setTotalTrips(payload.length);
          setTotalPages(1);
        } else {
          setTrips(payload.data || []);
          setTotalTrips(payload.total ?? (payload.data?.length || 0));
          setTotalPages(Math.max(1, payload.totalPages ?? 1));
        }
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    } finally {
      setLoading(false);
    }
  }, [get, page, selectedDriverId, selectedClientId, startDate, endDate, debouncedSearch]);

  useEffect(() => {
    loadDrivers();
    loadVehicles();
    loadClients();
  }, [loadDrivers, loadVehicles, loadClients]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPage(1);
  }, [selectedDriverId, selectedClientId, startDate, endDate, debouncedSearch]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  const handleSubmit = async (formData: CreateTripRequest) => {
    try {
      setFormLoading(true);
      const tripId = selectedTrip?.id;
      const response = selectedTrip && tripId
        ? await put(`/trips/${tripId}`, formData)
        : await post('/trips', formData);

      if (!response || !response.success) {
        throw new Error(selectedTrip ? 'Error al actualizar el viaje' : 'Error al crear el viaje');
      }

      await loadTrips();
      setShowForm(false);
      setSelectedTrip(null);
      alert(selectedTrip ? 'Viaje actualizado exitosamente' : 'Viaje cargado exitosamente');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(selectedTrip ? 'Error al actualizar el viaje' : 'Error al cargar el viaje');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditTrip = (trip: Trip) => {
    setSelectedTrip(trip);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTrip(null);
  };





  const handleClearFilters = () => {
    setSelectedDriverId('');
    setSelectedClientId('');
    setStartDate('');
    setEndDate('');
    setSearchText('');
    setPage(1);
  };

  const mappedInitialData: Partial<CreateTripRequest> | undefined = selectedTrip
    ? {
      date: selectedTrip.scheduled_date
        ? new Date(selectedTrip.scheduled_date).toISOString().split('T')[0]
        : new Date(selectedTrip.created_at).toISOString().split('T')[0],
      driver_id: selectedTrip.driver_id,
      vehicle_id: selectedTrip.vehicle_id,
      client_id: selectedTrip.client_id ?? null,
      reference_number: selectedTrip.reference_number ?? null,
      bill_of_lading: selectedTrip.bill_of_lading ?? null,
      estimated_km: selectedTrip.estimated_km,
      km_start: selectedTrip.km_start,
      km_end: selectedTrip.km_end,
      amount_to_pay: selectedTrip.amount_to_pay ?? (selectedTrip as any).actual_cost ?? null,
      per_diems_delivered: selectedTrip.per_diems_delivered,
      unforesee_expenses: selectedTrip.unforesee_expenses || [],
      fuelLogs: selectedTrip.fuelLogs && Array.isArray(selectedTrip.fuelLogs) ? selectedTrip.fuelLogs : [],
      is_active: selectedTrip.is_active,
      origin: selectedTrip.origin ?? null,
      destination: selectedTrip.destination ?? null,
      scheduled_date: toDateString(selectedTrip.scheduled_date),
      actual_start_date: toDateString(selectedTrip.actual_start_date),
      actual_end_date: toDateString(selectedTrip.actual_end_date),
      status: 'COMPLETED',
      distance_km: selectedTrip.distance_km,
      estimated_cost: selectedTrip.estimated_cost,
      loaded_weight_kg: (selectedTrip as any).loaded_weight_kg ?? null,
      net_weight_kg: (selectedTrip as any).net_weight_kg ?? null,
      rate_per_kg: (selectedTrip as any).rate_per_kg ?? null,
      load_description: (selectedTrip as any).load_description ?? null,
      invoice_number: (selectedTrip as any).invoice_number ?? null,
      ctg: (selectedTrip as any).ctg ?? null,
    }
    : undefined;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Viajes</h1>
          <p className="text-gray-600 mt-1">Gestión de viajes y cargas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Viaje
        </button>
      </div>

      <Modal isOpen={showForm} onClose={handleCloseForm} title={selectedTrip ? 'Editar Viaje' : 'Cargar Nuevo Viaje'} size="xl">
        <TripForm drivers={drivers} vehicles={vehicles} clients={clients} onSubmit={handleSubmit} onCancel={handleCloseForm} loading={formLoading} initialData={mappedInitialData} />
      </Modal>



      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
            <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Referencia, Origen, Destino, CTG, Chofer, Vehículo..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Chofer</label>
            <select value={selectedDriverId} onChange={(e) => setSelectedDriverId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Todos los choferes --</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>{driver.full_name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">-- Todos los clientes --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.business_name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex items-end">
            <button onClick={handleClearFilters} className="w-full px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Limpiar Filtros</button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Acciones</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Chofer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Vehículo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Origen</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Destino</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Referencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">Factura</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">Ganancia Neta</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center"><div className="inline-block"><div className="h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div></div></td></tr>
              ) : trips.length === 0 ? (
                <tr><td colSpan={10} className="px-6 py-8 text-center text-gray-500">No hay viajes registrados</td></tr>
              ) : (
                trips.map((trip) => {
                  const driver = drivers.find((d) => d.id === trip.driver_id);
                  const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
                  const { isComplete, missing: missingFields } = checkTripCompletion(trip);
                  return (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center"><button onClick={() => handleEditTrip(trip)} className="px-3 py-1 bg-blue-100 text-blue-700 font-medium rounded hover:bg-blue-200 transition-colors text-xs">Editar</button></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(() => {
                          const dateStr = trip.scheduled_date || trip.created_at;
                          if (!dateStr) return '-';
                          // Toma "2026-10-30T00:00:00.000Z", lo separa por la "T" y divide el "2026-10-30" por guiones
                          const parts = String(dateStr).split('T')[0].split('-');
                          if (parts.length !== 3) return '-';
                          // Devuelve DD/MM/YYYY
                          return `${parts[2]}/${parts[1]}/${parts[0]}`;
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{driver?.full_name || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vehicle?.plate || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.origin || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.destination || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.reference_number || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{(trip as any).invoice_number ? <span className="text-gray-800 font-medium">{(trip as any).invoice_number}</span> : <span className="text-red-700 text-xs font-medium">Sin Factura</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                        {(() => {
                          const revenue = Number(trip.estimated_cost) || 0;
                          const driverPay = Number((trip as any).amount_to_pay ?? (trip as any).actual_cost ?? 0);
                          const perDiems = Number(trip.per_diems_delivered) || 0;
                          const expenses = (trip.unforesee_expenses || []).reduce((sum: number, exp: any) => sum + (Number(exp.amount) || 0), 0);
                          const netProfit = revenue - (driverPay + perDiems + expenses);
                          const isPositive = netProfit >= 0;
                          return (
                            <span className={isPositive ? 'text-emerald-600' : 'text-red-600'}>
                              {isPositive ? '' : '-'}${Math.abs(netProfit).toFixed(2)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">{isComplete ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">✓ Completo</span> : <span title={missingFields.join(', ')} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">⚠️ Pendiente</span>}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Página <span className="font-semibold text-gray-900">{page}</span> de{' '}
            <span className="font-semibold text-gray-900">{totalPages}</span> — Total:{' '}
            <span className="font-semibold text-gray-900">{totalTrips}</span> viajes
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};