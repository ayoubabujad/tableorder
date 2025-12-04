<template>
  <div
    class="bg-mygreyx radius10 q-pl-md q-pr-md q-pt-sm q-pb-sm relative-position"
    :class="{
      'bg-grey600 ': $q.dark.mode,
      'bg-mygrey ': !$q.dark.mode,
    }"
  >
    <template v-if="loading"></template>
    <template v-else>
      <div class="row items-end q-mb-xs items-center">
        <div class="col text-weight-medium">{{ $t("Tips") }}</div>
        <div class="col text-right">
          <template v-if="data.tips > 0">
            <q-btn
              flat
              color="primary"
              :label="$t('Remove Tips')"
              no-caps
              class="q-pa-none line-normal"
              @click="removeTips"
            />
          </template>
        </div>
      </div>
      <q-btn-toggle
        v-model="tips"
        color="primary"
        toggle-color="darkgreen"
        unelevated
        class="rounded-group2 small text-weight-bold line-1 q-pa-none"
        :options="data.data"
        no-caps
        @click="updateTips"
      />
      <q-inner-loading
        :showing="inner_loading"
        :color="$q.dark.mode ? 'grey300' : 'primary'"
      />
    </template>
  </div>

  <q-dialog v-model="dialog" position="bottom">
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn
            flat
            round
            dense
            icon="close"
            v-close-popup
            :color="$q.dark.mode ? 'grey300' : 'dark'"
          />
          <q-toolbar-title
            class="font16 text-darkx"
            :class="{
              'text-grey300': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
          >
            {{ $t("Add Tips") }}
          </q-toolbar-title>
        </q-toolbar>
        <div class="q-pl-md q-pr-md q-pb-md">
          <q-form @submit="onSubmit" class="full-width">
            <q-input
              v-model="tips_amount"
              :label="$t('Enter amount')"
              type="number"
              stack-label
              :rules="[
                (val) =>
                  (val && val.length > 0) || this.$t('This field is required'),
              ]"
              maxlength="14"
            />
            <q-btn
              type="submit"
              unelevated
              color="primary"
              :label="$t('Apply')"
              class="radius20 fit"
              no-caps
              size="lg"
              :loading="form_loading"
            />
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "TipsCart",
  data() {
    return {
      dialog: false,
      tips: 0,
      data: [],
      loading: false,
      inner_loading: false,
      is_manual: false,
      tips_amount: 0,
      form_loading: false,
    };
  },
  created() {
    this.loadTips();
  },
  computed: {
    hasTips() {
      if (!this.loading) {
        if (this.data.tips > 0) {
          return true;
        }
      }
      return false;
    },
  },
  methods: {
    loadTips() {
      this.loading = true;
      APIinterface.fetchDataPost(
        "loadTips",
        "cart_uuid=" + APIinterface.getStorage("cart_uuid")
      )
        .then((data) => {
          this.data = data.details;
          this.tips = data.details.tips;
          this.tips_amount = data.details.tips;
        })
        .catch((error) => {
          this.data = [];
        })
        .then((data) => {
          this.loading = false;
        });
    },
    updateTips() {
      if (this.tips === "fixed") {
        this.dialog = !this.dialog;
      } else {
        this.addTips(this.tips);
      }
    },
    addTips(value) {
      this.inner_loading = true;
      const $params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        value: value,
        is_manual: false,
      };
      APIinterface.fetchDataByTokenPost("checkoutAddTips", $params)
        .then((data) => {
          this.data.tips = value;
          this.$emit("afterApplytips");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.inner_loading = false;
        });
    },
    onSubmit() {
      this.form_loading = true;
      const $params = {
        cart_uuid: APIinterface.getStorage("cart_uuid"),
        value: this.tips_amount,
        is_manual: true,
      };
      APIinterface.fetchDataByTokenPost("checkoutAddTips", $params)
        .then((data) => {
          this.dialog = false;
          this.data.tips = this.tips_amount;
          this.$emit("afterApplytips");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.form_loading = false;
        });
    },
    removeTips() {
      this.inner_loading = true;
      APIinterface.fetchDataByTokenPost(
        "removeTips",
        "cart_uuid=" + APIinterface.getStorage("cart_uuid")
      )
        .then((data) => {
          this.data.tips = 0;
          this.tips = 0;
          this.$emit("afterApplytips");
        })
        .catch((error) => {
          APIinterface.notify("dark", error, "error_outline", this.$q);
        })
        .then((data) => {
          this.inner_loading = false;
        });
    },
  },
};
</script>
