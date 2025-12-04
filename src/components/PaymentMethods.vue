<template>
  <q-dialog v-model="dialog" position="bottom" @before-hide="beforeHide">
    <q-card>
      <q-card-section class="q-pa-none">
        <q-toolbar class="text-primary">
          <q-btn flat round dense icon="close" color="dark" v-close-popup />
          <q-toolbar-title class="font16 text-dark">{{
            $t("Payment Methods")
          }}</q-toolbar-title>
        </q-toolbar>
        <div class="q-pl-md q-pr-md q-pb-md">
          <div class="border-dark-grey q-pa-xs radius20">
            <q-tabs
              v-model="payment_type"
              dense
              class="text-grey"
              active-color="primary"
              indicator-color="primary"
              align="justify"
              narrow-indicator
              no-caps
            >
              <q-tab name="saved" :label="$t('Saved Payment')" />
              <q-tab name="new" :label="$t('New Payment')" />
            </q-tabs>
          </div>

          <q-tab-panels
            v-model="payment_type"
            animated
            swipeable
            style="height: 50vh"
          >
            <q-tab-panel name="saved" class="row flex-center">
              <div class="text-center">
                <q-icon
                  name="o_account_balance_wallet"
                  size="70px"
                  color="grey-3"
                />
                <div class="text-weight-medium font15">
                  {{ $t("You don't have saved payment") }}
                </div>
                <div class="text-grey font12">
                  {{ $t("select payment methods to continue") }}
                </div>
                <q-space class="q-pa-md"></q-space>
              </div>
            </q-tab-panel>

            <q-tab-panel name="new" class="q-pl-none q-pr-none">
              <q-list class="q-list-small">
                <template v-for="items in 5" :key="items">
                  <q-item
                    tag="label"
                    class="bg-mygrey radius10 q-mb-sm"
                    clickable
                  >
                    <q-item-section side>
                      <q-radio
                        v-model="payment_method"
                        :val="items"
                        size="xs"
                        checked-icon="fiber_manual_record"
                        unchecked-icon="fiber_manual_record"
                      />
                    </q-item-section>
                    <q-item-section>{{
                      $t("Cash on delivery")
                    }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "PaymentMethods",
  data() {
    return {
      dialog: false,
      payment_type: "saved",
      payment_method: "",
    };
  },
  methods: {
    showModal(data) {
      this.dialog = data;
    },
    beforeHide() {},
  },
};
</script>
