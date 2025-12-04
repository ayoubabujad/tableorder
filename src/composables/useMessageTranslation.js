import { translateMessage, processApiResponse } from '../utils/messageUtils.js';

/**
 * Composable for handling message translation overrides
 * Provides methods to translate messages and process API responses
 */
export function useMessageTranslation() {

  /**
   * Translates a message using the i18n function
   * @param {string} message - The message from API or translation key
   * @param {Function} t - Vue i18n translation function
   * @returns {string} - Translated message
   */
  const translate = (message, t) => {
    return translateMessage(message, t);
  };

  /**
   * Processes API response data to ensure all messages are properly translated
   * @param {any} data - API response data
   * @param {Function} t - Vue i18n translation function
   * @returns {any} - Processed data with translated messages
   */
  const processResponse = (data, t) => {
    return processApiResponse(data, t);
  };

  /**
   * Shows a dialog with proper message translation
   * @param {object} dialog - Quasar dialog object
   * @param {string} message - Message to display
   * @param {Function} t - Vue i18n translation function
   * @returns {object} - Dialog config with translated message
   */
  const showDialog = (dialog, message, t) => {
    return {
      ...dialog,
      message: translateMessage(message, t)
    };
  };

  /**
   * Shows a notification with proper message translation
   * @param {object} notify - Quasar notify object
   * @param {string} message - Message to display
   * @param {Function} t - Vue i18n translation function
   * @returns {object} - Notify config with translated message
   */
  const showNotification = (notify, message, t) => {
    return {
      ...notify,
      message: translateMessage(message, t)
    };
  };

  return {
    translate,
    processResponse,
    showDialog,
    showNotification
  };
}
