<template>
	<div
		class="d-flex min-vh-100 align-items-center text-white"
		style="background-image: linear-gradient(135deg, #eab308 35%, #f59e0b 100%)"
	>
		<div class="container">
			<div class="row justify-content-center">
				<div class="col-12 col-lg-6 text-center p-4">
					<div class="display-1 fw-semibold">{{ error.statusCode }}</div>
				</div>
				<div class="col-12 col-lg-6 text-center text-lg-start p-4">
					<div class="mb-4 fs-3 fw-medium">網站發生了一些意外</div>
					<div class="mb-8 fs-5">{{ error.message }}</div>
					<button
						type="button"
						class="btn btn-outline-light rounded-3 px-4 py-2"
						@click="handleError"
					>
						清除錯誤後回到首頁
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
defineProps({
	error: Object,
});

const handleError = () => clearError({ redirect: '/' });
</script>

