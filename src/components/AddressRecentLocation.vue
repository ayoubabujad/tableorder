<template>
  <q-dialog
    v-model="modal"
    position="bottom"
    @show="onShow"
    transition-show="slide-up"
    transition-hide="slide-down"
    @before-show="onBeforeShow"
    @before-hide="onBeforeHide"
  >
    <q-card style="height: calc(95vh)">
      <q-card-section class="q-pa-none q-pt-sm">
        <q-toolbar class="q-gutter-x-sm">
          <q-btn
            @click="modal = false"
            dense
            icon="eva-arrow-back-outline"
            unelevated
            flat
          />
          <q-toolbar-title class="text-body1">
            {{ $t("Add or choose an address") }}
          </q-toolbar-title>
        </q-toolbar>
      </q-card-section>
      <q-card-section style="height: 70vh" class="scroll relative-position">
        <q-tabs
          v-model="tab"
          dense
          narrow-indicator
          no-caps
          active-color="'blue-grey-6"
          active-bg-color="orange-1"
          indicator-color="transparent"
          active-class="text-blue-grey-6"
          class="custom-tabs"
        >
          <q-tab
            name="recent_search"
            :label="$t('Recent searches')"
            class="radius28 bg-mygrey1"
          />
          <q-tab
            v-if="isLogin"
            name="saved"
            :label="$t('Saved')"
            class="radius28 bg-mygrey1"
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
              <template
                v-for="items in DataStorePersisted.recent_location"
                :key="items"
              >
                <q-item clickable v-ripple:purple @click="setLocation(items)">
                  <q-item-section avatar>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="eva-pin-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ items.complete_address }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ items?.country_name || "" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-tab-panel>

          <q-tab-panel name="saved" v-if="isLogin">
            <q-list separator>
              <template v-for="items in data" :key="items">
                <q-item clickable v-ripple:purple @click="setLocation(items)">
                  <q-item-section avatar top>
                    <q-avatar
                      color="grey-1"
                      text-color="blue-grey-6"
                      icon="eva-pin-outline"
                    />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-subtitle2 text-weight-bold">
                      {{ items?.address_label }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ items?.complete_address || "" }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <div class="fixed-bottom q-pa-sm box-shadow0 bg-white">
        <q-btn
          :label="$t('Select Location')"
          no-caps
          color="white"
          text-color="blue-grey-6"
          icon="o_map"
          unelevated
          :to="{
            path: '/location/add-location',
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
import APIinterface from "src/api/APIinterface";
import config from "src/api/config";
import { useDataStore } from "src/stores/DataStore";
import { useDataStorePersisted } from "src/stores/DataStorePersisted";

export default {
  name: "AddressRecentLocation",
  props: ["isLogin", "redirect", "isnew"],
  data() {
    return {
      modal: false,
      tab: "recent_search",
      loading: false,
      data: null,
    };
  },
  setup() {
    const DataStore = useDataStore();
    const DataStorePersisted = useDataStorePersisted();
    return { DataStore, DataStorePersisted };
  },
  methods: {
    async onBeforeShow() {
      if (!this.isLogin) {
        return;
      }

      if (this.DataStore.data?.location_addressbook) {
        this.data = this.DataStore.data?.location_addressbook;
      } else {
        this.fetchLocationAddress();
      }
    },
    onBeforeHide() {
      this.DataStore.data.location_addressbook = this.data;
    },
    async fetchLocationAddress() {
      try {
        this.loading = true;
        const response = await APIinterface.fetchGet2(
          `${config.api_location}/fetchlocationaddress`
        );
        console.log("response", response);
        this.data = response.details.data;
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading = false;
      }
    },
    setLocation(value) {
      this.DataStorePersisted.location_data = value;
      this.$emit("afterChooselocation", value);
      this.modal = false;
    },
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
