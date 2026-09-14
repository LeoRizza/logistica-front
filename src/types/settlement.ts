/**
 * Settlement Types for Frontend
 */

export interface TripSummary {
  id: string;
  date: string;
  reference_number: string;
  estimated_cost: number;
  actual_cost: number;
  tripExpenses_total: number;
  per_diems_delivered: number;
  distance_km?: number;
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
