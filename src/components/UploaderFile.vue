<template>
  <q-uploader
    ref="uploader"
    :url="upload_api"
    :label="$t('Upload files')"
    :color="$q.dark.mode ? 'grey600' : 'mygrey'"
    :text-color="$q.dark.mode ? 'grey300' : 'grey'"
    no-thumbnails
    class="full-width q-mb-md"
    flat
    accept=".jpg, image/*"
    bordered
    :max-files="1"
    auto-upload
    max-total-size="1048576"
    max-file-size="1048576"
    :headers="[{ name: 'Authorization', value: `token ${this.getToken()}` }]"
    field-name="file"
    @rejected="onRejectedFiles"
    @uploaded="afterUploaded"
    :form-fields="[{ name: 'upload_path', value: path }]"
    @finish="onFinish"
  />
</template>

<script>
import auth from "src/api/auth";
import config from "src/api/config";
import APIinterface from "src/api/APIinterface";

export default {
  name: "UploaderFile",
  props: ["path"],
  data() {
    return {
      upload_api: config.api_base_url + "/partnerapi/updateAvatar",
      url_image: "",
      filename: "",
      upload_path: "",
    };
  },
  methods: {
    onRejectedFiles(rejectedEntries) {
      rejectedEntries.forEach((file) => {
        let message = "";
        console.log("file", file);
        switch (file.failedPropValidation) {
          case "max-total-size":
          case "max-file-size":
            message = this.$t("file_too_large", {
              file: file.file.name,
              max: "1 MB",
            });
            break;
          case "accept":
            message = this.$t("file_invalid_type", {
              file: file.file.name,
              file_type: file.file?.type,
            });
            break;
          case "max-files":
            message = this.$t("Too many files selected.");
            break;
          default:
            message = this.$t("file_rejected", {
              file: file.file.name,
            });
            break;
        }
        APIinterface.notify("negative", message, "error_outline", this.$q);
      });
    },
    onFinish() {
      this.$refs.uploader.reset();
    },
    pickFiles() {
      this.$refs.uploader.pickFiles();
    },
    getToken() {
      return auth.getToken();
    },
    afterUploaded(files) {
      const response = JSON.parse(files.xhr.responseText);
      if (response.code === 1) {
        this.url_image = response.details.url_image;
        this.filename = response.details.filename;
        this.upload_path = response.details.upload_path;
        this.$emit("afterUploadfile", {
          url_image: this.url_image,
          filename: this.filename,
          upload_path: this.upload_path,
        });
      } else {
        this.url_image = "";
        this.filename = "";
        this.upload_path = "";
        APIinterface.notify("dark", response.msg, "error", this.$q);
      }
    },
  },
};
</script>
