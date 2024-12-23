// 計算天數差
export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.provide('daysBetween', (checkInDate, checkOutDate) => {
		const inDate = new Date(checkInDate);
		const outDate = new Date(checkOutDate);
		const timeDifference = outDate - inDate;
		return timeDifference / (1000 * 3600 * 24);
	});
});
