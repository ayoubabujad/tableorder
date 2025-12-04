// TABLE ORDER PWA - Simplified Routes
// Only essential routes for QR code table ordering

const routes = [
  // TABLE ORDERING - QR Code Entry Point
  {
    path: "/table/:uuid",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Table/TableEntry.vue"),
        meta: { isTableOrder: true },
      },
    ],
  },

  // Root - redirect to scan instruction or menu
  {
    path: "/",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Table/ScanPrompt.vue"),
      },
    ],
  },

  // Auth routes (minimal - for guest checkout)
  {
    path: "/user",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "login",
        component: () => import("src/pages/User/LoginPage.vue"),
      },
      {
        path: "signup",
        component: () => import("src/pages/User/SignupPage.vue"),
      },
      {
        path: "guest",
        component: () => import("src/pages/User/GuestSignup.vue"),
      },
      {
        path: "loginbyphone",
        component: () => import("src/pages/User/LoginByPhone.vue"),
      },
    ],
  },

  // Menu - main ordering page
  {
    path: "/home",
    component: () => import("layouts/TableOrderLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/Menu/MenuPage.vue") },
    ],
  },
  {
    path: "/menu",
    component: () => import("layouts/TableOrderLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/Menu/MenuPage.vue") },
    ],
  },

  // Cart & Checkout
  {
    path: "/cart",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Cart/CartPage.vue"),
      },
    ],
  },
  {
    path: "/checkout",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Cart/CheckoutPage.vue"),
        meta: { requiresAuth: true, verifyToken: false },
      },
      {
        path: "successful",
        component: () => import("src/pages/Cart/CheckoutSuccesful.vue"),
        meta: { requiresAuth: true },
      },
    ],
  },

  // Order tracking (after placing order)
  {
    path: "/order",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "track",
        component: () => import("src/pages/Cart/CheckoutSuccesful.vue"),
        meta: { requiresAuth: true, verifyToken: false },
      },
    ],
  },

  // Payment selection
  {
    path: "/payment",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Payment/SelectPaymentList.vue"),
        meta: { requiresAuth: true, verifyToken: false },
      },
    ],
  },

  // Legal pages (required)
  {
    path: "/legal",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/Legal/LegalList.vue"),
      },
      {
        path: "page",
        component: () => import("src/pages/Legal/GetPage.vue"),
      },
    ],
  },

  // Network error
  {
    path: "/errornetwork",
    component: () => import("layouts/NotopfooterLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("src/pages/NetworkError.vue"),
      },
    ],
  },

  // 404
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
