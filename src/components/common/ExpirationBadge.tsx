import React from 'react';
import { getExpirationDateColor, getExpirationColorClasses, getExpirationMessage, formatDate } from '../../utils/dateUtils';

interface ExpirationBadgeProps {
  date: string | Date | null | undefined;
  showMessage?: boolean;
  showFormattedDate?: boolean;
  compact?: boolean;
}

export const ExpirationBadge: React.FC<ExpirationBadgeProps> = ({
  date,
  showMessage = true,
  showFormattedDate = true,
  compact = false,
}) => {
  const color = getExpirationDateColor(date);
  const colors = getExpirationColorClasses(color);
  const message = getExpirationMessage(date);
  const formattedDate = formatDate(date);

  return (
    <div className={`flex flex-col ${compact ? 'gap-0' : 'gap-1'}`}>
      <span className={`px-2 py-1 rounded-full text-xs font-medium w-fit ${colors.badge}`}>
        {formattedDate}
      </span>
      {showMessage && (
        <span className={`text-xs ${colors.text} font-medium`}>
          {message}
        </span>
      )}
    </div>
  );
};
