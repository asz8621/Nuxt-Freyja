<script setup>
import TwCities from '@/assets/TwCities.json';

const { $swal } = useNuxtApp();
const isEditPassword = ref(false);
const isEditProfile = ref(false);

const API_URL = useApiUrl();

const userStore = useUserStore();
const { userToken } = storeToRefs(userStore);

const { data: userAllData, refresh } = await useFetch('/user', {
	baseURL: API_URL,
	headers: {
		Authorization: userToken.value,
	},
	transform: (response) => {
		const { result } = response;
		// console.log(result);
		return result;
	},
});

const tempUserData = ref({});
tempUserData.value = { ...userAllData.value };

const oldPassword = ref('');
const newPassword = ref('');
const newCheckPassword = ref('');

// 取消修改密碼
const cancelEditPassword = () => {
	oldPassword.value = '';
	newPassword.value = '';
	newCheckPassword.value = '';
	isEditPassword.value = !isEditPassword.value;
};

// 取消修改使用者資料
const cancelEditUserData = () => {
	tempUserData.value = { ...userAllData.value };
	isEditProfile.value = !isEditProfile.value;
};

// 修改使用者資料開關
const editUserData = () => {
	tempUserData.value = { ...userAllData.value };
	isEditProfile.value = !isEditProfile.value;
};

// 修改密碼
const resetPassword = async () => {
	if (newPassword.value !== newCheckPassword.value) {
		$swal.fire({
			position: 'center',
			icon: 'error',
			title: '修改失敗',
			text: '新密碼與確認密碼不一致',
			showConfirmButton: true,
			confirmButtonText: '確認',
		});
		return;
	}

	const APIData = {
		userId: userAllData.value._id,
		oldPassword: oldPassword.value,
		newPassword: newPassword.value,
	};

	await putUserData(APIData);
};

// 修改使用者資料
const updateUserData = async () => {
	const address = {
		zipcode: selectedCode.value,
		detail: detailedAddress.value,
		county: selectedDistrict.value,
		city: selectedCity.value,
	};
	const newData = {
		...userAllData.value,
		address,
		birthday: `${birthdayYear.value}/${birthdayMonth.value}/${birthdayDay.value}`,
	};
	const APIData = {
		userId: userAllData.value._id,
		...newData,
	};

	await putUserData(APIData, 'userData');
};

// 修改資料 API
const putUserData = async (data, fn = 'password') => {
	try {
		await $fetch('/user', {
			baseURL: API_URL,
			method: 'PUT',
			headers: {
				Authorization: userToken.value,
			},
			body: { ...data },
		});

		// 請求成功，顯示成功提示
		$swal.fire({
			position: 'center',
			icon: 'success',
			title: '更改成功',
			showConfirmButton: false,
			timer: 1500,
		});
		if (fn === 'userData') {
			refresh();
		}
		window.location.reload();
	} catch (error) {
		const message = error.response?._data?.message;
		$swal.fire({
			position: 'center',
			icon: 'error',
			title: message,
			showConfirmButton: false,
			timer: 1500,
		});
	}
};

// 生日字串 格式化日期為 "YYYY 年 MM 月 DD 日"
const userBirthdayText = computed(() => {
	const date = new Date(userAllData.value?.birthday);
	return `${date.getFullYear()} 年 
	${date.getMonth() + 1} 月 
	${date.getDate()} 日`;
});

// 生日
const birthdayDate = new Date(userAllData.value?.birthday);
const birthdayYear = ref(birthdayDate.getFullYear());
const birthdayMonth = ref(birthdayDate.getMonth() + 1);
const birthdayDay = ref(birthdayDate.getDate());

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

// 地址
const cityList = ref(TwCities.map((city) => city.name));
const selectedCity = ref(userAllData.value?.address.city || '臺北市');
const selectedDistrict = ref(userAllData.value?.address.county || '');
const selectedCode = ref(userAllData.value?.address.zipcode || '');
const detailedAddress = ref(userAllData.value?.address.detail || '');

const addressText = computed(() => {
	const { address } = userAllData.value;
	return `${address.zipcode} ${address.city}${address.county}${address.detail}`;
});

// 某縣市的區鄉鎮
const selectedDistrictData = computed(() => {
	const city = TwCities.find((item) => item.name === selectedCity.value);
	return city ? city.districts : [];
});

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
	<div class="row gap-6 gap-md-0">
		<div class="col-12 col-md-5">
			<section
				class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0"
			>
				<h2 class="fs-6 fs-md-5 fw-bold">修改密碼</h2>
				<div class="d-flex flex-column gap-4 gap-md-6">
					<div class="fs-8 fs-md-7">
						<p class="mb-2 text-neutral-80 fw-medium">電子信箱</p>
						<span
							class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
						>
							{{ tempUserData.email }}
						</span>
					</div>

					<div
						class="d-flex justify-content-between align-items-center"
						:class="{ 'd-none': isEditPassword }"
					>
						<div>
							<label class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium">
								密碼
							</label>
							<input
								class="form-control pe-none p-0 text-neutral-100 fs-5 fs-md-3 fw-bold border-0"
								type="password"
								value="**********"
							/>
						</div>

						<button
							class="flex-shrink-0 text-primary-100 fs-8 fs-md-7 fw-bold text-decoration-underline border-0 bg-transparent"
							type="button"
							@click="isEditPassword = !isEditPassword"
						>
							重設
						</button>
					</div>

					<div
						class="d-flex flex-column gap-4 gap-md-6"
						:class="{ 'd-none': !isEditPassword }"
					>
						<div>
							<label for="oldPassword" class="form-label fs-8 fs-md-7 fw-bold">
								舊密碼
							</label>
							<input
								id="oldPassword"
								type="password"
								class="form-control p-4 fs-7 rounded-3"
								placeholder="請輸入舊密碼"
								v-model="oldPassword"
							/>
						</div>

						<div>
							<label for="newPassword" class="form-label fs-8 fs-md-7 fw-bold">
								新密碼
							</label>
							<input
								id="newPassword"
								type="password"
								class="form-control p-4 fs-7 rounded-3"
								placeholder="請輸入新密碼"
								v-model="newPassword"
							/>
						</div>

						<div>
							<label
								for="confirmPassword"
								class="form-label fs-8 fs-md-7 fw-bold"
							>
								確認新密碼
							</label>
							<input
								id="confirmPassword"
								type="password"
								class="form-control p-4 fs-7 rounded-3"
								placeholder="請再輸入一次新密碼"
								v-model="newCheckPassword"
							/>
						</div>
					</div>
					<div class="d-flex justify-content-between">
						<button
							:class="{ 'd-none': !isEditPassword }"
							class="btn btn-neutral-40 align-self-md-start px-8 py-4 text-neutral-60 rounded-3"
							type="button"
							@click="resetPassword"
						>
							儲存設定
						</button>

						<button
							:class="{ 'd-none': !isEditPassword }"
							class="btn btn-neutral-40 align-self-md-start px-8 py-4 text-neutral-60 rounded-3"
							type="button"
							@click="cancelEditPassword"
						>
							取消
						</button>
					</div>
				</div>
			</section>
		</div>

		<div class="col-12 col-md-7">
			<section
				class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-6 p-md-10 bg-neutral-0"
			>
				<h2 class="fs-6 fs-md-5 fw-bold">基本資料</h2>
				<div class="d-flex flex-column gap-4 gap-md-6">
					<div class="fs-8 fs-md-7">
						<label
							class="form-label"
							:class="{
								'fw-bold text-neutral-100': isEditProfile,
								'fw-medium text-neutral-80': !isEditProfile,
							}"
							for="name"
						>
							姓名
						</label>
						<input
							id="name"
							name="name"
							class="form-control text-neutral-100 fw-bold"
							:class="{
								'pe-none p-0 border-0': !isEditProfile,
								'p-4': isEditProfile,
							}"
							type="text"
							v-model="tempUserData.name"
						/>
					</div>

					<div class="fs-8 fs-md-7">
						<label
							class="form-label"
							:class="{
								'fw-bold text-neutral-100': isEditProfile,
								'fw-medium text-neutral-80': !isEditProfile,
							}"
							for="phone"
						>
							手機號碼
						</label>
						<input
							id="phone"
							name="phone"
							class="form-control text-neutral-100 fw-bold"
							:class="{
								'pe-none p-0 border-0': !isEditProfile,
								'p-4': isEditProfile,
							}"
							type="tel"
							v-model="tempUserData.phone"
						/>
					</div>

					<div class="fs-8 fs-md-7">
						<label
							class="form-label"
							:class="{
								'fw-bold text-neutral-100': isEditProfile,
								'fw-medium text-neutral-80': !isEditProfile,
							}"
							for="birth"
						>
							生日
						</label>
						<span
							class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
							:class="{ 'd-none': isEditProfile }"
						>
							{{ userBirthdayText }}
						</span>
						<div class="d-flex gap-2" :class="{ 'd-none': !isEditProfile }">
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

					<div class="fs-8 fs-md-7">
						<label
							class="form-label"
							:class="{
								'fw-bold text-neutral-100': isEditProfile,
								'fw-medium text-neutral-80': !isEditProfile,
							}"
							for="address"
						>
							地址
						</label>
						<span
							class="form-control pe-none p-0 text-neutral-100 fw-bold border-0"
							:class="{ 'd-none': isEditProfile }"
						>
							{{ addressText }}<br />
						</span>
						<div :class="{ 'd-none': !isEditProfile }">
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
				</div>
				<button
					:class="{ 'd-none': isEditProfile }"
					class="btn btn-outline-primary-100 align-self-start px-8 py-4 rounded-3"
					type="button"
					@click="editUserData"
				>
					編輯
				</button>
				<div :class="{ 'd-none': !isEditProfile }">
					<button
						class="btn btn-neutral-40 align-self-md-start px-8 py-4 text-neutral-60 rounded-3"
						type="button"
						@click="updateUserData"
					>
						儲存設定
					</button>
					<button
						class="btn btn-neutral-40 align-self-md-start px-8 py-4 text-neutral-60 rounded-3"
						type="button"
						@click="cancelEditUserData"
					>
						取消
					</button>
				</div>
			</section>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.rounded-3xl {
	border-radius: 1.25rem;
}

input[type='password'] {
	font: small-caption;
}

.form-control::placeholder {
	--neutral-60: #909090;
	color: var(--neutral-60);
	font-weight: 500;
}
</style>

