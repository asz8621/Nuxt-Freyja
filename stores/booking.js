export const useBookingStore = defineStore('booking', () => {
	const bookingData = ref({});
	const stayDuration = ref('');
	const roomData = ref({});

	const setBooking = (data) => {
		bookingData.value = data;
	};

	const setStayDuration = (data) => {
		stayDuration.value = data;
	};

	const setRoomData = (data) => {
		roomData.value = data;
	};

	return {
		bookingData,
		stayDuration,
		roomData,
		setBooking,
		setRoomData,
		setStayDuration,
	};
});

