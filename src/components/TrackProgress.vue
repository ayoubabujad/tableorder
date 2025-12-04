<template>
  <div class="q-pl-mdx q-pr-mdx">
    <div class="row items-center justify-center">
      <template v-for="(items, index) in orderSteps" :key="items">
        <div class="col-md-auto">
          <q-icon
            :name="items.icon"
            size="sm"
            :color="order_progress >= items.progress ? 'primary' : 'grey'"
          ></q-icon>
        </div>
        <div class="col" v-if="orderSteps.length > index + 1">
          <div class="q-pl-xs q-pr-xs">
            <q-linear-progress
              rounded
              size="8px"
              :value="order_progress >= items.progress ? 1 : 0"
              :indeterminate="order_progress == items.progress ? true : false"
            />
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: "TrackProgress",
  props: ["order_type", "order_progress"],
  data() {
    return {
      // Modern universal icons
      orderSteps: [
        { progress: 1, icon: "o_verified" },
        { progress: 2, icon: "o_pending_actions" },
        { progress: 3, icon: "o_two_wheeler" },
        { progress: 4, icon: "o_where_to_vote" },
      ],
    };
  },
  mounted() {
    this.setSteps();
  },
  watch: {
    order_type(newval, oldval) {
      this.setSteps();
    },
  },
  methods: {
    setSteps() {
      if (this.order_type == "delivery") {
        // Delivery: Confirmed → Preparing → Shipping → Delivered
        this.orderSteps = [
          { progress: 1, icon: "o_verified" },
          { progress: 2, icon: "o_pending_actions" },
          { progress: 3, icon: "o_two_wheeler" },
          { progress: 4, icon: "o_where_to_vote" },
        ];
      } else if (this.order_type == "pickup") {
        // Pickup: Confirmed → Preparing → Ready
        this.orderSteps = [
          { progress: 1, icon: "o_verified" },
          { progress: 2, icon: "o_pending_actions" },
          { progress: 4, icon: "o_inventory_2" },
        ];
      } else {
        // Dine-in: Confirmed → Preparing → Complete
        this.orderSteps = [
          { progress: 1, icon: "o_verified" },
          { progress: 2, icon: "o_pending_actions" },
          { progress: 4, icon: "o_task_alt" },
        ];
      }
    },
  },
};
</script>
