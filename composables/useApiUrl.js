export const useApiUrl = () => {
	const {
		public: { API_URL },
	} = useRuntimeConfig();
	return API_URL;
};
