<template>
  <q-dialog v-model="dialog" position="bottom" @before-show="clientAddresses">
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
            >{{ $t("Address") }}</q-toolbar-title
          >
        </q-toolbar>

        <div class="q-pl-md q-pr-md q-pb-md relative-position">
          <template v-if="UserStore.loading_address">
            <div style="min-height: 100px">
              <q-inner-loading
                :showing="true"
                :color="$q.dark.mode ? 'grey300' : 'primary'"
              />
            </div>
          </template>
          <q-list v-else>
            <template v-if="!UserStore.hasAddress">
              <div class="full-width text-center">
                <q-icon name="history" size="70px" color="grey-3" />
                <div class="text-weight-medium font15">
                  {{ $t("You don't have any saved address yet") }}
                </div>
                <div class="text-grey font12">
                  {{ $t("click add new address to add one") }}
                </div>
              </div>
            </template>
            <template
              v-for="items in UserStore.address_data.addresses"
              :key="items"
            >
              <q-item
                class="bg-mygreyx radius10 q-mb-sm"
                clickable
                tag="label"
                :class="{
                  'bg-grey600 ': $q.dark.mode,
                  'bg-mygrey ': !$q.dark.mode,
                }"
              >
                <q-item-section avatar>
                  <q-radio
                    v-model="local_id"
                    :val="items.place_id"
                    size="xs"
                    checked-icon="fiber_manual_record"
                    unchecked-icon="fiber_manual_record"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="text-weight-medium"
                    :class="{
                      'text-grey300': $q.dark.mode,
                      'text-dark': !$q.dark.mode,
                    }"
                  >
                    {{ items.address.formatted_address }}
                  </q-item-label>
                  <q-item-label class="text-grey font12 ellipsis-2-lines">
                    {{ items.address.address2 }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-list>
        </div>
        <q-space class="q-pa-xl"></q-space>
      </q-card-section>
      <q-footer
        v-if="!UserStore.loading_address"
        class="q-pl-md q-pr-md q-pt-sm q-pb-sm bg-whitex"
        :class="{
          'bg-mydark ': $q.dark.mode,
          'bg-white ': !$q.dark.mode,
        }"
      >
        <q-btn
          :label="$t('Add new address')"
          icon="add"
          no-caps
          flat
          color="primary"
          :to="{
            path: '/location',
            query: { redirect: '/checkout' },
          }"
        ></q-btn>
        <q-space class="q-pa-xs"></q-space>
        <q-btn
          type="submit"
          :loading="loading"
          :label="$t('Confirm location')"
          unelevated
          no-caps
          color="primary text-white"
          class="full-width text-weight-bold"
          size="lg"
          rounded
          @click="setPlaceID"
          :disable="!hasAddressSelected"
        />
      </q-footer>
    </q-card>
  </q-dialog>
</template>

<script>
import { useUserStore } from "stores/UserStore";
import APIinterface from "src/api/APIinterface";

export default {
  name: "AddressListModal",
  data() {
    return {
      dialog: false,
      local_id: "",
    };
  },
  computed: {
    hasAddressSelected() {
      if (!APIinterface.empty(this.local_id)) {
        return true;
      }
      return false;
    },
  },
  setup() {
    const UserStore = useUserStore();
    return { UserStore };
  },
  created() {
    this.local_id = APIinterface.getStorage("local_id");
  },
  methods: {
    showModal(data) {
      this.dialog = data;
    },
    clientAddresses() {
      if (Object.keys(this.UserStore.address_data).length > 0) {
        this.UserStore.clientAddresses();
      } else {
        this.UserStore.clientAddresses();
      }
    },
    setPlaceID() {
      this.dialog = false;
      APIinterface.setStorage("local_id", this.local_id);
      this.$emit("afterSelectAddress");
    },
  },
};
</script>
