<script setup>
import BookingLoading from '@/components/rooms/BookingLoading.vue';
import { Icon } from '@iconify/vue';
import { storeToRefs } from 'pinia';
import TwCities from '@/assets/TwCities.json';

definePageMeta({
	middleware: ['auth'],
});

const { $swal } = useNuxtApp();
const router = useRouter();
const bookingStore = useBookingStore();
const { roomData, stayDuration, bookingData } = storeToRefs(bookingStore);
const userStore = useUserStore();
const { userData, userToken } = storeToRefs(userStore);
const isLoading = ref(false);
const API_URL = useApiUrl();

const goBack = () => {
	router.back();
};

// 確認訂房
const confirmBooking = async () => {
	isLoading.value = true;
	const data = {
		roomId: bookingData.value.roomId,
		checkInDate: bookingData.value.start,
		checkOutDate: bookingData.value.end,
		peopleNum: bookingData.value.people,
		userInfo: { ...orderUserData.value },
	};

	try {
		isLoading.value = true;

		const response = await $fetch('/orders', {
			baseURL: API_URL,
			method: 'POST',
			headers: {
				Authorization: userToken.value,
			},
			body: {
				...data,
			},
		});

		const bookingId = response?.result?._id;

		$swal.fire({
			position: 'center',
			icon: 'success',
			title: '預訂成功',
			showConfirmButton: false,
			timer: 1500,
		});

		router.push({
			name: 'booking-confirmation-bookingId',
			params: {
				bookingId,
			},
		});
	} catch (error) {
		const { message } = error.response?._data;
		$swal.fire({
			position: 'center',
			icon: 'error',
			title: '預訂失敗',
			text: message,
			showConfirmButton: true,
			confirmButtonText: '確認',
		});
	} finally {
		isLoading.value = false;
	}
};

// 總價
const accommodationCost = computed(() => {
	return roomData.value.price * stayDuration.value;
});

// 總金額
const totalPrice = computed(() => {
	return accommodationCost.value - 1000;
});

// 格式化日期
const formatDate = (dateStr) => {
	const options = {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	};
	const date = new Date(dateStr);

	// 替換英文星期名稱為中文
	const formattedDate = date.toLocaleDateString('zh-Hant-TW', options);

	return formattedDate;
};

const orderUserData = ref({
	name: '',
	phone: '',
	email: '',
	address: {
		zipcode: '',
		detail: '',
		county: '',
		city: '',
	},
});

// 套用會員資料
const applyMemberData = () => {
	orderUserData.value = { ...userData.value };
	selectedCity.value = orderUserData.value.address.city;
	selectedDistrict.value = orderUserData.value.address.county;
	selectedCode.value = orderUserData.value.address.zipcode;
};

// 地址
const cityList = ref(TwCities.map((city) => city.name));
const selectedCity = ref('臺北市');
const selectedDistrict = ref('');
const selectedCode = ref('');

// 某縣市的區鄉鎮
const selectedDistrictData = computed(() => {
	const city = TwCities.find((item) => item.name === selectedCity.value);
	return city ? city.districts : [];
});

// 預設區 & 郵遞區號
const defaultDistrict = computed(() => selectedDistrictData.value[0]);
selectedDistrict.value = defaultDistrict.value
	? defaultDistrict.value.name
	: '';
selectedCode.value = defaultDistrict.value ? defaultDistrict.value.zip : '';

// 監聽選擇的城市變更
watch(selectedCity, () => {
	const firstDistrict = selectedDistrictData.value[0];
	selectedDistrict.value = firstDistrict ? firstDistrict.name : '';
	selectedCode.value = firstDistrict ? firstDistrict.zip : '';
});

// 監聽選擇的區域變更
watch(selectedDistrict, (district) => {
	const districtData = selectedDistrictData.value.find(
		(item) => item.name === district
	);
	selectedCode.value = districtData ? districtData.zip : '';
});
</script>

<template>
	<main class="pt-18 pt-md-30 bg-neutral-120">
		<section class="py-10 py-md-30 bg-primary-10">
			<div class="container">
				<button
					class="d-flex align-items-baseline gap-2 mb-10 bg-transparent border-0"
					type="button"
					@click="goBack"
				>
					<Icon class="fs-5 text-neutral-100" icon="mdi:keyboard-arrow-left" />
					<h1 class="mb-0 text-neutral-100 fs-3 fw-bold">確認訂房資訊</h1>
				</button>

				<div class="row gap-10 gap-md-0">
					<div class="col-12 col-md-7">
						<section>
							<h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
								訂房資訊
							</h2>
							<div class="d-flex flex-column gap-6">
								<div
									class="d-flex justify-content-between align-items-center text-neutral-100"
								>
									<div>
										<h3 class="title-deco mb-2 fs-7 fw-bold">選擇房型</h3>
										<p class="mb-0 fw-medium">{{ roomData.name }}</p>
									</div>
									<button
										class="bg-transparent border-0 fw-bold text-decoration-underline"
										type="button"
									>
										編輯
									</button>
								</div>
								<div
									class="d-flex justify-content-between align-items-center text-neutral-100"
								>
									<div>
										<h3 class="title-deco mb-2 fs-7 fw-bold">訂房日期</h3>
										<p class="mb-2 fw-medium">
											入住：{{ formatDate(bookingData.start) }}
										</p>
										<p class="mb-0 fw-medium">
											退房：{{ formatDate(bookingData.end) }}
										</p>
									</div>
									<button
										class="bg-transparent border-0 fw-bold text-decoration-underline"
										type="button"
									>
										編輯
									</button>
								</div>
								<div
									class="d-flex justify-content-between align-items-center text-neutral-100"
								>
									<div>
										<h3 class="title-deco mb-2 fs-7 fw-bold">房客人數</h3>
										<p class="mb-0 fw-medium">{{ bookingData.people }} 人</p>
									</div>
									<button
										class="bg-transparent border-0 fw-bold text-decoration-underline"
										type="button"
									>
										編輯
									</button>
								</div>
							</div>
						</section>

						<hr class="my-10 my-md-12 opacity-100 text-neutral-60" />

						<section>
							<div
								class="d-flex justify-content-between align-items-center mb-10"
							>
								<h2 class="mb-0 text-neutral-100 fs-6 fs-md-4 fw-bold">
									訂房人資訊
								</h2>
								<button
									class="text-primary-100 bg-transparent border-0 fw-bold text-decoration-underline"
									type="button"
									@click="applyMemberData"
								>
									套用會員資料
								</button>
							</div>

							<div class="d-flex flex-column gap-6">
								<div class="text-neutral-100">
									<label for="name" class="form-label fs-8 fs-md-7 fw-bold">
										姓名
									</label>
									<input
										id="name"
										type="text"
										class="form-control p-4 fs-8 fs-md-7 rounded-3"
										placeholder="請輸入姓名"
										v-model="orderUserData.name"
									/>
								</div>

								<div class="text-neutral-100">
									<label for="phone" class="form-label fs-8 fs-md-7 fw-bold">
										手機號碼
									</label>
									<input
										id="phone"
										type="tel"
										class="form-control p-4 fs-8 fs-md-7 rounded-3"
										placeholder="請輸入手機號碼"
										v-model="orderUserData.phone"
									/>
								</div>

								<div class="text-neutral-100">
									<label for="email" class="form-label fs-8 fs-md-7 fw-bold">
										電子信箱
									</label>
									<input
										id="email"
										type="email"
										class="form-control p-4 fs-8 fs-md-7 rounded-3"
										placeholder="請輸入電子信箱"
										v-model="orderUserData.email"
									/>
								</div>

								<div class="text-neutral-100">
									<label for="address" class="form-label fs-8 fs-md-7 fw-bold">
										地址
									</label>
									<div className="d-flex gap-2 mb-4">
										<select
											class="form-select w-50 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3"
											v-model="orderUserData.address.city"
										>
											<option
												:value="city"
												v-for="(city, index) in cityList"
												:key="index"
											>
												{{ city }}
											</option>
										</select>
										<select
											class="form-select w-50 p-4 text-neutral-80 fs-8 fs-md-7 fw-medium rounded-3"
											v-model="orderUserData.address.county"
										>
											<option
												v-for="item in selectedDistrictData"
												:key="item.name"
												:value="item.name"
											>
												{{ item.name }}
											</option>
										</select>
									</div>
									<input
										id="address"
										type="text"
										class="form-control p-4 fs-8 fs-md-7 rounded-3"
										placeholder="請輸入詳細地址"
										v-model="orderUserData.address.detail"
									/>
								</div>
							</div>
						</section>

						<hr class="my-10 my-md-12 opacity-100 text-neutral-60" />

						<section>
							<h2 class="mb-8 mb-md-10 text-neutral-100 fs-6 fs-md-4 fw-bold">
								房間資訊
							</h2>
							<div class="d-flex flex-column gap-6">
								<section>
									<h3 class="title-deco mb-4 mb-md-6 fs-7 fs-md-5 fw-bold">
										房型基本資訊
									</h3>
									<ul class="d-flex gap-4 list-unstyled">
										<li
											class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3"
										>
											<Icon
												class="mb-2 fs-5 text-primary-100"
												icon="fluent:slide-size-24-filled"
											/>
											<p class="mb-0 fw-bold text-neutral-80 text-nowrap">
												{{ roomData.areaInfo }}
											</p>
										</li>
										<li
											class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3"
										>
											<Icon
												class="mb-2 fs-5 text-primary-100"
												icon="material-symbols:king-bed"
											/>
											<p class="mb-0 fw-bold text-neutral-80 text-nowrap">
												{{ roomData.bedInfo }}
											</p>
										</li>
										<li
											class="card-info px-4 py-5 bg-neutral-0 border border-primary-40 rounded-3"
										>
											<Icon
												class="mb-2 fs-5 text-primary-100"
												icon="ic:baseline-person"
											/>
											<p class="mb-0 fw-bold text-neutral-80 text-nowrap">
												2-{{ roomData.maxPeople }} 人
											</p>
										</li>
									</ul>
								</section>

								<section>
									<h3
										class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold"
									>
										房間格局
									</h3>
									<ul
										class="d-flex flex-wrap gap-6 gap-md-10 p-6 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled"
									>
										<li class="d-flex gap-2">
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">市景</p>
										</li>
										<li class="d-flex gap-2">
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">獨立衛浴</p>
										</li>
										<li class="d-flex gap-2">
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">客廳</p>
										</li>
										<li class="d-flex gap-2">
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">書房</p>
										</li>
										<li class="d-flex gap-2">
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">樓層電梯</p>
										</li>
									</ul>
								</section>

								<section>
									<h3
										class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold"
									>
										房內設備
									</h3>
									<ul
										class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled"
									>
										<li
											class="flex-item d-flex gap-2"
											v-for="item in roomData.facilityInfo"
											:key="item.title"
										>
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">
												{{ item.title }}
											</p>
										</li>
									</ul>
								</section>

								<section>
									<h3
										class="title-deco mb-4 mb-md-6 text-neutral-100 fs-7 fs-md-5 fw-bold"
									>
										備品提供
									</h3>
									<ul
										class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 rounded-3 list-unstyled"
									>
										<li
											class="flex-item d-flex gap-2"
											v-for="item in roomData.amenityInfo"
											:key="item.title"
										>
											<Icon
												class="fs-5 text-primary-100"
												icon="material-symbols:check"
											/>
											<p class="mb-0 text-neutral-80 fw-bold">
												{{ item.title }}
											</p>
										</li>
									</ul>
								</section>
							</div>
						</section>
					</div>

					<div class="col-12 col-md-5">
						<div
							class="confirm-form rounded-3xl d-flex flex-column gap-10 p-6 p-md-10 mx-auto ms-md-auto me-md-0 bg-neutral-0"
						>
							<img
								class="img-fluid rounded-3"
								:src="roomData.imageUrl"
								:alt="roomData.name"
							/>

							<div>
								<h2 className="mb-6 text-neutral-100 fs-6 fs-md-4 fw-bold">
									價格詳情
								</h2>
								<div
									class="d-flex justify-content-between align-items-center mb-3"
								>
									<div
										class="d-flex align-items-center text-neutral-100 fw-medium"
									>
										<span>NT$ {{ $formatNumber(roomData.price) }}</span>
										<Icon
											class="ms-2 me-1 text-neutral-80"
											icon="material-symbols:close"
										/>
										<span class="text-neutral-80">{{ stayDuration }} 晚</span>
									</div>
									<span class="fw-medium">
										NT$ {{ $formatNumber(accommodationCost) }}
									</span>
								</div>
								<div
									class="d-flex justify-content-between align-items-center fw-medium"
								>
									<p class="d-flex align-items-center mb-0 text-neutral-100">
										住宿折扣
									</p>
									<span class="text-primary-100"> -NT$ 1,000 </span>
								</div>
								<hr class="my-6 opacity-100 text-neutral-40" />
								<div
									class="d-flex justify-content-between align-items-center text-neutral-100 fw-bold"
								>
									<p class="d-flex align-items-center mb-0">總價</p>
									<span> NT$ {{ $formatNumber(totalPrice) }} </span>
								</div>
							</div>

							<button
								class="btn btn-primary-100 py-4 text-neutral-0 fw-bold rounded-3"
								type="button"
								@click="confirmBooking"
							>
								確認訂房
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>

		<BookingLoading v-if="isLoading" />
	</main>
</template>

<style lang="scss" scoped>
@import 'bootstrap/scss/mixins/breakpoints';

$grid-breakpoints: (
	xs: 0,
	sm: 576px,
	md: 768px,
	lg: 992px,
	xl: 1200px,
	xxl: 1400px,
	xxxl: 1537px,
);

.title-deco {
	display: flex;
	align-items: center;
}

.title-deco::before {
	content: '';
	display: inline-block;
	width: 4px;
	height: 24px;
	background-color: #bf9d7d;
	border-radius: 10px;
	margin-right: 0.75rem;
}

.form-control::placeholder {
	--neutral-60: #909090;
	color: var(--neutral-60);
	font-weight: 500;
}

.card-info {
	width: 97px;
	height: 97px;
}

.flex-item {
	flex: 1 1 15%;

	@include media-breakpoint-down(md) {
		flex-basis: 40%;
	}
}

.rounded-3xl {
	border-radius: 1.25rem;
}

.confirm-form {
	position: sticky;
	top: 160px;
	max-width: 478px;

	@include media-breakpoint-down(md) {
		position: static;
		top: 0;
		max-width: auto;
	}
}
</style>

