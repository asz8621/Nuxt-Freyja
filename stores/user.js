export const useUserStore = defineStore('user', () => {
	const userData = ref({});
	const userToken = ref('');

	const setUserdata = (data) => {
		userData.value = data;
	};

	const setToken = (token) => {
		userToken.value = token;
	};

	const initUser = () => {
		userData.value = {};
		userToken.value = '';
	};

	return {
		userData,
		userToken,
		setUserdata,
		setToken,
		initUser,
	};
});

