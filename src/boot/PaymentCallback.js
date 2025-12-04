import { boot } from "quasar/wrappers";

// PWA-only: No Capacitor deep links needed
// Payment callbacks are handled via regular URL routing in PWA

export default boot(async ({ app, router }) => {
  // PWA handles payment callbacks via query parameters in routes
  // Check for payment callback in URL on app load
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("payment_status");

  if (status === "successful") {
    const order_id = urlParams.get("order_id");
    if (order_id) {
      router.replace({
        path: "/account/trackorder",
        query: { order_uuid: order_id },
      });
    }
  } else if (status === "failed") {
    const message = urlParams.get("message") || "Payment failed";
    app.config.globalProperties.$q.notify({
      message: message,
      color: "negative",
      position: "top",
      timeout: 3000,
    });
  }
});
