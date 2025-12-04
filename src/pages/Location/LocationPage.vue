<template>
  <q-page class="row items-stretch">
    <div class="col-12 relative-position bg-grey-1">
      <q-page-sticky position="top-left" :offset="[12, 8]">
        <q-btn
          @click="$router.back()"
          round
          dense
          icon="arrow_back"
          unelevated
          :color="$q.dark.mode ? 'white' : 'mygrey'"
          text-color="dark"
        />
      </q-page-sticky>
      <MapComponents
        v-if="maps_config"
        ref="ref_map"
        class="maps"
        :keys="maps_config?.key || ''"
        size="maps fit "
        :provider="maps_config?.provider || ''"
        :zoom="maps_config?.zoom || ''"
        :language="maps_config?.language || ''"
        :center="center"
        :markers="marker"
        :map_controls="true"
        :controls_center="false"
        :zoom_control="false"
        :adjust_location="false"
        @after-selectmap="afterSelectmap"
        @drag-marker="dragMarker"
        @after-getlocation="afterGetlocation"
        @set-busy="setBusy"
        @set-error="setError"
        @dragMarker="dragMarker"
      />
    </div>

    <q-dialog
      v-model="modal"
      seamless
      persistent
      position="bottom"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card
        :class="{
          'card-small-height': !edit_address,
          'card-small-large': edit_address,
        }"
      >
        <template v-if="edit_address">
          <q-card-section class="q-pb-sm">
            <SearchLocation
              ref="search_location"
              :detect_location="true"
              @after-results="afterResults"
              @on-clear="onClear"
              @when-close="whenClose"
              @locate-location="locateLocation"
              @clear-Error="clearError"
            />
            <div
              v-if="hasError"
              class="bg-red-2 q-pa-sm radius8 text-dark q-mt-sm"
            >
              {{ error_message }}
            </div>
          </q-card-section>
          <q-separator></q-separator>
          <template v-if="hasData">
            <q-list>
              <template v-for="items in data" :key="items">
                <q-item clickable @click="getLocationDetails(items)">
                  <q-item-section avatar>
                    <q-icon name="o_place" class="text-grey" />
                  </q-item-section>
                  <q-item-section> {{ items.description }} </q-item-section>
                </q-item>
              </template>
            </q-list>
          </template>
          <template v-else>
            <q-card-section
              class="flex flex-center text-center card-small-medium"
            >
              <div class="text-grey">
                {{ $t("Enter your address to explore restaurant around you") }}
              </div>
            </q-card-section>
          </template>
        </template>
        <template v-else>
          <q-card-section
            :class="{ disabled: loading }"
            class="q-pl-none q-pr-none"
          >
            <q-item>
              <q-item-section
                top
                avatar
                style="min-width: auto; padding-right: 5px"
              >
                <q-icon name="o_location_on" color="primary" size="md"></q-icon>
              </q-item-section>
              <q-item-section>
                <q-item-label
                  class="text-weight-medium text-body2 ellipsis-3-lines"
                >
                  {{
                    place_data
                      ? place_data?.formatted_address
                      : $t("Location details not available")
                  }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  @click="edit_address = !edit_address"
                  flat
                  icon="o_edit"
                  color="yellow-9"
                ></q-btn>
              </q-item-section>
            </q-item>
            <q-separator class="q-mt-sm q-mb-md"></q-separator>
            <div class="q-pl-md q-pr-md">
              <!-- <pre>{{ DataStorePersisted.location_data }}</pre> -->
              <q-btn
                color="primary"
                text-color="white"
                size="lg"
                rounded
                unelevated
                no-caps
                class="fit"
                :loading="loading"
                :disable="place_data ? false : true"
                @click="confirmLocation"
              >
                <div class="text-subtitle2 text-weight-bold">
                  {{ $t("Confirm location") }}
                </div>
              </q-btn>
            </div>
          </q-card-section>
        </template>
      </q-card>
    </q-dialog>

    <AddressDetails
      ref="ref_address_details"
      :is_address_found="false"
      :address_data="address_data"
      :maps_config="SettingStore.getMapConfig ?? null"
      :delivery_options_data="SettingStore.deliveryOptions"
      @after-saveaddress="afterSaveaddress"
    ></AddressDetails>
  </q-page>
</template>

<script>
import { defineAsyncComponent } from "vue";
import { useSettingStore } from "stores/SettingStore";
import jwtDecode from "jwt-decode";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "src/stores/DataStore";
import auth from "src/api/auth";

export default {
  name: "LocationPage",
  components: {
    MapComponents: defineAsyncComponent(() =>
      import("components/MapComponents.vue")
    ),
    SearchLocation: defineAsyncComponent(() =>
      import("components/SearchLocation.vue")
    ),
    AddressDetails: defineAsyncComponent(() =>
      import("components/AddressDetails.vue")
    ),
  },
  data() {
    return {
      loading: false,
      confirm_loading: false,
      modal: true,
      page_ready: false,
      maps_config: null,
      marker: [],
      edit_address: false,
      data: [],
      location_data: [],
      error_message: "",
      redirect: "",
      add_address: false,
      is_guest: false,
      center: { lat: 34.04703, lng: -118.24686 },
      is_drag: false,
      place_data: null,
      address_data: null,
      isnew: false,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { SettingStore, DataStorePersisted, DataStore };
  },
  mounted() {
    this.is_guest = !auth.authenticated();

    this.redirect = this.$route.query.redirect;
    this.add_address = this.$route.query.add_address;
    this.isnew = this.$route.query.isnew ?? false;

    if (this.DataStorePersisted.place_data) {
      this.place_data = this.DataStorePersisted.place_data;
    }

    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.page_ready = true;
      this.mapsConfig();
      setTimeout(() => {
        if (!this.DataStorePersisted.place_data) {
          this.locateLocation();
        }
      }, 500);
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.page_ready = true;
          this.mapsConfig();
          setTimeout(() => {
            if (!this.DataStorePersisted.place_data) {
              this.locateLocation();
            }
          }, 500);
        }
      );
    }
  },
  computed: {
    hasError() {
      if (!APIinterface.empty(this.error_message)) {
        return true;
      }
      return false;
    },
    hasLocation() {
      if (Object.keys(this.location_data).length > 0) {
        return true;
      }
      return false;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    mapsConfig() {
      try {
        this.maps_config = jwtDecode(
          this.SettingStore.settings_data.maps_config
        );

        const icons =
          this.maps_config.provider == "mapbox"
            ? "marker_icon_destination"
            : this.maps_config.icon;

        if (this.place_data) {
          this.marker = [
            {
              id: 0,
              draggable: true,
              icon: icons,
              lat: this.place_data?.latitude || "",
              lng: this.place_data?.longitude || "",
            },
          ];
        } else {
          this.marker = [
            {
              id: 0,
              draggable: true,
              icon: icons,
              lat: this.maps_config.default_lat,
              lng: this.maps_config.default_lng,
            },
          ];
        }
      } catch (err) {
        console.log("err", err);
      }
    },
    async locateLocation() {
      this.edit_address = false;
      try {
        this.$q.loading.show();
        let location = null;
        if (this.$q.capacitor) {
          location = await this.DataStore.fetchLocation(this.$t);
        } else {
          location = await this.DataStore.fetchWebLocation(this.$t);
        }
        this.afterSelectmap(location.latitude, location.longitude);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.$q.loading.hide();
      }
    },
    afterGetlocation(lat, lng) {
      console.log("afterGetlocation", lat);
      const location_coordinates = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
      this.$refs.ref_map.setNewCoordinates(location_coordinates, 0);
    },
    async afterSelectmap(lat, lng) {
      console.log("afterSelectmap");
      try {
        this.loading = true;
        const params = new URLSearchParams({
          lat: lat,
          lng: lng,
        }).toString();
        const response = await APIinterface.fetchDataGet(
          "coordinatesToAddress",
          params
        );
        this.place_data = response.details.address_details;
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.loading = false;
      }
    },
    setBusy(data) {
      console.log("setBusy", data);
      this.loading = data;
    },
    afterResults(data) {
      this.data = data;
    },
    onClear() {
      console.log("onClear");
      this.data = [];
    },
    whenClose() {
      this.edit_address = false;
    },
    clearError() {
      this.error_message = "";
    },
    async getLocationDetails(data) {
      this.whenClose();
      try {
        this.$q.loading.show();
        const params = new URLSearchParams({
          place_id: data.id,
          description: data.description,
        }).toString();
        const response = await APIinterface.fetchDataPost(
          "getLocationDetails",
          params
        );
        this.place_data = response.details.address_details;
        this.afterGetlocation(
          this.place_data?.latitude,
          this.place_data?.longitude
        );
      } catch (error) {
      } finally {
        this.$q.loading.hide();
      }
    },
    confirmLocation(value) {
      console.log("confirmLocation");
      if (this.isnew) {
        this.address_data = this.place_data;
        this.$refs.ref_address_details.modal = true;
        return;
      }
      this.DataStorePersisted.saveRecentAddress(this.place_data);
      this.DataStorePersisted.place_data = this.place_data;
      this.DataStorePersisted.coordinates = {
        lat: this.place_data?.latitude,
        lng: this.place_data?.longitude,
      };
      this.$router.replace(this.redirect);
    },
    afterSaveaddress(data) {
      console.log("afterSaveaddress", data);
      this.DataStore.data.addressList = null;
      this.DataStorePersisted.location_data = data;
      this.$router.replace(this.redirect);
    },
    afterSavetrans() {
      console.log("afterSavetrans");
      this.DataStorePersisted.location_data = this.location_data;
      this.$router.replace(this.redirect);
    },
    dragMarker(data) {
      if (!data) {
        setTimeout(() => {
          this.modal = !data;
        }, 500);
      } else {
        this.modal = !data;
      }
    },
    setError(data) {
      APIinterface.notify("negative", data, "error_outline", this.$q);
    },
  },
};
</script>
