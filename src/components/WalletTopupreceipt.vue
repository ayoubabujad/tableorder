<template>
  <q-dialog
    v-model="dialog"
    :position="this.$q.screen.lt.md ? 'bottom' : 'standard'"
    persistent
    @before-hide="beforeHide"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section>
        <div class="text-center">
          <svg
            class="checkmark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle
              class="checkmark__circle"
              cx="26"
              cy="26"
              r="25"
              fill="none"
            />
            <path
              class="checkmark__check"
              fill="none"
              d="M14.1 27.2l7.1 7.2 16.7-16.8"
            />
          </svg>
          <div class="text-h6">{{ $t("Congratulations") }}!</div>
          <div class="text-body2">
            {{ $t("Your digital wallet has been successfully loaded") }}.
          </div>
        </div>

        <q-list bordered dense class="radius10 q-pt-xs q-pb-xs q-mt-sm">
          <q-item dense>
            <q-item-section>
              <q-item-label class="text-caption">{{
                $t("Amount Loaded")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-caption">{{
                data.amount
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label class="text-caption">{{
                $t("Payment Method")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-caption">{{
                data.payment_name
              }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label class="text-caption">{{
                $t("Transaction ID")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label
                class="text-caption ellipsis"
                style="max-width: 150px"
                >{{ data.transaction_id }}</q-item-label
              >
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label class="text-caption">{{
                $t("Date and Time")
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-item-label class="text-caption">{{
                data.transaction_date
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions>
        <q-btn
          :color="$q.dark.mode ? 'grey300' : 'primary'"
          text-color="white"
          :label="$t('Close')"
          class="fit"
          size="17px"
          rounded
          no-caps
          unelevated
          @click="dialog = !dialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: "WalletTopupreceipt",
  props: ["data"],
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    beforeHide() {
      this.$emit("afterReceiptclose");
    },
  },
};
</script>
