<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @show="onShow"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-hide="onBeforeHide"
    @before-show="onBeforeShow"
  >
    <q-card style="height: calc(95vh)">
      <q-card-section class="q-pa-none q-pt-sm">
        <q-toolbar class="q-gutter-x-sm">
          <q-btn
            @click="modal = false"
            dense
            icon="arrow_back"
            unelevated
            flat
          />

          <q-input
            v-model="q"
            ref="ref_search"
            :placeholder="$t('Search location')"
            dense
            outlined
            color="primary"
            bg-color="grey-1"
            class="input-borderlessx full-width"
            :loading="awaitingSearch"
            rounded
            clearable
            @clear="onShow"
            @update:model-value="Search"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn
                v-if="!isMaximize"
                no-caps
                dense
                flat
                icon="mic"
                color="primary"
              ></q-btn>
            </template>
          </q-input>
        </q-toolbar>
      </q-card-section>

      <q-card-section style="height: 70vh" class="scroll relative-position">
        <template v-if="isMaximize">
          <div class="scroll">
            <q-list separator>
              <template v-for="items in data" :key="items">
                <q-item clickable v-ripple @click="ChooseLocation(items)">
                  <q-item-section avatar>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="fmd_good"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">{{
                      items.description
                    }}</q-item-label>
                    <q-item-label class="text-caption line-normal text-grey">
                      {{ items.addressLine1 }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </div>
        </template>
        <template v-else>
          <q-tabs
            v-model="tab"
            dense
            narrow-indicator
            no-caps
            active-color="'blue-grey-6"
            active-bg-color="orange-1"
            indicator-color="transparent"
            active-class="text-blue-grey-6"
            align="left"
          >
            <q-tab
              name="recent_search"
              :label="$t('Recent searches')"
              class="radius50 bg-mygrey1"
            />
            <q-tab
              v-if="isLogin"
              name="saved"
              :label="$t('Saved')"
              class="radius50 bg-mygrey1"
            />
          </q-tabs>

          <q-tab-panels
            v-model="tab"
            animated
            transition-prev="slide-down"
            transition-next="slide-up"
          >
            <q-tab-panel name="recent_search">
              <q-list separator>
                <q-item clickable v-ripple:purple @click="locateLocation">
                  <q-item-section avatar top>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="o_near_me"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ $t("Current location") }}
                    </q-item-label>
                    <q-item-label caption>{{ $t("Home") }}</q-item-label>
                  </q-item-section>
                </q-item>

                <template
                  v-if="
                    Array.isArray(DataStorePersisted.recent_addresses) &&
                    DataStorePersisted.recent_addresses.length > 0 &&
                    DataStorePersisted.recent_addresses[0] !== null
                  "
                >
                  <template
                    v-for="items in DataStorePersisted.recent_addresses"
                    :key="items"
                  >
                    <q-item
                      clickable
                      v-ripple:purple
                      @click="setLocation(items)"
                    >
                      <q-item-section avatar>
                        <q-avatar
                          color="grey-1"
                          text-color="blue-grey-6"
                          icon="o_fmd_good"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-subtitle2 text-weight-bold">
                          {{ items?.place_text }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ items?.formatted_address }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </template>
              </q-list>
              <q-space class="q-pa-lg"></q-space>
            </q-tab-panel>

            <q-tab-panel name="saved" style="min-height: calc(50vh)">
              <template v-if="DataStore.data?.address_book">
                <q-list separator>
                  <template
                    v-for="items in DataStore.data?.address_book"
                    :key="items"
                  >
                    <q-item
                      clickable
                      v-ripple:purple
                      @click="setLocation(items)"
                    >
                      <q-item-section avatar top>
                        <q-avatar
                          color="grey-1"
                          text-color="blue-grey-6"
                          icon="o_fmd_good"
                        />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-subtitle2 text-weight-bold">
                          {{ items?.address_label }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ items?.formatted_address }}
                        </q-item-label>
                        <q-item-label class="text-caption">
                          {{ items?.street_number }} {{ items?.street_name }}
                        </q-item-label>
                        <q-item-label class="text-caption">
                          {{ items?.delivery_instructions }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-list>
              </template>
              <template v-else>
                <div
                  class="row q-gutter-x-sm justify-center items-center absolute-center text-center full-width"
                >
                  <div class="text-body1 text-grey">
                    {{ $t("No Saved Addresses") }}
                  </div>
                </div>
              </template>
            </q-tab-panel>
          </q-tab-panels>
        </template>
      </q-card-section>

      <div class="fixed-bottom q-pa-sm box-shadow0 bg-white">
        <q-btn
          :label="$t('Choose on map')"
          no-caps
          color="white"
          text-color="blue-grey-6"
          icon="o_map"
          unelevated
          :to="{
            path: '/location',
            query: {
              redirect: this.redirect ? this.redirect : '/home',
              isnew: this.isnew,
            },
          }"
          class="fit"
        ></q-btn>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
import { debounce } from "quasar";
import APIinterface from "src/api/APIinterface";
import auth from "src/api/auth";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";

export default {
  name: "AddressRecent",
  props: ["isLogin", "redirect", "isnew"],
  data() {
    return {
      q: null,
      modal: false,
      awaitingSearch: false,
      data: [],
      tab: "recent_search",
    };
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { DataStorePersisted, DataStore };
  },
  mounted() {
    this.searchPlaces = debounce(this.fetchPlaces, 500);
  },
  computed: {
    isMaximize() {
      if (this.q) {
        return true;
      }
      return false;
    },
    isNoresults() {
      if (this.q && !this.awaitingSearch) {
        if (Object.keys(this.data).length > 0) {
        } else {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    onBeforeShow() {},
    onBeforeHide() {
      this.q = "";
      this.data = [];
    },
    onShow() {
      this.$refs.ref_search.focus();
      if (this.isLogin && !this.DataStore.data?.address_book) {
        this.DataStore.clientAddresses();
      }
    },
    Search(value) {
      this.searchPlaces(value);
    },
    async fetchPlaces(val) {
      if (!val || val.length < 3) {
        this.data = [];
        return;
      }
      this.awaitingSearch = true;
      try {
        const response = await APIinterface.fetchDataPost(
          "getlocationAutocomplete",
          "q=" + val
        );
        console.log("response", response);
        this.data = response.details.data;
      } catch (error) {
      } finally {
        this.awaitingSearch = false;
      }
    },
    async ChooseLocation(value) {
      if (value.provider == "google.maps") {
        try {
          this.$q.loading.show();
          const params = new URLSearchParams({
            place_id: value.id,
            description: value.description,
          }).toString();
          const response = await APIinterface.fetchDataPost(
            "getLocationDetails",
            params
          );
          this.setLocation(response.details.address_details);
          this.modal = false;
        } catch (error) {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        } finally {
          this.$q.loading.hide();
        }
      } else {
        try {
          this.$q.loading.show();
          const params = new URLSearchParams({
            lat: value.latitude,
            lng: value.longitude,
          }).toString();
          const response = await APIinterface.fetchDataGet(
            "coordinatesToAddress",
            params
          );
          this.setLocation(response.details.address_details);
          this.modal = false;
        } catch (error) {
          APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
        } finally {
          this.$q.loading.hide();
        }
      }
    },
    setLocation(value) {
      this.modal = false;
      this.$emit("setLocation", value);
    },

    async locateLocation() {
      try {
        this.$q.loading.show();
        let location = null;
        if (this.$q.capacitor) {
          location = await this.DataStore.fetchLocation(this.$t);
        } else {
          location = await this.DataStore.fetchWebLocation(this.$t);
        }

        const params = new URLSearchParams({
          lat: location.latitude,
          lng: location.longitude,
        }).toString();
        const response = await APIinterface.fetchDataGet(
          "coordinatesToAddress",
          params
        );
        this.setLocation(response.details.address_details);
      } catch (error) {
        APIinterface.ShowAlert(error, this.$q.capacitor, this.$q);
      } finally {
        this.$q.loading.hide();
      }
    },

    //
  },
};
</script>

<style scoped>
.custom-tabs .q-tab {
  margin-right: 16px; /* Add spacing between tabs */
}

.custom-tabs .q-tab:last-child {
  margin-right: 0; /* Remove margin for the last tab */
}
.q-tabs__content--align-justify .q-tab {
  flex: initial !important;
}
</style>
