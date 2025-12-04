/**
 * Utility functions for handling message translation overrides
 */

/**
 * Translates a message key or returns the original message if it's not a key
 * @param {string} message - The message from API or translation key
 * @param {object} $t - Vue i18n translation function
 * @returns {string} - Translated message or original text
 */
export function translateMessage(message, $t) {
  // If the message is empty or null, return empty string
  if (!message || typeof message !== 'string') {
    return message || '';
  }

  // Check if it's a translation key
  if (message === 'pickup_collection_confirm' || message === 'pickup_information') {
    return $t(message);
  }

  // Add more translation keys as needed
  const translationKeys = [
    'pickup_collection_confirm',
    'pickup_information',
    'order_received',
    'payment_successful',
    'booking_confirmed'
  ];

  if (translationKeys.includes(message)) {
    return $t(message);
  }

  // Return original message if it's not a translation key
  return message;
}

/**
 * Processes API response data to ensure all messages are properly translated
 * @param {any} data - API response data
 * @param {object} $t - Vue i18n translation function
 * @returns {any} - Processed data with translated messages
 */
export function processApiResponse(data, $t) {
  if (!data) return data;

  if (typeof data === 'string') {
    return translateMessage(data, $t);
  }

  if (Array.isArray(data)) {
    return data.map(item => processApiResponse(item, $t));
  }

  if (typeof data === 'object') {
    const processed = {};
    for (const [key, value] of Object.entries(data)) {
      // Process message-related fields
      if (key.includes('message') || key.includes('notification') || key.includes('text')) {
        processed[key] = translateMessage(value, $t);
      } else {
        processed[key] = processApiResponse(value, $t);
      }
    }
    return processed;
  }

  return data;
}
