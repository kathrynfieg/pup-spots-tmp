import { createApp } from "vue";
import { VueFire, VueFireAuth } from "vuefire";
import "./style.css";
import { firebaseApp } from "./firebase";
import "@mdi/font/css/materialdesignicons.css";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import App from "./App.vue";

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
});

app.use(VueFire, {
  firebaseApp,
  modules: [VueFireAuth()],
});

app.use(vuetify);

app.mount("#app");
