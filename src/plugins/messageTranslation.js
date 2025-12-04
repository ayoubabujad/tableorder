import { useMessageTranslation } from 'src/composables/useMessageTranslation';

/**
 * Vue plugin for global message translation functionality
 * Provides $translateMessage method to all Vue components
 */
export default {
  install(app, options) {
    // Add global method
    app.config.globalProperties.$translateMessage = function(message) {
      const { translate } = useMessageTranslation();
      return translate(message, this.$t);
    };

    // Add global method for processing API responses
    app.config.globalProperties.$processApiResponse = function(data) {
      const { processResponse } = useMessageTranslation();
      return processResponse(data, this.$t);
    };

    // Provide the composable for injection
    app.provide('messageTranslation', useMessageTranslation());
  }
};
