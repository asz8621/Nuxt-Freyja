<script setup>
const userStore = useUserStore();
const { setUserdata, setToken } = userStore;
const userData = useCookie('userData');
const token = useCookie('token');

setUserdata(userData.value);
setToken(token.value);
</script>

<template>
	<LayoutAppHeader />
	<slot />
	<LayoutAppFooter />
</template>

<style lang="scss" scoped></style>

