import { defineStore } from "pinia";
import APIinterface from "src/api/APIinterface";
// PWA-only: Using HTML5 Audio API instead of NativeAudio
import { Notify } from "quasar";
import { useDataStorePersisted } from "./DataStorePersisted";
import AppLocation from "src/api/AppLocation";

export const useDataStore = defineStore("DataStore", {
  state: () => ({
    data: [],
    loading_home: false,
    show_toobar: true,
    app_version: null,
    device_token: null,
    receive_event: null,
    receive_eventTracking: null,
    is_messaging_supported: null,
    show_webpush: null,
    is_refresh_order: null,

    ordertypeColor: {
      delivery: {
        bg: "cyan-1",
        text: "cyan-9",
      },
      pickup: {
        bg: "light-green-1",
        text: "light-green-9",
      },
      dinein: {
        bg: "yellow-1",
        text: "yellow-8",
      },
      takeout: {
        bg: "lime-1",
        text: "lime-9",
      },
    },

    paymentStatusColor: {
      paid: {
        bg: "purple-1",
        text: "purple-8",
      },
      unpaid: {
        bg: "blue-grey-1",
        text: "blue-grey-8",
      },
    },

    statusColor: {
      new: {
        bg: "blue-1",
        text: "blue-9",
      },
      rejected: {
        bg: "red-1",
        text: "red-10",
      },
      ready_for_pickup: {
        bg: "amber-2",
        text: "amber-10",
      },
      delivery_on_its_way: {
        bg: "indigo-1",
        text: "indigo-9",
      },
      delivered: {
        bg: "green-1",
        text: "green-9",
      },
      cancelled: {
        bg: "grey-3",
        text: "grey-9",
      },
      delayed: {
        bg: "orange-1",
        text: "orange-10",
      },
      delivery_failed: {
        bg: "red-2",
        text: "red-10",
      },
      accepted: {
        bg: "teal-1",
        text: "teal-10",
      },
      complete: {
        bg: "yellow-2",
        text: "yellow-10",
      },
    },

    statusBookingColor: {
      pending: {
        bg: "blue-1",
        text: "blue-9",
      },
      no_show: {
        bg: "red-1",
        text: "red-10",
      },
      waitlist: {
        bg: "amber-2",
        text: "amber-10",
      },
      confirmed: {
        bg: "green-1",
        text: "green-9",
      },
      cancelled: {
        bg: "red-2",
        text: "red-9",
      },
      delayed: {
        bg: "orange-1",
        text: "orange-10",
      },
      denied: {
        bg: "red-2",
        text: "red-10",
      },
      finished: {
        bg: "teal-1",
        text: "teal-10",
      },
      complete: {
        bg: "yellow-2",
        text: "yellow-10",
      },
    },

    notificationColor: {
      order_update: {
        bg: "amber-1",
        text: "amber-8",
      },
      "chat-message": {
        bg: "red-1",
        text: "red-8",
      },
      booking: {
        bg: "teal-1",
        text: "teal-10",
      },
    },

    //
  }),

  getters: {
    doubleCount(state) {
      return state.counter * 2;
    },
  },

  actions: {
    async fetchHome(client_uuid) {
      const DataStorePersisted = useDataStorePersisted();
      try {
        this.loading_home = true;
        const params = new URLSearchParams({
          client_uuid: client_uuid ?? "",
          currency_code: DataStorePersisted.getCurrency,
        }).toString();
        const response = await APIinterface.fetchDataGet(`fetchHome`, params);
        this.data.home_data = response.details;
      } catch (error) {
        console.log("error", error);
      } finally {
        this.loading_home = false;
      }
    },
    clearCache() {
      this.$reset();
    },
    cleanData(value) {
      if (this.data[value]) {
        this.data[value] = null;
      }
    },

    async fetchLocation() {
      return new Promise((resolve, reject) => {
        AppLocation.checkAccuracy()
          .then((data) => {
            //
            AppLocation.getPosition()
              .then((data) => {
                resolve({
                  latitude: data.lat,
                  longitude: data.lng,
                });
              })
              .catch((error) => {
                reject(error);
              })
              .then((data) => {});
            //
          })
          .catch((error) => {
            reject(error);
          })
          .then((data) => {
            //
          });
      });
    },

    async fetchWebLocation(t) {
      if (navigator.geolocation) {
        return new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (data) => {
              resolve({
                latitude: data.coords.latitude,
                longitude: data.coords.longitude,
              });
            },
            (error) => {
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  reject(t("Error: Permission denied.") + " " + error.message);
                  break;
                case error.POSITION_UNAVAILABLE:
                  reject(
                    t("Error: Position unavailable.") + " " + error.message
                  );
                  break;
                case error.TIMEOUT:
                  reject(t("Error: Request timed out.") + " " + error.message);
                  break;
                default:
                  reject(
                    t("Error: An unknown error occurred.") + " " + error.message
                  );
                  break;
              }
            },
            {
              enableHighAccuracy: true, // Request high accuracy
              timeout: 10000, // Set a timeout in milliseconds
              maximumAge: 0, // Do not use cached location
            }
          );
        });
      } else {
        return Promise.reject(
          new Error("Geolocation is not supported by this browser.")
        );
      }
    },

    async clientAddresses() {
      try {
        const response = await APIinterface.fetchGet("clientAddresses");
        this.data.address_book = response.details.addresses;
      } catch (error) {
        this.data.address_book = null;
      } finally {
      }
    },

    playAlert(message) {
      if (!message) {
        return;
      }
      // PWA: Use HTML5 Audio
      try {
        const audio = new Audio('/notify.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
      Notify.create({
        type: "warning",
        html: true,
        message: message,
        timeout: 3000,
        position: "top-right",
        icon: "notifications_active",
        classes: "mynotification",
      });
    },

    compareVersions(v1, v2) {
      v1 = String(v1);
      v2 = String(v2);

      const a = v1.split(".").map(Number);
      const b = v2.split(".").map(Number);
      const len = Math.max(a.length, b.length);

      for (let i = 0; i < len; i++) {
        const x = a[i] || 0;
        const y = b[i] || 0;

        if (x < y) return -1; // v1 is older
        if (x > y) return 1; // v1 is newer
      }
      return 0; // equal
    },

    PlayAudio(audioId) {
      if (!audioId) {
        return;
      }
      // PWA: Use HTML5 Audio
      try {
        const audio = new Audio(`/${audioId}.mp3`);
        audio.play().catch(() => {});
      } catch (e) {}
    },

    isPWA() {
      const isPwa =
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true;
      return isPwa;
    },

    //
  },
});
