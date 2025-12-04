<template>
  <q-dialog v-model="dialog" position="bottom">
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn
            flat
            round
            dense
            icon="close"
            :color="$q.dark.mode ? 'grey300' : 'dark'"
            v-close-popup
          />
          <q-toolbar-title
            class="font16 text-darkx"
            :class="{
              'text-grey300': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
          >
            {{ $t("Add a promo") }}
          </q-toolbar-title>
        </q-toolbar>
        <div class="q-pl-md q-pr-md q-pb-md">
          <div
            class="border-dark-greyx q-pa-xs radius20"
            :class="{
              'border-none': $q.dark.mode,
              'border-dark-grey': !$q.dark.mode,
            }"
          >
            <q-tabs
              v-model="promo_type"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
              no-caps
            >
              <q-tab name="enter_code" :label="$t('Enter promo code')" />
              <q-tab name="promo_list" :label="$t('Available promo')" />
            </q-tabs>
          </div>

          <q-tab-panels v-model="promo_type" swipeable style="height: 50vh">
            <q-tab-panel name="enter_code" class="row flex-center">
              <q-form @submit="onSubmit" class="full-width">
                <q-input
                  v-model="promo_code"
                  :label="$t('Promo Code')"
                  stack-label
                  :rules="[
                    (val) =>
                      (val && val.length > 0) ||
                      this.$t('This field is required'),
                  ]"
                  maxlength="20"
                />
                <q-btn
                  type="submit"
                  unelevated
                  color="primary"
                  :label="$t('Apply')"
                  class="radius20 fit"
                  no-caps
                  size="lg"
                  :loading="loading"
                />
              </q-form>
            </q-tab-panel>

            <q-tab-panel name="promo_list" class="q-pl-none q-pr-none">
              <q-form @submit="usePromoCode">
                <template v-if="hasData">
                  <q-list class="q-list-small">
                    <template v-for="items in data.data" :key="items">
                      <q-item
                        tag="label"
                        class="bg-mygreyx radius10 q-mb-sm"
                        :class="{
                          'bg-grey600 text-grey300': $q.dark.mode,
                          'bg-mygrey text-dark': !$q.dark.mode,
                        }"
                        clickable
                      >
                        <q-item-section side>
                          <q-radio
                            v-model="use_promo_code"
                            :val="items"
                            size="xs"
                            checked-icon="fiber_manual_record"
                            unchecked-icon="fiber_manual_record"
                            :disable="
                              data.promo_selected.promo_id === items.promo_id
                                ? true
                                : false
                            "
                          />
                        </q-item-section>
                        <q-item-section class="q-pb-sm q-pt-sm">
                          <q-item-label>{{ items.title }}</q-item-label>
                          <q-item-label caption>{{
                            items.sub_title
                          }}</q-item-label>
                          <q-item-label caption>{{
                            items.valid_to
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section
                          side
                          v-if="data.promo_selected.promo_id === items.promo_id"
                        >
                          <q-btn
                            @click="removePromo(items)"
                            :loading="loading"
                            round
                            color="red"
                            icon="delete"
                            unelevated
                          />
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-list>
                </template>
                <q-space class="q-pa-lg"></q-space>
                <q-space class="q-pa-sm"></q-space>
                <div
                  class="fixed-bottom q-pa-md bg-whitex relative-position"
                  :class="{
                    'bg-mydark ': $q.dark.mode,
                    'bg-white ': !$q.dark.mode,
                  }"
                >
                  <q-btn
                    unelevated
                    color="primary"
                    :label="$t('Apply')"
                    class="radius20 fit"
                    no-caps
                    size="lg"
                    type="submit"
                    :loading="loading"
                  />
                </div>
              </q-form>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-list>
    <q-item
      class="bg-mygreyx radius10"
      clickable
      @click="dialog = !dialog"
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
    >
      <q-item-section avatar>
        <q-icon name="o_local_offer" size="md" color="grey-4"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-medium">
          <template v-if="loading_get">
            <q-spinner color="red" />
          </template>
          <template v-else>
            <template v-if="hasData">
              <template v-if="Object.keys(data.promo_selected).length > 0">
                {{ data.promo_selected.savings }}
              </template>
              <template v-else-if="data.count > 0">
                {{ data.count }} {{ $t("promotional available") }}
              </template>
              <template v-else>
                {{ $t("No promo available") }}
              </template>
            </template>
            <template v-else> {{ $t("Add a promo") }} </template>
          </template>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_down" size="sm"></q-icon>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "AddPromoCode",
  data() {
    return {
      dialog: false,
      loading_get: true,
      promo_type: "enter_code",
      payment_method: "",
      promo_code: "",
      use_promo_code: [],
      data: [],
      loading: false,
    };
  },
  created() {
    this.loadPromo();
  },
  computed: {
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    loadPromo() {
      this.loading_get = true;
      APIinterface.fetchDataPost(
        "loadPromo",
        "cart_uuid=" + APIinterface.getStorage("cart_uuid")
      )
        .then((data) => {
          this.data = data.details;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading_get = false;
        });
    },
    onSubmit() {
      this.loading = true;
      const $params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        promo_code: this.promo_code,
      };
      APIinterface.fetchDataByTokenPost("applyPromoCode", $params)
        .then((data) => {
          this.dialog = false;
          this.promo_code = "";
          this.loadPromo();
          this.$emit("afterApplypromo");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    usePromoCode() {
      this.loading = true;
      const params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        promo_id: this.use_promo_code.promo_id,
        promo_type: this.use_promo_code.promo_type,
      };
      APIinterface.fetchDataByTokenPost("applyPromo", params)
        .then((data) => {
          this.dialog = false;
          this.loadPromo();
          this.$emit("afterApplypromo");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
    removePromo(data) {
      this.loading = true;
      const $params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        promo_id: data.promo_id,
        promo_type: data.promo_type,
      };
      APIinterface.fetchDataByTokenPost("removePromo", $params)
        .then((data) => {
          this.loadPromo();
          this.$emit("afterRemovepromo");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.loading = false;
        });
    },
  },
};
</script>
