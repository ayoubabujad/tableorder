<template>
  <q-dialog
    v-model="modal"
    persistent
    :maximized="true"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-show="beforeShow"
  >
    <q-card class="modern-address-dialog">
      <!-- 🎨 Modern Header -->
      <div class="address-dialog-header">
        <div class="modern-gradient-bg"></div>
        <q-toolbar class="transparent">
          <q-btn
            round
            size="md"
            icon="close"
            class="btn-glass shadow-soft"
            v-close-popup
          />
          <q-toolbar-title class="text-white text-weight-bold text-center">
            {{ is_address_found ? $t("Edit Address") : $t("Add New Address") }}
          </q-toolbar-title>
          <div style="width: 40px;"></div> <!-- Spacer for centering -->
        </q-toolbar>

      </div>

      <q-form @submit="onSubmit" class="address-form-container">
        <!-- 🗺️ Enhanced Map Section -->
        <div class="map-section">
          <div class="map-header q-pa-md">
            <div class="row items-center">
              <div class="col-auto q-mr-md">
                <div class="map-icon">
                  <q-icon name="map" size="24px" color="white" />
                </div>
              </div>
              <div class="col">
                <div class="text-weight-bold text-subtitle1 text-white">
                  {{ $t("Select Your Location") }}
                </div>
                <div class="text-caption text-white-7">
                  {{ $t("Drag the pin to your exact address") }}
                </div>
              </div>
            </div>
          </div>

          <div class="map-container">
            <MapComponents
              ref="mapRef"
              size="maps large"
              :keys="maps_config?.key || ''"
              :provider="maps_config?.provider || ''"
              :zoom="maps_config?.zoom || ''"
              :language="maps_config?.language || ''"
              :map_style="maps_config?.map_custom_style"
              :center="center"
              :markers="marker_position"
              :map_controls="true"
              :controls_center="true"
              :zoom_control="true"
              :adjust_location="false"
              @after-selectmap="afterSelectmap"
              @drag-marker="dragMarker"
              @after-getlocation="afterGetlocation"
              @set-busy="setBusy"
              @set-error="setError"
            />

            <!-- 📍 Map Overlay Instructions -->
            <div class="map-overlay">
              <div class="map-instruction">
                <div class="instruction-item">
                  <q-icon name="touch_app" size="16px" class="q-mr-xs" />
                  {{ $t("Drag the map to move pin") }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 📍 Address Content -->
        <div class="address-content-section">
          <!-- 🗺️ Selected Location Display -->
          <div class="modern-card location-display q-ma-md q-pa-md">
            <div class="row items-center">
              <div class="col-auto q-mr-md">
                <div class="location-icon">
                  <q-icon name="place" size="24px" color="white" />
                </div>
              </div>
              <div class="col">
                <div class="text-weight-bold text-subtitle2 text-dark q-mb-xs">
                  {{ $t("Selected Location") }}
                </div>
                <div class="text-body2 text-grey-7">
                  {{ formatted_address }}
                </div>
              </div>
            </div>
          </div>

          <!-- 🏷️ Address Label Section -->
          <div class="form-section q-pa-md">
            <div class="section-header q-mb-md">
              <div class="section-icon">
                <q-icon name="label" size="20px" color="white" />
              </div>
              <div class="section-info">
                <div class="text-weight-bold text-subtitle1 text-dark">
                  {{ $t("Label your address") }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ $t("Give it a nickname to easily find it") }}
                </div>
              </div>
            </div>

            <q-input
              v-model="address_label"
              :label="$t('Label (e.g., Home, Work, Office)')"
              filled
              color="accent-vibrant"
              class="modern-input"
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="home" color="accent-vibrant" />
              </template>
            </q-input>
          </div>

          <!-- 🏠 Address Details Section -->
          <div class="form-section q-pa-md">
            <div class="section-header q-mb-md">
              <div class="section-icon">
                <q-icon name="location_city" size="20px" color="white" />
              </div>
              <div class="section-info">
                <div class="text-weight-bold text-subtitle1 text-dark">
                  {{ $t("Address details") }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ $t("Help the courier find you faster") }}
                </div>
              </div>
            </div>

            <div class="row q-gutter-sm q-mb-md">
              <div class="col">
                <q-input
                  v-model="street_number"
                  :label="$t('Street number')"
                  filled
                  color="dark"
                  class="modern-input"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) || this.$t('This field is required'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="numbers" color="grey-7" />
                  </template>
                </q-input>
              </div>
              <div class="col-8">
                <q-input
                  v-model="street_name"
                  :label="$t('Street name')"
                  filled
                  color="dark"
                  class="modern-input"
                  :rules="[
                    (val) =>
                      (val && val.length > 0) || this.$t('This field is required'),
                  ]"
                >
                  <template v-slot:prepend>
                    <q-icon name="signpost" color="grey-7" />
                  </template>
                </q-input>
              </div>
            </div>

            <q-input
              v-model="location_name"
              :label="$t('Apartment, suite or floor')"
              filled
              color="dark"
              class="modern-input"
            >
              <template v-slot:prepend>
                <q-icon name="apartment" color="grey-7" />
              </template>
            </q-input>
          </div>


          <!-- 🚀 Save Button -->
          <div class="save-button-section q-pa-md">
            <q-btn
              type="submit"
              size="lg"
              rounded
              unelevated
              no-caps
              class="full-width modern-btn-primary"
              :loading="loading"
            >
              <div class="text-weight-bold text-body1">
                {{ is_address_found ? $t("Update Address") : $t("Save Address") }}
              </div>
            </q-btn>
          </div>
        </div>
      </q-form>
    </q-card>
  </q-dialog>

</template>

<script>
import { useSettingStore } from "stores/SettingStore";
import APIinterface from "src/api/APIinterface";
import { defineAsyncComponent } from "vue";

export default {
  name: "AddressDetails",
  props: [
    "is_address_found",
    "address_data",
    "maps_config",
    "delivery_options_data",
    "is_addnew",
  ],
  components: {
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
    ),
  },
  data() {
    return {
      modal: false,
      address_label: "",
      delivery_instructions: "",
      formatted_address: "",
      street_number: "",
      street_name: "",
      location_name: "",
      delivery_options: "Hand it to me",
      is_scroll: false,
      marker_position: {},
      center: { lat: 34.04703, lng: -118.24686 },
      modal_pin: false,
      coordinates: null,
      pin_busy: false,
      loading: false,
    };
  },
  emits: ["afterSaveaddress"],
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  methods: {
    beforeShow() {
      this.modal_pin = false;
      this.address_label = this.address_data?.address_label || "Home";
      this.street_number = this.address_data?.street_number || "";
      this.street_name = this.address_data?.street_name || "";
      this.location_name = this.address_data?.location_name || "";

      // Parse and validate coordinates with proper fallbacks
      let latitude = parseFloat(this.address_data?.latitude) || 0;
      let longitude = parseFloat(this.address_data?.longitude) || 0;

      // Ensure we have valid numbers
      if (isNaN(latitude)) latitude = 0;
      if (isNaN(longitude)) longitude = 0;

      // Fix formatted_address initialization
      if (this.address_data?.formatted_address) {
        this.formatted_address = this.address_data.formatted_address;
      } else if (this.address_data?.complete_address) {
        this.formatted_address = this.address_data.complete_address;
      } else if (latitude !== 0 && longitude !== 0) {
        this.formatted_address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      } else {
        this.formatted_address = "Click on map to select your location";
      }

      this.delivery_instructions =
        this.address_data?.delivery_instructions || "";
      this.delivery_options =
        this.address_data?.delivery_options || this.delivery_options;

      // Set initial coordinates with validated values
      this.coordinates = {
        lat: latitude,
        lng: longitude,
      };

      this.marker_position = [
        {
          id: 0,
          lat: latitude,
          lng: longitude,
          icon:
            this.maps_config?.provider == "mapbox"
              ? "marker_icon_destination"
              : this.maps_config?.icon_destination,
          draggable: true,
        },
      ];
    },
    async onSubmit() {
      // Prevent multiple submissions
      if (this.loading) {
        return;
      }

      try {
        const params = {
          address_uuid: this.address_data?.address_uuid || "",
          street_number: this.street_number,
          street_name: this.street_name,
          location_name: this.location_name,
          address_label: this.address_label,
          delivery_options: this.delivery_options,
          delivery_instructions: this.delivery_instructions,
          place_id: this.address_data?.place_id || "",
          formatted_address: this.formatted_address || "", // Use local data, not prop
          city: this.address_data?.city || "",
          state: this.address_data?.state || "",
          postal_code: this.address_data?.postal_code || "",
          country: this.address_data?.country || "",
          latitude: this.marker_position[0].lat,
          longitude: this.marker_position[0].lng,
        };
        this.loading = true;
        const results = await APIinterface.fetchDataByTokenPost(
          "SavedAddress",
          params
        );
        this.modal = false;
        this.$emit("afterSaveaddress", results.details.place_data);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    afterSelectmap(lat, lng) {
      // Validate and parse coordinates
      const validLat = parseFloat(lat);
      const validLng = parseFloat(lng);

      // Check for valid numbers
      if (isNaN(validLat) || isNaN(validLng)) {
        console.warn('Invalid coordinates received in afterSelectmap:', lat, lng);
        return;
      }

      // Update coordinates
      this.coordinates = {
        lat: validLat,
        lng: validLng,
      };

      // Update marker position
      this.marker_position[0].lat = validLat;
      this.marker_position[0].lng = validLng;

      // Show loading state while fetching address
      this.formatted_address = this.$t("Getting address...");

      // Clear address fields that will be refilled by geocoding
      // Note: location_name (apartment/suite/floor) is NOT cleared - user fills it manually
      this.street_name = "";
      this.street_number = "";

      // Force UI update
      this.$forceUpdate();

      // Perform reverse geocoding to get actual address
      this.reverseGeocode(validLat, validLng);
    },

    // Reverse geocoding to get address from coordinates using backend API
    async reverseGeocode(lat, lng) {
      try {
        const params = new URLSearchParams({
          lat: lat,
          lng: lng,
        }).toString();

        const response = await APIinterface.fetchDataGet(
          "coordinatesToAddress",
          params
        );

        console.log('Reverse geocoding response:', response);

        if (response.details && response.details.address_details) {
          const addressData = response.details.address_details;
          console.log('Address data:', addressData);

          // Update formatted address
          this.formatted_address = addressData.formatted_address ||
                                   addressData.complete_address ||
                                   addressData.place_name ||
                                   `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;

          // Auto-fill address fields from response (check multiple possible field names)
          // Street name
          this.street_name = addressData.street_name ||
                            addressData.route ||
                            addressData.street ||
                            addressData.address2 ||
                            "";

          // Street number
          this.street_number = addressData.street_number ||
                              addressData.address1 ||
                              addressData.house_number ||
                              "";

          // Location name (apartment/suite/floor) - leave empty for user to fill manually
          // this.location_name is intentionally NOT auto-filled
        } else {
          // Fallback to coordinates
          this.formatted_address = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        }

        this.$forceUpdate();

      } catch (error) {
        console.error('Reverse geocoding error:', error);
        // Fallback to coordinates on error
        this.formatted_address = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        this.$forceUpdate();
      }
    },

    // Handle marker drag events - this receives a boolean (busy state), NOT coordinates
    // Actual coordinates come from afterSelectmap event
    dragMarker(isBusy) {
      this.pin_busy = isBusy;
    },

    // Handle after getting location from GPS
    afterGetlocation(lat, lng) {
      // This is called when user uses GPS location
      // afterSelectmap will also be called with the same coordinates
      console.log('afterGetlocation:', lat, lng);
    },

    // Handle busy state from map
    setBusy(isBusy) {
      this.pin_busy = isBusy;
    },

    // Handle errors from map
    setError(error) {
      console.error('Map error:', error);
      this.$q.notify({
        message: error || 'Map error occurred',
        color: 'negative',
        position: 'top'
      });
    },
    //
  },
};
</script>

<style scoped lang="scss">
// 🎨 Modern Address Dialog Styling (using global modern classes as base)

.modern-address-dialog {
  .q-card {
    border-radius: 0;
  }
}

// 🌈 Header Section
.address-dialog-header {
  position: relative;
  min-height: 80px;
  overflow: hidden;

  .q-toolbar {
    position: relative;
    z-index: 2;
    background: transparent;
  }
}

.header-icon-section {
  position: relative;
  z-index: 2;
  padding-top: 20px;
}

.address-header-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.3);
  animation: float 3s ease-in-out infinite;
}

// 📱 Form Container
.address-form-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px 24px 0 0;
  margin-top: -10px;
  position: relative;
  z-index: 1;
  min-height: calc(100vh - 80px);
}

// 🗺️ Enhanced Map Section
.map-section {
  background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
  border-radius: 24px 24px 0 0;
  overflow: hidden;
  margin: -24px -24px 0 -24px;
}

.map-header {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.map-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.map-container {
  position: relative;
  height: 350px; // Increased from default small size
  min-height: 350px;

  // Override the maps component styling for better visibility
  :deep(.maps) {
    height: 350px !important;
    min-height: 350px !important;
    border-radius: 0;
    box-shadow: inset 0 0 0 3px rgba(255, 255, 255, 0.3);
  }

  // Enhanced map controls styling
  :deep(.leaflet-control-zoom) {
    border: none;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

    a {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #8E44AD;
      font-weight: bold;
      border: none;

      &:hover {
        background: rgba(255, 255, 255, 1);
        color: #9B59B6;
      }
    }
  }

  // Style the map marker for better visibility and interactivity
  :deep(.leaflet-marker-icon) {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    cursor: grab;
    transition: all 0.2s ease;

    &:hover {
      filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.4));
      transform: scale(1.1);
    }

    &:active {
      cursor: grabbing;
      transform: scale(1.05);
    }
  }

  // Make the entire map area show it's interactive
  :deep(.leaflet-container) {
    cursor: crosshair;
  }
}

.map-overlay {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 1000;
}

.map-instruction {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

.instruction-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.instruction-divider {
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
}

.address-content-section {
  padding-bottom: 100px; // Space for button
}

// 🗺️ Location Display Card
.location-display {
  border: 2px solid rgba(255, 217, 61, 0.3);

  &:hover {
    border-color: rgba(255, 217, 61, 0.5);
  }
}

.location-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #FF6B6B 0%, #EE5A6F 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(255, 107, 107, 0.3);
}

// 📋 Form Sections
.form-section {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #8E44AD 0%, #9B59B6 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(142, 68, 173, 0.3);
  flex-shrink: 0;
}

.section-info {
  flex: 1;
}

// 🚀 Save Button Section
.save-button-section {
  position: sticky;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 10;
}

// ✨ Animations
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-8px) rotate(2deg);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

// 📱 Responsive Design
@media (max-width: 600px) {
  .address-dialog-header {
    min-height: 70px;
  }

  .address-header-icon {
    width: 60px;
    height: 60px;

    .q-icon {
      font-size: 40px !important;
    }
  }

  .section-icon {
    width: 32px;
    height: 32px;

    .q-icon {
      font-size: 16px !important;
    }
  }

  .location-icon {
    width: 40px;
    height: 40px;

    .q-icon {
      font-size: 20px !important;
    }
  }

  .row.q-gutter-sm {
    flex-direction: column;

    .col, .col-8 {
      width: 100%;
    }
  }

  // Mobile map adjustments
  .map-container {
    height: 280px !important;
    min-height: 280px !important;

    :deep(.maps) {
      height: 280px !important;
      min-height: 280px !important;
    }
  }

  .map-icon {
    width: 40px;
    height: 40px;

    .q-icon {
      font-size: 20px !important;
    }
  }

  .map-instruction {
    font-size: 11px;
    padding: 6px 10px;
  }
}

// 🌙 Dark Mode Support
body.body--dark {
  .address-form-container {
    background: rgba(42, 42, 58, 0.95);
  }

  .save-button-section {
    background: rgba(42, 42, 58, 0.95);
  }

  .form-section {
    border-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
