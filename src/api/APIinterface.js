import { api } from "boot/axios";
import { LocalStorage, SessionStorage } from "quasar";
import auth from "src/api/auth";
import config from "src/api/config";
// PWA-only: No Capacitor Toast, using Quasar notify instead

const APIinterface = {
  setStorage(key, value) {
    try {
      LocalStorage.set(key, value);
    } catch (e) {
      console.debug(e);
    }
  },
  getStorage(key) {
    return LocalStorage.getItem(key);
  },

  setSession(key, value) {
    try {
      SessionStorage.set(key, value);
    } catch (e) {
      console.debug(e);
    }
  },
  getSession(key) {
    return SessionStorage.getItem(key);
  },

  notify(color, message, icon, $q) {
    $q.notify({
      message,
      color,
      icon,
      position: "bottom",
      html: true,
      timeout: 3000,
      multiLine: false,
    });
  },

  async showToast(message) {
    // PWA fallback: use console + simple alert as backup
    console.log('[Toast]', message);
    // Note: For proper toast, pass $q from component and use notify()
  },

  notify2(color, textColor, message, icon, position, $q) {
    $q.notify({
      message,
      color,
      textColor,
      icon,
      position,
      html: true,
      timeout: 3000,
      multiLine: false,
      actions: [
        {
          // label: 'Dismiss',
          noCaps: true,
          color: "white",
          handler: () => {
            /* ... */
          },
        },
      ],
    });
  },

  ShowAlert(data, isCapacitor, $q, icon) {
    const icons = icon ? icon : "error";
    if (isCapacitor) {
      APIinterface.showToast(data);
    } else {
      APIinterface.notify("dark", data, icons, $q);
    }
  },

  ShowSuccessful(message, $q) {
    $q.notify({
      message: message,
      html: true,
      timeout: 3000,
      position: "top",
      icon: "eva-checkmark-outline",
      iconColor: "green-13",
      classes: "mynotification",
      actions: [
        {
          icon: "eva-close-circle-outline",
          color: "white",
          round: true,
          handler: () => {
            /* ... */
          },
        },
      ],
    });
  },

  dialog(title, message, $q) {
    $q.dialog({
      title: title,
      message: message,
      transitionShow: "fade",
      transitionHide: "fade",
      ok: {
        unelevated: true,
        color: "primary",
        rounded: false,
        "text-color": "white",
        size: "md",
        label: "Okay",
        "no-caps": true,
      },
    })
      .onOk(() => {
        // console.log('OK')
      })
      .onCancel(() => {
        // console.log('Cancel')
      })
      .onDismiss(() => {
        // console.log('I am triggered on both OK and Cancel')
      });
  },

  showLoadingBox(message, $q) {
    $q.loading.show({
      message,
      boxClass: "bg-white text-dark",
      spinnerColor: "grey-4",
      spinnerSize: "30",
      html: true,
    });
  },

  getLocalID() {
    const errorMessage = { code: 2, message: "Local id not found" };
    const localId = APIinterface.getStorage("local_id");
    if (!APIinterface.empty(localId)) {
      return localId;
    }
    throw errorMessage;
  },

  hideLoadingBox($q) {
    $q.loading.hide();
  },

  empty(data) {
    if (
      typeof data === "undefined" ||
      data === null ||
      data === "" ||
      data === "null" ||
      data === "undefined"
    ) {
      return true;
    }
    return false;
  },

  inArray(needle, haystack) {
    const length = haystack.length;
    for (let i = 0; i < length; i++) {
      if (haystack[i] === needle) return true;
    }
    return false;
  },

  getDateNow() {
    var currentDate = new Date();
    var formatted_date = new Date().toJSON().slice(0, 10).replace(/-/g, "-");
    return formatted_date;
  },

  getIcon(data) {
    let $icons = [];
    $icons["driver"] = {
      text: "\ue52f",
      fontFamily: "Material Icons",
      color: "#ffffff",
      fontSize: "18px",
    };
    $icons["merchant"] = {
      text: "\uea12",
      fontFamily: "Material Icons",
      color: "#ffffff",
      fontSize: "18px",
    };
    $icons["customer"] = {
      text: "\ue56a",
      fontFamily: "Material Icons",
      color: "#ffffff",
      fontSize: "18px",
    };
    return $icons[data];
  },

  getLineSymbol() {
    const lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      strokeColor: "#f44336",
    };
    return lineSymbol;
  },

  async fetchData(method, data) {
    return api
      .post("/" + method, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataGet(method, data) {
    return api
      .get("/" + method + "/?" + data)
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataPost(method, data) {
    return api
      .post("/" + method, data)
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchPost(method, data) {
    return api
      .post(
        `${config.api_base_url}/${method}`,
        new URLSearchParams(data).toString()
      )
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchGet1(method, data) {
    return api
      .get(`${config.api_base_url}/${method}`, {
        params: data,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchGet2(method, data) {
    return api
      .get(`${config.api_base_url}/${method}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${auth.getToken()}`,
        },
        params: data,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchGet(method, data) {
    return api
      .get(method, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${auth.getToken()}`,
        },
        params: data,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataByTokenGet(method, data) {
    return api
      .get(method, {
        headers: {
          Authorization: `token ${auth.getToken()}`,
        },
        params: data,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataByBearer(method, data) {
    return api
      .post("/" + method, data, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataByToken(method, data) {
    return api
      .post("/" + method, data, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${auth.getToken()}`,
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataByTokenPost(method, data) {
    return api
      .post("/" + method, data, {
        headers: {
          Authorization: `token ${auth.getToken()}`,
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  // async PaymentPost(method, data) {
  //   return api
  //     .post(config.api_base_url + "/pv1/" + method, data, {
  //       headers: {
  //         Authorization: `token ${auth.getToken()}`,
  //         "Content-Type": "application/json",
  //       },
  //     })
  //     .then((result) => {
  //       if (result.data.code === 1) {
  //         return result.data;
  //       } else {
  //         throw result.data.msg;
  //       }
  //     })
  //     .catch((error) => {
  //       throw error;
  //     });
  // },

  async PaymentPost(method, data, jsonType) {
    let headers = {};
    if (jsonType) {
      headers = {
        "Content-Type": "application/json",
        Authorization: `token ${auth.getToken()}`,
      };
    } else {
      headers = {
        Authorization: `token ${auth.getToken()}`,
      };
    }
    return api
      .post(`${config.api_base_url}/${method}`, data, {
        headers: headers,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async PaymentGet(method, data) {
    return api
      .get(config.api_base_url + "/" + method, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `token ${auth.getToken()}`,
        },
        params: data,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataPostTable(method, data) {
    return api
      .post(config.api_base_url + "/apibooking/" + method, data)
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchDataPostTableToken(method, data) {
    return api
      .post(config.api_base_url + "/apibooking/" + method, data, {
        headers: {
          Authorization: `token ${auth.getToken()}`,
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchGetBooking(method, data) {
    return api
      .get(config.api_base_url + "/apibookingv2/" + method, {
        headers: {
          Authorization: `token ${auth.getToken()}`,
        },
        params: data,
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async fetchPostBooking(method, data) {
    return api
      .post(config.api_base_url + "/apibookingv2/" + method, data, {
        headers: {
          Authorization: `token ${auth.getToken()}`,
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },

  async getMenuItem(params) {
    if (auth.authenticated()) {
      return api
        .post("/getMenuItem2", params, {
          headers: {
            Authorization: `token ${auth.getToken()}`,
          },
        })
        .then((result) => {
          if (result.data.code === 1) {
            return result.data;
          } else {
            throw result.data.msg;
          }
        })
        .catch((error) => {
          throw error;
        });
    } else {
      return api
        .post("/getMenuItem", params)
        .then((result) => {
          if (result.data.code === 1) {
            return result.data;
          } else {
            throw result.data.msg;
          }
        })
        .catch((error) => {
          throw error;
        });
    }
  },

  async fetchDataChats(method, data) {
    return api
      .post(config.api_base_url + "/chatapi/" + method, data, {
        headers: {
          Authorization: `token ${auth.getToken()}`,
        },
      })
      .then((result) => {
        if (result.data.code === 1) {
          return result.data;
        } else if (result.data.code === 3) {
          return result.data;
        } else {
          throw result.data.msg;
        }
      })
      .catch((error) => {
        throw error;
      });
  },
};
export default APIinterface;
