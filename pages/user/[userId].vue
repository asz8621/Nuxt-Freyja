<script setup>
// 網址後綴未帶上 order or profile 須轉跳到 profile
const { params, path } = useRoute();
const userId = params.userId;
const pathSegments = path.split('/').filter(Boolean);
if (pathSegments[0] === 'user' && pathSegments.length === 2) {
	navigateTo(`/user/${userId}/profile`);
}
</script>

<template>
	<NuxtLayout name="user">
		<NuxtPage />
	</NuxtLayout>
</template>

<style scoped></style>
