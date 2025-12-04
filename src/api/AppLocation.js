// PWA-only: Using browser's native Geolocation API

const AppLocation = {
  // Check if location permission is granted or request it
  async isLocationEnabled() {
    try {
      if (!navigator.geolocation) {
        return "denied";
      }

      // Check permission state if available
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          return "granted";
        }
        if (result.state === 'denied') {
          return "denied";
        }
      }

      // Try to get position to trigger permission request
      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => resolve("granted"),
          () => resolve("denied"),
          { timeout: 5000 }
        );
      });
    } catch (error) {
      console.error("Permission check failed:", error);
      return "denied";
    }
  },

  // Check accuracy (always true for web - browser handles accuracy)
  async checkAccuracy() {
    try {
      const pos = await this.getPosition();
      return !!pos;
    } catch (error) {
      console.error("Accuracy check failed:", error);
      return false;
    }
  },

  // Get current GPS position
  async getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting position:", error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  },
};

export default AppLocation;
