<template>
  <!-- 🌌 AURORA NAVIGATION BAR -->
  <nav class="aurora-nav">
    <!-- Menu - With Label -->
    <router-link
      to="/home"
      class="aurora-nav-item has-label"
      :class="{ active: $route.path === '/home' }"
    >
      <div class="nav-icon-wrap">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" rx="1.5"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5"/>
        </svg>
      </div>
      <span class="nav-label">{{ $t("Menu") }}</span>
    </router-link>

    <!-- Cart - Icon Only -->
    <router-link
      to="/cart"
      class="aurora-nav-item"
      :class="{ active: $route.path === '/cart' }"
    >
      <div class="nav-icon-wrap">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 6h15l-1.5 9h-12z"/>
          <circle cx="9" cy="20" r="1.5"/>
          <circle cx="18" cy="20" r="1.5"/>
          <path d="M6 6L5 3H2"/>
        </svg>
        <div v-if="CartData.hasItem" class="nav-badge">
          {{ CartData.getCartCount }}
        </div>
      </div>
    </router-link>

    <!-- Orders - Icon Only -->
    <router-link
      to="/orders"
      class="aurora-nav-item"
      :class="{ active: $route.path === '/orders' }"
    >
      <div class="nav-icon-wrap">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="4" y="3" width="16" height="18" rx="2"/>
          <path d="M9 7h6"/>
          <path d="M9 11h6"/>
          <path d="M9 15h4"/>
        </svg>
      </div>
    </router-link>

    <!-- Profile - Icon Only -->
    <router-link
      to="/account-menu"
      class="aurora-nav-item"
      :class="{ active: $route.path.startsWith('/account') }"
    >
      <div class="nav-icon-wrap">
        <svg class="nav-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 4-6 8-6s8 2 8 6"/>
        </svg>
      </div>
    </router-link>
  </nav>
</template>

<script>
import { userCartData } from "stores/CartData";
import { useSettingStore } from "stores/SettingStore";

export default {
  name: "FooterMenu",
  props: ["direction"],
  setup() {
    const CartData = userCartData();
    const SettingStore = useSettingStore();
    return {
      CartData,
      SettingStore,
    };
  },
  data() {
    return {
      booking_enabled: false,
      tab: "home",
    };
  },
  mounted() {
    if (!this.CartData.hasItem) {
      this.CartData.getCart(true, null);
    }

    this.booking_enabled = this.SettingStore.settings_data.booking_enabled;
    if (Object.keys(this.SettingStore.settings_data).length > 0) {
      this.booking_enabled = this.SettingStore.settings_data.booking_enabled;
    } else {
      this.$watch(
        () => this.SettingStore.$state.settings_data,
        (newData, oldData) => {
          this.booking_enabled = newData.booking_enabled;
        }
      );
    }
  },
};
</script>

<style scoped>
/* 🌌 STAFF APP STYLE NAVIGATION BAR */
.aurora-nav {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border-radius: 24px;
  padding: 6px 8px;
  box-shadow:
    0 8px 32px rgba(59, 130, 246, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.15) inset;
}

.aurora-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 14px;
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  gap: 8px;
}

.aurora-nav-item:active {
  transform: scale(0.92);
}

.aurora-nav-item.active {
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(10px);
}

/* Menu item with label - special styling */
.aurora-nav-item.has-label {
  padding: 10px 18px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 20px;
}

.aurora-nav-item.has-label.active {
  background: rgba(255, 255, 255, 0.3);
}

.nav-icon-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Custom SVG Icons */
.nav-svg {
  width: 24px;
  height: 24px;
  stroke: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.aurora-nav-item.active .nav-svg {
  stroke: white;
  transform: scale(1.1);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.aurora-nav-item.has-label .nav-svg {
  width: 20px;
  height: 20px;
}

/* Label - only visible for has-label items */
.nav-label {
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.3px;
  display: none;
}

.aurora-nav-item.has-label .nav-label {
  display: block;
}

.aurora-nav-item.has-label.active .nav-label {
  color: white;
}

/* Badge - Red like Staff App */
.nav-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
  border: 2px solid #3b82f6;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
}

/* Dark Mode */
body.body--dark .aurora-nav {
  background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 50%, #3b82f6 100%);
}
</style>
