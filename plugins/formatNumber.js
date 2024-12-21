export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.provide('formatNumber', (number) => number.toLocaleString());
});
