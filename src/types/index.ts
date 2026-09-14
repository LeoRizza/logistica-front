// Client Types
export interface Client {
  id: string;
  business_name: string;
  contact_email: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  city: string | null;
  extra_data: Record<string, any> | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateClientInput {
  business_name: string;
  contact_email?: string;
  contact_phone?: string;
  contact_name?: string;
  city?: string;
  extra_data?: Record<string, any>;
}

export interface UpdateClientInput {
  business_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_name?: string;
  city?: string;
  extra_data?: Record<string, any>;
}

// Driver Types
export interface Driver {
  id: string;
  full_name: string;
  type: 'PROPIO' | 'CONTRATADO';
  license_exp_date: string;
  license_number: string;
  phone?: string;
  cuit_cuil?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDriverRequest {
  full_name: string;
  type: 'PROPIO' | 'CONTRATADO';
  license_exp_date: string;
  license_number: string;
  phone?: string;
  cuit_cuil?: string;
  is_active?: boolean;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  plate: string;
  is_owned: boolean;
  truck_rto_exp_date?: string;
  trailer_plate?: string;
  trailer_rto_exp_date?: string;
  truck_insurance_exp_date?: string;
  trailer_insurance_exp_date?: string;
  is_active: boolean;
  vehicle_type: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity_tons?: number;
  capacity_m3?: number;
  registration_number?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateVehicleRequest {
  plate: string;
  is_owned?: boolean;
  truck_rto_exp_date?: string;
  trailer_plate?: string;
  trailer_rto_exp_date?: string;
  truck_insurance_exp_date?: string;
  trailer_insurance_exp_date?: string;
  is_active?: boolean;
  vehicle_type: string;
  brand?: string;
  model?: string;
  year?: number;
  capacity_tons?: number;
  capacity_m3?: number;
  registration_number?: string;
}

// Trip Types
export interface UnforeseeExpense {
  id?: string;
  detail: string;
  amount: number;
}

export interface Trip {
  id: string;
  date: string;
  driver_id: string;
  vehicle_id: string;
  client_id?: string | null;
  bill_of_lading: string;
  reference_number: string;
  estimated_km: number;
  distance_km: number | null;
  km_start?: number;
  km_end?: number;
  amount_to_pay: number;
  estimated_cost: number;
  per_diems_delivered: number;
  unforesee_expenses: UnforeseeExpense[];
  fuelLogs?: FuelLog[];
  scheduled_date: string | Date;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  client?: {
    id: string;
    business_name: string;
  } | null;
}

export interface CreateTripRequest {
  date: string;
  driver_id: string;
  vehicle_id: string;
  client_id?: string;
  bill_of_lading: string;
  estimated_km: number;
  km_start?: number;
  km_end?: number;
  amount_to_pay: number;
  per_diems_delivered: number;
  unforesee_expenses: UnforeseeExpense[];
  fuelLogs?: FuelLog[];
  is_active?: boolean;
  origin?: string;
  destination?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  loaded_weight_kg?: number;
  net_weight_kg?: number;
  rate_per_kg?: number;
  load_description?: string;
  invoice_number?: string;
}

// Settlement Types
export interface TripSummary {
  id: string;
  date: string;
  bill_of_lading: string;
  amount_to_pay: number;
  per_diems_delivered: number;
  unforesee_expenses_total: number;
  actual_km?: number;
  estimated_km: number;
}

export interface SettlementData {
  driver_id: string;
  driver_name: string;
  start_date: string;
  end_date: string;
  trips: TripSummary[];
  total_amount_earned: number;
  total_per_diems_delivered: number;
  total_unforesee_expenses: number;
  total_to_pay: number;
  total_deductions: number;
  fuel_expenses?: number;
  settlement_date?: string;
}

export interface SettlementReceipt extends SettlementData {
  extra_discounts: number;
  bonifications: number;
  final_amount: number;
  payment_method?: string;
  notes?: string;
  created_at?: string;
  created_by_id?: string;
}

export interface SettlementDTO extends SettlementReceipt {
  id: string;
  is_paid: boolean;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

// CompanyExpense Types
export interface CompanyExpense {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  amount: number;
  currency: string;
  expense_date: string | Date;
  due_date?: string | Date | null;
  is_recurring: boolean;
  recurrence_period?: string | null;
  payment_status: string;
  payment_date?: string | Date | null;
  invoice_number?: string | null;
  notes?: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateCompanyExpenseInput {
  name: string;
  description?: string;
  category: string;
  amount: number;
  currency?: string;
  expense_date?: string | Date;
  due_date?: string | Date;
  is_recurring?: boolean;
  recurrence_period?: string;
  invoice_number?: string;
  notes?: string;
  payment_status?: string;
}

export interface UpdateCompanyExpenseInput {
  name?: string;
  description?: string;
  category?: string;
  amount?: number;
  currency?: string;
  expense_date?: string | Date;
  due_date?: string | Date;
  is_recurring?: boolean;
  recurrence_period?: string;
  payment_status?: string;
  payment_date?: string | Date;
  invoice_number?: string;
  notes?: string;
}

// Fuel Types
export interface FuelLog {
  id: string;
  vehicle_id: string;
  trip_id?: string | null;
  liters_loaded: number;
  liters_per_km: number | null;
  distance_km: number | null;
  fuel_price_per_liter: number;
  total_cost: number;
  odometer_reading: number;
  fuel_type: string;
  station_name: string | null;
  location: string | null;
  notes: string | null;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CreateFuelLogInput {
  vehicle_id: string;
  liters_loaded: number;
  fuel_price_per_liter: number;
  odometer_reading: number;
  fuel_type?: string;
  station_name?: string;
  location?: string;
  notes?: string;
  trip_id?: string;
  created_by_id: string;
}

// Dashboard Types
export interface DashboardPnLResponse {
  period: {
    startDate: string | Date;
    endDate: string | Date;
  };
  operatingIncome: {
    totalTrips: number;
    grossRevenue: number;
    tripCosts: {
      totalAmountToPay: number;
      totalPerDiemsDelivered: number;
      totalUnforeseeExpenses: number;
      totalFuelCosts: number;
    };
    netIncome: number;
  };
  indirectCosts: {
    total: number;
    byCategory: Record<string, number>;
  };
  netProfitCompany: number;
  summary: {
    margin: number;
    marginPercentage: string;
  };
}

// API Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  status: string;
  data?: T;
  message?: string;
  timestamp?: string;
}
