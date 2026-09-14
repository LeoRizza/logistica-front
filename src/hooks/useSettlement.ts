/**
 * Settlement Hook
 * Hook para manejar la lógica de liquidaciones
 */

import { useState, useCallback } from 'react';
import { SettlementData, SettlementReceipt } from '../types/settlement';
import { useApi } from './useApi';

interface UseSettlementReturn {
  settlementData: SettlementData | null;
  loading: boolean;
  error: string | null;
  calculateSettlement: (
    driverId: string,
    startDate: string,
    endDate: string
  ) => Promise<void>;
  createReceipt: (
    settlement: SettlementData,
    extraDiscounts: number,
    bonifications: number
  ) => SettlementReceipt;
  saveSettlement: (receipt: SettlementReceipt) => Promise<SettlementReceipt>;
}

export const useSettlement = (): UseSettlementReturn => {
  const [settlementData, setSettlementData] = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { get, post } = useApi();

  const calculateSettlement = useCallback(
    async (driverId: string, startDate: string, endDate: string) => {
      setLoading(true);
      setError(null);
      try {
        const response = await get<SettlementData>(
          `/settlements/calculate?driver_id=${driverId}&start_date=${startDate}&end_date=${endDate}`
        );

        if (response && response.data) {
          setSettlementData(response.data);
        } else {
          throw new Error(response?.message || 'Failed to calculate settlement');
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Error calculating settlement';
        setError(errorMessage);
        setSettlementData(null);
      } finally {
        setLoading(false);
      }
    },
    [get]
  );

  const createReceipt = useCallback(
    (settlement: SettlementData, extraDiscounts: number, bonifications: number): SettlementReceipt => {
      const finalAmount = settlement.total_to_pay - extraDiscounts + bonifications;

      return {
        ...settlement,
        extra_discounts: extraDiscounts,
        bonifications: bonifications,
        final_amount: finalAmount,
      };
    },
    []
  );

  const saveSettlement = useCallback(
    async (receipt: SettlementReceipt) => {
      setLoading(true);
      setError(null);
      try {
        const response = await post<SettlementReceipt>('/settlements', {
          ...receipt,
          trips: [],
        });

        if (response && response.data) {
          return response.data;
        } else {
          throw new Error('Failed to save settlement');
        }
      } catch (err: any) {
        const errorMessage = err instanceof Error ? err.message : 'Error saving settlement';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [post]
  );

  return {
    settlementData,
    loading,
    error,
    calculateSettlement,
    createReceipt,
    saveSettlement,
  };
};
