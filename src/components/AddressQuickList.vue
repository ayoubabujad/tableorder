<template>
  <q-dialog
    v-model="modal"
    persistent
    position="bottom"
    transition-show="fade"
    transition-hide="fadeout"
    @before-show="beforeShow"
  >
    <q-card
      :class="{
        'bg-grey600 text-white': $q.dark.mode,
      }"
    >
      <q-card-section
        v-if="!SettingStore.addresses_loading"
        class="row items-center q-pb-none"
      >
        <div class="text-h6 text-weight-bold">{{ $t("Change address") }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section style="max-height: 70vh; min-height: 30vh" class="scroll">
        <template v-if="SettingStore.addresses_loading">
          <q-list>
            <q-item v-for="items in 3" :key="items">
              <q-item-section avatar
                ><q-skeleton type="QAvatar"
              /></q-item-section>
              <q-item-section
                ><q-skeleton height="20px" square
              /></q-item-section>
            </q-item>
          </q-list>
        </template>
        <template v-else>
          <template v-if="SettingStore.hasAddressData">
            <q-list>
              <template
                v-for="items in SettingStore.addresses_data"
                :key="items.address_uuid"
              >
                <q-item clickable v-ripple @click.stop="setPlaceID(items)">
                  <q-item-section avatar top>
                    <q-icon name="o_place" color="yellow-9" size="24px" />
                  </q-item-section>
                  <q-item-section top>
                    <q-item-label class="text-weight-bold text-caption">
                      {{ items.attributes.address_label }}
                    </q-item-label>
                    <q-item-label lines="2">
                      {{ items.address.complete_delivery_address }}
                    </q-item-label>
                    <!-- <q-item-label v-if="items.address.address1">{{
                      items.address.address1
                    }}</q-item-label>
                    <q-item-label v-else>{{
                      items.address.address2
                    }}</q-item-label>
                    <q-item-label caption>{{
                      items.address.formatted_address
                    }}</q-item-label> -->
                  </q-item-section>
                </q-item>
                <q-separator />
              </template>
            </q-list>
          </template>
          <template v-else>
            <div
              class="text-grey text-body2 text-center flex flex-center"
              style="height: 15vh"
            >
              {{ $t("You haven't saved any addresses yet.") }}
            </div>
          </template>
        </template>
      </q-card-section>

      <q-card-actions>
        <q-btn
          flat
          color="warning"
          class="fit"
          size="17px"
          no-caps
          @click="newAddress"
          :to="{ path: '/location', query: { redirect: this.redirect } }"
        >
          {{ $t("Add new address") }}
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { useSettingStore } from "stores/SettingStore";
export default {
  name: "AddressQuickList",
  props: ["redirect"],
  data() {
    return {
      modal: false,
    };
  },
  setup() {
    const SettingStore = useSettingStore();
    return { SettingStore };
  },
  methods: {
    setPlaceID(data) {
      let location_data = {
        id: data.place_id,
        addressLine1: data.address.address1,
        description: data.address.formatted_address,
        latitude: data.latitude,
        longitude: data.longitude,
      };
      this.modal = false;
      this.$emit("afterSelectaddress", location_data);
    },
    beforeShow() {
      this.SettingStore.clientAddresses();
    },
  },
};
</script>
