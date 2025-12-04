<template>
  <q-virtual-scroll :items="data" virtual-scroll-horizontal v-slot="{ item }">
    <q-btn
      no-caps
      unelevated
      size="13px"
      rounded
      :color="value == item.price ? 'primary' : 'grey-2'"
      :text-color="value == item.price ? 'white' : 'dark'"
      @click="setTip(item.price)"
      :disable="loading"
      :loading="tip_set == item.price && loading ? true : false"
      class="q-mr-sm"
    >
      <template v-if="item.tip_type == 'fixed'">
        <div class="text-weight-boldx">{{ item.label }}</div>
      </template>
      <template v-else>
        <div class="column">
          <div class="col line-normal text-weight-boldx">
            {{ item.label }}
          </div>
          <div
            class="col line-normal text-caption text-greyx"
            :class="{
              'text-grey': value != item.price,
              'text-white': value == item.price,
            }"
          >
            {{ item.price_pretty }}
          </div>
        </div>
      </template>
    </q-btn>
  </q-virtual-scroll>

  <q-dialog
    v-model="modal"
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
    transition-duration="500"
    @before-show="onBeforeShow"
  >
    <q-card>
      <q-toolbar class="text-dark">
        <q-toolbar-title>
          <div class="text-subtitle1 text-weight-bold">
            {{ $t("Add a tip") }}
          </div>
        </q-toolbar-title>
        <q-btn
          icon="close"
          dense
          no-caps
          flat
          color="grey"
          @click="modal = false"
        ></q-btn>
      </q-toolbar>
      <q-card-section class="q-pa-xl">
        <q-input v-model="tip" type="number">
          <template v-slot:prepend>
            <div class="text-subtitle1">{{ currency_symbol }}</div>
          </template>
        </q-input>
      </q-card-section>
      <q-card-actions class="row q-pl-md q-pr-md q-pb-md">
        <q-btn
          class="col"
          no-caps
          unelevated
          color="mygrey"
          text-color="dark"
          size="lg"
          rounded
          :disable="loading"
          @click="addTip(0)"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("No tip") }}
          </div>
        </q-btn>
        <q-btn
          :disable="!tip"
          class="col"
          no-caps
          unelevated
          :color="!tip ? 'disabled' : 'primary'"
          :text-color="!tip ? 'disabled' : 'white'"
          size="lg"
          rounded
          @click="addTip(this.tip)"
          :loading="loading"
        >
          <div class="text-subtitle2 text-weight-bold">
            {{ $t("Add") }}
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import APIinterface from "src/api/APIinterface";

export default {
  name: "TipSelections",
  props: ["cart_uuid", "data", "value", "currency_code", "currency_symbol"],
  data() {
    return {
      tip: 0,
      tip_set: 0,
      modal: false,
      loading: false,
    };
  },
  emits: ["after-applytip"],
  methods: {
    onBeforeShow() {
      this.tip = 0;
      this.tip_set = 0;
    },
    setTip(value) {
      if (value == "fixed") {
        this.tip_set = 0;
        this.modal = true;
        return;
      }
      this.tip_set = value;
      this.addTip(value);
    },
    async addTip(value) {
      try {
        this.loading = true;
        const results = await APIinterface.fetchDataByTokenPost(
          "checkoutAddTips",
          new URLSearchParams({
            cart_uuid: this.cart_uuid,
            currency_code: this.currency_code,
            tip_value: value,
          }).toString()
        );
        console.log("results", results);
        this.$emit("afterApplytip");
      } catch (error) {
        APIinterface.notify("negative", error, "error_outline", this.$q);
      } finally {
        this.loading = false;
        this.modal = false;
      }
    },
  },
};
</script>
