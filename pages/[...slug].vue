<script setup>
const route = useRoute();
const router = useRouter();
const event = useRequestEvent(); // 獲取當前請求的事件

// 設定404狀態碼
useRequestEvent(event, 404);

const title = '404 - 找不到此頁面｜高雄享樂酒店';
const description = '404 - 找不到此頁面';

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
	<div class="not-found">
		<h1 class="fw-bold">404 - 找不到頁面</h1>
		<p>抱歉，您所尋找的 {{ route.params.slug.join('/') }} 頁面不存在。</p>
		<button
			type="button"
			class="btn btn-primary-100 py-2 text-neutral-0 fw-bold rounded-3"
			@click="router.push('/')"
		>
			回首頁
		</button>
	</div>
</template>

<style scoped>
.not-found {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	position: relative;
	overflow: hidden;
}

.not-found::before {
	content: '';
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-image: url('/images/home-hero.png');
	background-size: cover;
	background-repeat: no-repeat;
	background-position: center center;
	opacity: 0.5;
	z-index: -1;
}

.not-found h1 {
	font-size: 3rem;
	margin-bottom: 1rem;
}

.not-found p {
	font-size: 1.5rem;
	margin-bottom: 2rem;
}
</style>

