<template>
  <q-layout view="hHh lpR fFf">
    <!-- Simple Header with Table Info -->
    <q-header class="table-header">
      <q-toolbar class="table-toolbar">
        <div class="table-info" v-if="DataStorePersisted.is_table_order">
          <q-icon name="table_restaurant" size="24px" />
          <div class="table-details">
            <span class="table-label">{{ $t("Table") }}</span>
            <span class="table-name">{{ DataStorePersisted.table_name || '#' + DataStorePersisted.table_id }}</span>
          </div>
        </div>
        <div v-else class="restaurant-name">
          {{ SettingStore.settings_data?.merchant_name || 'Table Order' }}
        </div>

        <q-space />

        <!-- Language Selector -->
        <q-btn
          flat
          round
          icon="language"
          class="lang-btn"
          @click="showLanguage = true"
        />

        <!-- Cart Button with Red Badge -->
        <q-btn
          flat
          round
          icon="shopping_cart"
          class="cart-btn"
          to="/cart"
        >
          <q-badge
            v-if="hasItems"
            color="red"
            floating
          >
            {{ cartCount }}
          </q-badge>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- Floating Cart Bar - Full Width Footer -->
    <transition name="slide-up">
      <div v-if="hasItems" class="floating-cart-footer" @click="goToCart">
        <div class="cart-left">
          <div class="cart-badge-count">{{ cartCount }}</div>
          <div class="cart-text">
            <span class="cart-items-label">{{ cartCount > 1 ? $t("items") : $t("item") }}</span>
            <span class="cart-view-label">{{ $t("View Order") }}</span>
          </div>
        </div>
        <div class="cart-right">
          <span class="cart-total-amount">{{ cartTotal }}</span>
          <q-icon name="chevron_right" size="24px" />
        </div>
      </div>
    </transition>

    <!-- Language Modal -->
    <LanguageModal v-model="showLanguage" />
  </q-layout>
</template>

<script>
import { useDataStorePersisted } from "stores/DataStorePersisted";
import { useSettingStore } from "stores/SettingStore";
import { userCartData } from "stores/CartData";
import { computed, ref, defineAsyncComponent } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "TableOrderLayout",
  components: {
    LanguageModal: defineAsyncComponent(() => import("components/LanguageModal.vue")),
  },
  setup() {
    const DataStorePersisted = useDataStorePersisted();
    const SettingStore = useSettingStore();
    const CartData = userCartData();
    const showLanguage = ref(false);
    const router = useRouter();

    // Use store getters for reactive cart data
    const cartCount = computed(() => CartData.getCartCount);
    const cartTotal = computed(() => CartData.getTotal || CartData.getSubtotal || "");
    const hasItems = computed(() => CartData.hasItem);

    const goToCart = () => {
      router.push("/cart");
    };

    return {
      DataStorePersisted,
      SettingStore,
      CartData,
      cartCount,
      cartTotal,
      hasItems,
      showLanguage,
      goToCart,
    };
  },
};
</script>

<style scoped>
/* Staff App Style - Dark Navy Header */
.table-header {
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table-toolbar {
  padding: 12px 16px;
  min-height: 60px;
}

.table-info {
  display: flex;
  align-items: center;
  gap: 12px;
  color: white;
}

.table-details {
  display: flex;
  flex-direction: column;
}

.table-label {
  font-size: 11px;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table-name {
  font-size: 18px;
  font-weight: 700;
}

.restaurant-name {
  color: white;
  font-size: 18px;
  font-weight: 700;
}

.cart-btn,
.lang-btn {
  color: rgba(255, 255, 255, 0.9);
  position: relative;
}

.cart-btn:hover,
.lang-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

/* ========================================
   FLOATING CART FOOTER - FULL WIDTH
   ======================================== */
.floating-cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  color: white;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
}

.cart-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cart-badge-count {
  background: white;
  color: #1e40af;
  font-size: 14px;
  font-weight: 800;
  min-width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}

.cart-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.cart-items-label {
  font-size: 12px;
  opacity: 0.85;
}

.cart-view-label {
  font-size: 16px;
  font-weight: 700;
}

.cart-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-total-amount {
  font-size: 18px;
  font-weight: 700;
}

/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
