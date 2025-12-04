<template>
  <q-pull-to-refresh @refresh="refresh">
    <q-header reveal reveal-offset="10">
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
        <q-toolbar-title class="text-weight-bold">{{
          $t("Currency")
        }}</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <template v-if="loading">
        <div class="q-gutter-y-sm">
          <template v-for="items in 10" :key="items">
            <q-skeleton
              height="50px"
              square
              class="bg-mygreyx radius20"
              :class="{
                'bg-grey600': $q.dark.mode,
                'bg-mygrey': !$q.dark.mode,
              }"
            />
          </template>
        </div>
      </template>
      <template v-else>
        <q-list>
          <template v-for="(items, code) in data" :key="items">
            <q-item
              clickable
              tag="label"
              class="radius8 border-grey1 q-mb-sm"
              :class="{
                'bg-lightblue': currency_code == code,
              }"
            >
              <q-item-section>
                <q-item-label>{{ items }}</q-item-label>
              </q-item-section>
              <q-item-section side top>
                <q-radio
                  v-model="currency_code"
                  :val="code"
                  color="yellow-9"
                  checked-icon="check_circle"
                  unchecked-icon="panorama_fish_eye"
                  size="lg"
                  class="hidden"
                />
                <div
                  class="text-blue text-weight-bold"
                  v-if="currency_code == code"
                >
                  {{ $t("Selected") }}
                </div>
              </q-item-section>
            </q-item>
          </template>
        </q-list>

        <q-footer
          class="q-pa-md footer-shadow"
          :class="{
            'bg-dark': $q.dark.mode,
            'bg-white text-dark': !$q.dark.mode,
          }"
        >
          <q-btn
            color="primary"
            size="lg"
            rounded
            unelevated
            no-caps
            class="full-width"
            @click="setCurrency"
            :loading="loading_submit"
          >
            <div class="text-subtitle2 text-weight-bold">{{ $t("Save") }}</div>
          </q-btn>
        </q-footer>
      </template>
    </q-page>
  </q-pull-to-refresh>
</template>

<script>
import APIinterface from "src/api/APIinterface";
import { useSettingStore } from "stores/SettingStore";
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useDataStore } from "src/stores/DataStore";

export default {
  name: "CurrencyPage",
  setup() {
    const SettingStore = useSettingStore();
    const DataStorePersisted = useDataStorePersisted();
    const DataStore = useDataStore();
    return { SettingStore, DataStorePersisted, DataStore };
  },
  data() {
    return {
      loading: false,
      loading_submit: false,
      data: [],
      currency_code: "",
    };
  },
  mounted() {
    if (this.DataStore.data?.currencyList) {
      this.currency_code = this.DataStorePersisted.getCurrency;
      this.data = this.DataStore.data?.currencyList;
    } else {
      this.getCurrencyList();
    }
  },
  beforeUnmount() {
    this.DataStore.data.currencyList = this.data;
  },
  methods: {
    async getCurrencyList() {
      try {
        this.loading = true;
        this.currency_code = this.DataStorePersisted.getCurrency;
        const response = await APIinterface.fetchDataPost(
          "getCurrencyList",
          "currency_code=" + this.currency_code
        );
        this.data = response.details.data;
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
      }
    },
    async setCurrency() {
      this.DataStorePersisted.use_currency_code = this.currency_code;

      this.DataStore.cleanData("home_data");
      this.DataStore.cleanData("menu");
      this.DataStore.cleanData("cart_data");

      try {
        this.loading_submit = true;
        const response = await APIinterface.fetchDataPost(
          "getCurrencySettings",
          "currency_code=" + this.DataStorePersisted.getCurrency
        );
        this.SettingStore.settings_data.money_config = response.details;
        this.$router.replace("/account-menu");
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading_submit = false;
      }
    },
  },
};
</script>
