export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.provide('formatDate', (dateStr) => {
		const options = {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		const date = new Date(dateStr);

		// 替换英文星期名称为中文
		return date.toLocaleDateString('zh-Hant-TW', options);
	});
});
