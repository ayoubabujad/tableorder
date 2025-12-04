/**
 * Format delivery time in minutes to human-readable format
 * Rules:
 * - Less than 60 min: "45 min"
 * - 60+ min but less than 24 hours: "1 hr 10 min"
 * - 24+ hours: "1 day 2 hr 15 min"
 * - Hide zero units: "1 hr" instead of "1 hr 0 min"
 * - For ranges: "16 hr 49 min – 16 hr 54 min"
 */
export function formatDeliveryTime(minutes, isRange = false, rangeEnd = null) {
  if (isRange && rangeEnd !== null) {
    const startFormatted = formatSingleDeliveryTime(minutes);
    const endFormatted = formatSingleDeliveryTime(rangeEnd);
    return `${startFormatted} – ${endFormatted}`;
  }

  return formatSingleDeliveryTime(minutes);
}

/**
 * Format a single delivery time value
 */
function formatSingleDeliveryTime(totalMinutes) {
  totalMinutes = parseInt(totalMinutes);

  if (totalMinutes < 60) {
    // Less than 60 minutes: show only minutes
    return `${totalMinutes} min`;
  }

  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts = [];

  if (days > 0) {
    parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }

  if (hours > 0) {
    parts.push(`${hours} hr`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  // If no parts (shouldn't happen with positive input), return "0 min"
  if (parts.length === 0) {
    return '0 min';
  }

  return parts.join(' ');
}

export default {
  formatDeliveryTime
};
