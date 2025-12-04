<template>
  <q-header
    reveal
    :class="{
      'bg-mydark text-white': $q.dark.mode,
      'bg-white text-black': !$q.dark.mode,
    }"
  >
    <q-toolbar>
      <q-btn
        @click="$router.back()"
        round
        dense
        icon="arrow_back"
        unelevated
        :color="$q.dark.mode ? 'grey' : 'mygrey'"
        :text-color="$q.dark.mode ? 'grey-9' : 'dark'"
      />
    </q-toolbar>
  </q-header>
  <q-page class="q-pa-lg text-center q-gutter-y-md">
    <q-img
      src="find.svg"
      style="height: 120px; width: 120px"
      loading="lazy"
      fit="fill"
      class="radius8"
    >
      <template v-slot:loading>
        <q-skeleton height="120px" width="120px" square class="bg-grey-2" />
      </template>
    </q-img>

    <div class="text-h5 text-weight-bold q-pb-md">
      {{ $t("Choose your location") }}
    </div>

    <q-form @submit="onSubmit" class="q-gutter-y-md">
      <template v-if="getLocationType == 1">
        <LocationSelection
          ref="ref_city"
          v-model:id="city_id"
          method="fetchCity"
          :auto_load="true"
          :label="$t('City')"
          :params="{
            dummy: true,
          }"
        ></LocationSelection>

        <LocationSelection
          ref="ref_area"
          v-model:id="area_id"
          method="fetchArea"
          :auto_load="false"
          :label="$t('Disctrict/Area')"
        ></LocationSelection>
      </template>
      <template v-else-if="getLocationType == 2">2</template>
      <template v-else-if="getLocationType == 3">3</template>
    </q-form>

    <q-footer class="bg-white text-dark box-shadow0 q-pa-md">
      <q-btn
        no-caps
        unelevated
        :color="canSearch ? 'primary' : 'disabled'"
        :text-color="canSearch ? 'white' : 'disabled'"
        size="lg"
        class="fit"
        type="submit"
        rounded
        :loading="loading"
        :disabled="!canSearch"
        @click="onSubmit"
      >
        <div class="text-body2 text-weight-bold">
          {{ $t("Search") }}
        </div>
      </q-btn>
    </q-footer>
  </q-page>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";
import { useSettingStore } from "src/stores/SettingStore";
import { defineAsyncComponent } from "vue";

export default {
  name: "AddLocation",
  components: {
    LocationSelection: defineAsyncComponent(() =>
      import("components/LocationSelection.vue")
    ),
  },
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    return { SettingStore, DataStorePersisted };
  },
  data() {
    return {
      state_id: null,
      city_id: null,
      area_id: null,
      postal_code: null,
      loading: false,
      redirect: null,
      isNew: null,
    };
  },
  mounted() {
    this.redirect = this.$route.query.redirect ?? null;
    this.isNew = this.$route.query.isnew ?? null;
  },
  computed: {
    getLocationType() {
      return parseInt(this.SettingStore.location_searchtype) || 1;
    },
    countryID() {
      return parseInt(this.SettingStore.country_id) || null;
    },
    canSearch() {
      if (this.getLocationType == 1) {
        if (this.city_id && this.area_id) {
          return true;
        }
      } else if (this.getLocationType == 2) {
        if (this.city_id && this.state_id) {
          return true;
        }
      } else if (this.getLocationType == 3) {
        if (this.postal_code) {
          return true;
        }
      }
      return false;
    },
  },
  watch: {
    state_id(newval, oldval) {
      console.log("state_id", newval);
      if (this.$refs.ref_city) {
        this.city_id = null;
        this.$refs.ref_city.clearSelect();
        this.$refs.ref_city.fetchData({
          state_id: newval ?? "",
        });
      }
    },
    city_id(newval, oldval) {
      console.log("city_id", newval);
      if (this.$refs.ref_area) {
        this.area_id = null;
        this.$refs.ref_area.clearSelect();
        this.$refs.ref_area.fetchData({
          city_id: newval ?? "",
        });
      }
    },
  },
  methods: {
    async onSubmit() {
      try {
        this.loading = true;
        const params = {
          state_id: this.state_id,
          city_id: this.city_id,
          area_id: this.area_id,
          postal_code: this.postal_code,
          location_type: this.getLocationType,
        };
        const response = await APIinterface.fetchGet1(
          `${config.api_location}/getLocationCurrentAddress`,
          params
        );

        const locationResponse = {
          ...response.details.data,
          ...params,
        };
        const stateID = response.details?.data?.state_id || null;
        if (stateID) {
          locationResponse.state_id = response.details.data.state_id;
        }

        this.DataStorePersisted.location_data = locationResponse;
        this.DataStorePersisted.saveRecentLocation(locationResponse);
        if (this.redirect) {
          this.$router.replace({
            path: this.redirect,
            query: {
              refresh: 1,
              isnew: this.isNew,
            },
          });
        } else {
          this.$router.replace("/home");
        }
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
