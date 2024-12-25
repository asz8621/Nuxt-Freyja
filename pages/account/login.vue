<script setup>
const title = '會員登入｜高雄享樂酒店';
const description =
	'讓高雄享樂酒店的舒適房型陪伴您的旅行，無論是家庭度假還是商務會議，我們都為您提供最貼心的服務與設施。';

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
	<div>
		<AccountLogin />
	</div>
</template>

<style lang="scss" scoped></style>
