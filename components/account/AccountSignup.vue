<script setup>
import TwCities from '@/assets/TwCities.json';
import { Icon } from '@iconify/vue';

const API_URL = useApiUrl();
const { $swal } = useNuxtApp();
const isEmailAndPasswordValid = ref(false);
const errorMsg = ref('');
const registerData = ref({
	name: '',
	email: '',
	password: '',
	phone: '',
	birthday: '',
	role: 'user',
	address: {},
});

const registerPassword = ref('');
const checkPassword = ref('');

// 驗證 Email 格式
const validateEmail = (email) => {
	const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return re.test(email);
};

// 第一步確認信箱與密碼
const checkAccount = () => {
	isEmailAndPasswordValid.value = false;
	if (!validateEmail(registerData.value.email)) {
		errorMsg.value = '信箱規格不符合';
		return;
	}

	if (registerPassword.value !== checkPassword.value) {
		errorMsg.value = '請確認密碼是否一致';
		return;
	}

	if (
		registerPassword.value.length < 8 ||
		!/[a-zA-Z]/.test(registerPassword.value) ||
		!/\d/.test(registerPassword.value)
	) {
		errorMsg.value = '密碼長度必須大於 8 碼且包含至少一個英文字母和數字';
		return;
	}
	registerData.value.password = registerPassword.value;
	isEmailAndPasswordValid.value = true;
	errorMsg.value = '';
};

// 生日
const birthdayYear = ref(new Date().getFullYear());
const birthdayMonth = ref('1');
const birthdayDay = ref('1');

const dayArr = computed(() => {
	// 當切換年份或月份時，重設日期為 1
	const validMonth = birthdayMonth.value; // 保留當前月份
	const daysInMonth = new Date(birthdayYear.value, validMonth, 0).getDate();

	// 如果月份更改了，重設日期為 1
	if (birthdayDay.value > daysInMonth) {
		birthdayDay.value = '1'; // 如果選擇的日期大於當月最大天數，重設為 1
	}

	// 返回該月的所有天數
	return Array.from({ length: daysInMonth }, (_, i) => i + 1); // 生成 1 到 daysInMonth 的數字陣列
});

// 計算用戶的生日
const userBirthday = computed(() => {
	return `${birthdayYear.value}/${birthdayMonth.value}/${birthdayDay.value}`;
});

// 地址
const cityList = ref(TwCities.map((city) => city.name));
const selectedCity = ref('臺北市');
const selectedDistrict = ref('');
const selectedCode = ref('');
const detailedAddress = ref('');

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

const isRead = ref(false);

// 驗證手機號碼
const validatePhoneNumber = () => {
	const phoneRegex = /^09\d{8}$/;
	return phoneRegex.test(registerData.value.phone);
};

// 註冊
const register = async () => {
	if (!registerData.value.name || registerData.value.name.length < 2) {
		errorMsg.value = '請輸入至少兩個字的姓名';
		return;
	}
	if (!validatePhoneNumber()) {
		errorMsg.value = '手機號碼格式不正確';
		return;
	}
	if (!detailedAddress.value) {
		errorMsg.value = '請輸入詳細地址';
		return;
	}
	if (!isRead.value) {
		errorMsg.value = '請閱讀並同意本網站個資使用規範';
		return;
	}
	errorMsg.value = '';

	const address = {
		zipcode: selectedCode.value,
		detail: detailedAddress.value,
		county: selectedDistrict.value,
		city: selectedCity.value,
	};
	registerData.value.birthday = userBirthday.value;
	registerData.value.address = address;
	// console.log(registerData.value);

	try {
		await $fetch('/user/signup', {
			baseURL: API_URL,
			method: 'POST',
			body: { ...registerData.value },
		});

		navigateTo('/account/login');
		await $swal.fire({
			position: 'center',
			icon: 'success',
			title: '註冊成功',
			showConfirmButton: false,
			timer: 1250,
		});
	} catch (error) {
		const { message } = error.response?._data;
		$swal.fire({
			position: 'center',
			icon: 'error',
			title: '註冊失敗',
			text: message,
			showConfirmButton: true,
			confirmButtonText: '確認',
		});
	}
};
</script>

<template>
	<div class="p-5 px-md-0 py-md-30">
		<div class="mb-10">
			<p class="mb-2 text-primary-100 fs-8 fs-md-7 fw-bold">
				享樂酒店，誠摯歡迎
			</p>
			<h1 class="mb-4 text-neutral-0 fw-bold">立即註冊</h1>

			<div class="d-flex align-items-center py-4 gap-2">
				<div class="d-flex flex-column align-items-center gap-1 text-neutral-0">
					<span
						:class="{ 'd-none': isEmailAndPasswordValid }"
						class="step p-2 bg-primary-100 rounded-circle"
					>
						1
					</span>
					<Icon
						:class="{ 'd-none': !isEmailAndPasswordValid }"
						class="p-2 fs-3 bg-primary-100 rounded-circle"
						icon="material-symbols:check"
					/>
					<p class="mb-0 fs-8 fs-md-7 fw-bold">輸入信箱及密碼</p>
				</div>

				<hr class="flex-grow-1 my-0 border border-neutral-60 opacity-100" />

				<div
					:class="{
						'text-neutral-0': isEmailAndPasswordValid,
						'text-neutral-60': !isEmailAndPasswordValid,
					}"
					class="d-flex flex-column align-items-center gap-1"
				>
					<span
						:class="{
							'bg-primary-100': isEmailAndPasswordValid,
							'bg-transparent border border-neutral-60':
								!isEmailAndPasswordValid,
						}"
						class="step p-2 rounded-circle"
					>
						2
					</span>
					<p class="mb-0 fs-8 fs-md-7 fw-bold">填寫基本資料</p>
				</div>
			</div>
		</div>

		<div class="mb-4">
			<form :class="{ 'd-none': isEmailAndPasswordValid }" class="mb-4">
				<div class="mb-4 fs-8 fs-md-7">
					<label class="mb-2 text-neutral-0 fw-bold" for="email">
						電子信箱
					</label>
					<input
						id="email"
						class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
						placeholder="hello@exsample.com"
						type="email"
						v-model.trim="registerData.email"
					/>
				</div>
				<div class="mb-4 fs-8 fs-md-7">
					<label class="mb-2 text-neutral-0 fw-bold" for="password">
						密碼
					</label>
					<input
						id="password"
						class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
						placeholder="請輸入密碼"
						type="password"
						v-model="registerPassword"
					/>
				</div>
				<div class="mb-10 fs-8 fs-md-7">
					<label class="mb-2 text-neutral-0 fw-bold" for="confirmPassword">
						確認密碼
					</label>
					<input
						id="confirmPassword"
						class="form-control p-4 text-neutral-100 fw-medium border-neutral-40"
						placeholder="請再輸入一次密碼"
						type="password"
						v-model="checkPassword"
					/>
				</div>
				<div class="text-danger mb-4 fs-8 fs-md-7" v-if="errorMsg">
					{{ errorMsg }}
				</div>
				<button
					class="btn btn-neutral-40 w-100 py-4 text-neutral-60 fw-bold"
					type="button"
					@click="checkAccount"
				>
					下一步
				</button>
			</form>
			<form :class="{ 'd-none': !isEmailAndPasswordValid }" class="mb-4">
				<div class="mb-4 fs-8 fs-md-7">
					<label class="mb-2 text-neutral-0 fw-bold" for="name"> 姓名 </label>
					<input
						id="name"
						class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 rounded-3"
						placeholder="請輸入姓名"
						type="text"
						v-model.trim="registerData.name"
					/>
				</div>
				<div class="mb-4 fs-8 fs-md-7">
					<label class="mb-2 text-neutral-0 fw-bold" for="phone">
						手機號碼
					</label>
					<input
						id="phone"
						class="form-control p-4 text-neutral-100 fw-medium border-neutral-40 rounded-3"
						placeholder="請輸入手機號碼"
						type="tel"
						v-model.trim="registerData.phone"
					/>
				</div>
				<div class="mb-4 fs-8 fs-md-7">
					<label class="mb-2 text-neutral-0 fw-bold" for="birth"> 生日 </label>
					<div class="d-flex gap-2">
						<select
							id="birth"
							class="form-select p-4 text-neutral-80 fw-medium rounded-3"
							v-model="birthdayYear"
						>
							<option
								v-for="year in 100"
								:key="year"
								:value="new Date().getFullYear() - year + 1"
							>
								{{ new Date().getFullYear() - year + 1 }} 年
							</option>
						</select>
						<select
							class="form-select p-4 text-neutral-80 fw-medium rounded-3"
							v-model="birthdayMonth"
						>
							<option v-for="month in 12" :key="month" :value="month">
								{{ month }} 月
							</option>
						</select>
						<select
							class="form-select p-4 text-neutral-80 fw-medium rounded-3"
							v-model="birthdayDay"
						>
							<option v-for="day in dayArr" :key="day" :value="day">
								{{ day }} 日
							</option>
						</select>
					</div>
				</div>
				<div class="mb-4 fs-8 fs-md-7">
					<label class="form-label text-neutral-0 fw-bold" for="address">
						地址
					</label>
					<div>
						<div class="d-flex gap-2 mb-2">
							<select
								class="form-select p-4 text-neutral-80 fw-medium rounded-3"
								v-model="selectedCity"
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
								class="form-select p-4 text-neutral-80 fw-medium rounded-3"
								v-model="selectedDistrict"
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
							class="form-control p-4 rounded-3"
							placeholder="請輸入詳細地址"
							v-model.trim="detailedAddress"
						/>
					</div>
				</div>

				<div
					class="form-check d-flex align-items-end gap-2 mb-10 text-neutral-0"
				>
					<input
						id="agreementCheck"
						class="form-check-input"
						type="checkbox"
						value=""
						v-model="isRead"
					/>
					<label class="form-check-label fw-bold" for="agreementCheck">
						我已閱讀並同意本網站個資使用規範
					</label>
				</div>
				<div class="text-danger mb-4 fs-8 fs-md-7" v-if="errorMsg">
					{{ errorMsg }}
				</div>
				<button
					class="btn btn-primary-100 w-100 py-4 text-neutral-0 fw-bold"
					type="button"
					@click="register"
				>
					完成註冊
				</button>
			</form>
		</div>

		<p class="mb-0 fs-8 fs-md-7">
			<span class="me-2 text-neutral-0 fw-medium">已經有會員了嗎？</span>
			<NuxtLink
				to="login"
				class="text-primary-100 fw-bold text-decoration-underline bg-transparent border-0"
			>
				<span>立即登入</span>
			</NuxtLink>
		</p>
	</div>
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

input[type='password'] {
	font: small-caption;
	font-size: 1.5rem;
}

input::placeholder {
	color: #909090;
	font-size: 1rem;
	font-weight: 500;

	@include media-breakpoint-down(md) {
		font-size: 14px;
	}
}

.form-check-input {
	width: 1.5rem;
	height: 1.5rem;
}

.form-check-input:checked {
	background-color: #bf9d7d;
	border-color: #bf9d7d;
}

.step {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 32px;
	height: 32px;
}
</style>

