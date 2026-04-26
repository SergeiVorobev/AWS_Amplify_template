import "./assets/main.css";
import { createApp } from "vue";
import App from "./App.vue";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import ToastService from "primevue/toastservice";
import { createRouter, createWebHistory } from "vue-router";
import TransactionForm from "./views/TransactionForm.vue";
import Analytics from "./views/Analytics.vue";


Amplify.configure(outputs);

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/transactions" },
    { path: "/transactions", component: TransactionForm },
    { path: "/analytics", component: Analytics },
  ],
});

const app = createApp(App);

app.use(router);
app.use(PrimeVue, { theme: { preset: Aura } });
app.use(ToastService);

app.mount("#app");

