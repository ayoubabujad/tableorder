<template>
  <span>{{ total }}</span>
</template>

<script>
import { NumberFormat } from "@coders-tm/vue-number-format";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "NumberFormat",
  props: ["amount", "money_config"],
  data() {
    return {
      total: 0,
      number: undefined,
    };
  },
  computed: {
    config() {
      // Use prop if provided, otherwise use store config
      return this.money_config || this.SettingStore.settings_data.money_config;
    },
  },
  created() {
    this.initFormatter();
  },
  methods: {
    initFormatter() {
      if (this.config) {
        this.number = new NumberFormat(this.config);
        this.total = this.number.format(this.amount);
      }
    },
  },
  watch: {
    amount(newval) {
      if (this.number) {
        this.total = this.number.format(newval);
      }
    },
    config: {
      handler() {
        this.initFormatter();
      },
      deep: true,
    },
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
};
</script>
