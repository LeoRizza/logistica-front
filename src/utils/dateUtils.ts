/**
 * Utility functions for date handling and color logic for expiration dates
 */

/**
 * Determines the color status of an expiration date
 * @param expirationDate - The expiration date string (ISO format or similar)
 * @returns 'red' if date is in the past, 'yellow' if within 15 days, 'green' otherwise
 */
export const getExpirationDateColor = (expirationDate: string | Date | null | undefined): 'red' | 'yellow' | 'green' => {
  if (!expirationDate) return 'green';

  const expDate = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDateNormalized = new Date(expDate);
  expDateNormalized.setHours(0, 0, 0, 0);

  // If expiration date is in the past
  if (expDateNormalized < today) {
    return 'red';
  }

  // Calculate days until expiration
  const timeDiff = expDateNormalized.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // If expires within 15 days
  if (daysDiff <= 15) {
    return 'yellow';
  }

  return 'green';
};

/**
 * Gets the Tailwind CSS classes for the color status
 * @param color - The color status
 * @returns Tailwind classes for background and text
 */
export const getExpirationColorClasses = (color: 'red' | 'yellow' | 'green'): { bg: string; text: string; badge: string } => {
  switch (color) {
    case 'red':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800',
      };
    case 'yellow':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800',
      };
    case 'green':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        badge: 'bg-green-100 text-green-800',
      };
  }
};

/**
 * Formats a date to a readable string
 * @param date - The date to format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-';

  const dateObj = new Date(date);
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  return `${day}/${month}/${year}`;
};

/**
 * Calculates the number of days until expiration
 * @param expirationDate - The expiration date
 * @returns Number of days remaining (negative if expired)
 */
export const getDaysUntilExpiration = (expirationDate: string | Date | null | undefined): number | null => {
  if (!expirationDate) return null;

  const expDate = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDateNormalized = new Date(expDate);
  expDateNormalized.setHours(0, 0, 0, 0);

  const timeDiff = expDateNormalized.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

/**
 * Gets a message describing the expiration status
 * @param expirationDate - The expiration date
 * @returns A descriptive message
 */
export const getExpirationMessage = (expirationDate: string | Date | null | undefined): string => {
  const days = getDaysUntilExpiration(expirationDate);

  if (days === null) return 'Sin fecha';
  if (days < 0) return `Venció hace ${Math.abs(days)} días`;
  if (days === 0) return 'Vence hoy';
  if (days <= 15) return `Vence en ${days} días`;
  return `Vence en ${days} días`;
};

/**
 * Formats a number as currency (Argentine Pesos)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
