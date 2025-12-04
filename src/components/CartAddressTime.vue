<template>
  <div v-if="hasData" class="text-weight-medium q-mb-xs row items-center">
    <div class="col">
      <template v-if="trans_type == 'delivery'">
        {{ $t("Address and time") }}
      </template>
      <template v-else> Choose time </template>
    </div>
    <div class="col text-right" v-if="trans_type == 'delivery'">
      <q-btn
        flat
        color="primary"
        :label="$t('Change address')"
        no-caps
        class="q-pa-none line-normal"
        @click="this.$refs.address_list.showModal(true)"
      />
    </div>
  </div>
  <q-list v-if="hasData" class="q-list-small2">
    <q-item
      v-if="trans_type == 'delivery'"
      class="bg-mygreyx radius10 q-mb-sm"
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
      clickable
      :to="ischeckout ? '' : '/location'"
      @click="ischeckout ? this.$emit('onclickAddress') : ''"
    >
      <q-item-section avatar>
        <q-icon name="o_pin_drop" size="md" color="grey-4"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-grey font12 ellipsis-2-lines"
          >{{ $t("Delivery address") }}
        </q-item-label>
        <template v-if="hasAddress">
          <q-item-label class="text-weight-medium">
            {{ data.formatted_address }}
          </q-item-label>
          <q-item-label caption>
            {{ data.address1 }}
          </q-item-label>

          <template v-if="ischeckout">
            <q-item-label
              v-if="Object.keys(checkout_address).length > 0"
              caption
            >
              <div>
                {{ checkout_address.attributes.delivery_options }}
              </div>
              <div>
                {{ checkout_address.attributes.delivery_instructions }}
              </div>
            </q-item-label>
          </template>
        </template>
        <template v-else>
          <q-item-label
            class="text-weight-medium"
            :class="{
              'text-grey300': $q.dark.mode,
              'text-dark': !$q.dark.mode,
            }"
          >
            {{ $t("Select your address") }}
          </q-item-label>
        </template>
      </q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_down" size="sm"></q-icon>
      </q-item-section>
    </q-item>
    <q-item
      class="bg-mygreyx radius10 q-mb-sm"
      :class="{
        'bg-grey600 ': $q.dark.mode,
        'bg-mygrey ': !$q.dark.mode,
      }"
      clickable
      @click="showDeliveryTime"
    >
      <q-item-section avatar>
        <q-icon name="o_schedule" size="md" color="grey-4"></q-icon>
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-grey font12 ellipsis-2-lines"
          >{{ $t("Choose prefered time") }}
        </q-item-label>
        <q-item-label
          class="text-weight-medium"
          :class="{
            'text-grey300': $q.dark.mode,
            'text-dark': !$q.dark.mode,
          }"
        >
          <span v-if="data.whento_deliver === 'schedule'">
            ({{ data.delivery_datetime }})
          </span>
          <span v-else>
            <template v-if="data.delivery_option[data.whento_deliver]">
              {{ data.delivery_option[data.whento_deliver].short_name }}
            </template>
          </span>
        </q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_down" size="sm"></q-icon>
      </q-item-section>
    </q-item>

    <template v-if="ischeckout">
      <q-item
        class="bg-mygreyx radius10 q-mb-sm"
        :class="{
          'bg-grey600 ': $q.dark.mode,
          'bg-mygrey ': !$q.dark.mode,
        }"
        clickable
        @click="showVerifyPhone"
      >
        <q-item-section avatar>
          <q-icon name="o_phone_iphone" size="md" color="grey-4"></q-icon>
        </q-item-section>
        <q-item-section>
          <q-item-label class="text-grey font12 ellipsis-2-lines"
            >{{ $t("Contact phone") }}
          </q-item-label>
          <q-item-label class="text-weight-medium">
            <template v-if="phone_number">
              {{ phone_number }}
            </template>
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <q-icon name="keyboard_arrow_down" size="sm"></q-icon>
        </q-item-section>
      </q-item>
    </template>
  </q-list>

  <DeliveryTime
    ref="delivery_time"
    :loading="loading"
    :data="data"
    :whentoDeliver="data.whento_deliver"
    @after-selecttime="afterSelecttime"
  >
  </DeliveryTime>

  <AddressListModal
    ref="address_list"
    @after-selectAddress="afterSelectAddress"
  ></AddressListModal>

  <template v-if="ischeckout">
    <ChangePhone
      ref="change_phone"
      @after-getphone="afterGetphone"
      @after-changephone="afterChangephone"
    ></ChangePhone>
  </template>
</template>

<script>
import { defineAsyncComponent } from "vue";
import APIinterface from "src/api/APIinterface";
import { useDataStorePersisted } from "stores/DataStorePersisted";

export default {
  name: "CartAddressTime",
  props: ["trans_type", "loading", "data", "ischeckout", "checkout_address"],
  data() {
    return {
      phone_number: "",
    };
  },
  components: {
    DeliveryTime: defineAsyncComponent(() =>
      import("components/DeliveryTime.vue")
    ),
    ChangePhone: defineAsyncComponent(() =>
      import("src/components/ChangePhone.vue")
    ),
    AddressListModal: defineAsyncComponent(() =>
      import("src/components/AddressListModal.vue")
    ),
  },
  setup(props) {
    const DataStorePersisted = useDataStorePersisted();
    return { DataStorePersisted };
  },
  computed: {
    hasAddress() {
      if (!APIinterface.empty(this.data.formatted_address)) {
        return true;
      }
      return false;
    },
    hasData() {
      if (Object.keys(this.data).length > 0) {
        return true;
      }
      return false;
    },
  },
  methods: {
    showDeliveryTime() {
      this.$refs.delivery_time.showModal(true);
    },
    showVerifyPhone() {
      this.$refs.change_phone.showModal(true);
    },
    afterGetphone(data) {
      console.log(data);
      this.phone_number = data;
    },
    afterChangephone(data) {
      console.log(data);
      this.phone_number = data;
      this.$emit("afterChangephone");
    },
    afterSelectAddress() {
      this.$emit("afterSelectAddress");
    },
    showAddressList() {
      this.$refs.address_list.showModal(true);
    },
    afterSelecttime() {
      this.$emit("afterSelectAddress");
    },
  },
};
</script>
