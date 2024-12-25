<script setup>
// 網址後綴未帶上 order or profile 須轉跳到 profile
const { params, path } = useRoute();
const userId = params.userId;
const pathSegments = path.split('/').filter(Boolean);
if (pathSegments[0] === 'user' && pathSegments.length === 2) {
	navigateTo(`/user/${userId}/profile`);
}
definePageMeta({
	middleware: ['auth'],
});

const title = '會員中心｜高雄享樂酒店';
const description = '高雄享樂酒店會員中心';

useSeoMeta({
	title: () => title,
	description: () => description,
	ogTitle: () => title,
	ogDescription: () => description,
	twitterTitle: () => title,
	twitterDescription: () => description,
});
</script>

<template>
	<NuxtLayout name="user">
		<NuxtPage />
	</NuxtLayout>
</template>

<style scoped></style>

