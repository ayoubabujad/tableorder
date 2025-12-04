// PWA-only: Using browser file input instead of Capacitor Camera

const AppCamera = {
  // In PWA, camera is always available via file input
  async isCameraEnabled() {
    return "granted";
  },

  // File access is always available in browser
  async isFileAccessEnabled() {
    return "granted";
  },

  // Get photo via file input (creates temporary input element)
  async getPhoto(sourceType) {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      // sourceType 2 = camera, 3 = gallery
      if (sourceType == 2) {
        input.capture = 'environment'; // Use camera
      }

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          resolve(false);
          return;
        }

        try {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = e.target.result.split(',')[1];
            resolve({
              format: file.type.split('/')[1] || 'jpeg',
              path: URL.createObjectURL(file),
              data: base64,
            });
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        } catch (error) {
          reject(error);
        }
      };

      input.click();
    });
  },

  // Read file from URL/blob
  async ReadFile(imagePath) {
    try {
      const response = await fetch(imagePath);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ data: reader.result.split(',')[1] });
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error reading file:', error);
      return false;
    }
  },
};

export default AppCamera;
