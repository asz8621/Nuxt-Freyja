<script setup>
import { Icon } from '@iconify/vue';
const { $daysBetween, $formatNumber } = useNuxtApp();

const API_URL = useApiUrl();

const userStore = useUserStore();
const { userToken } = storeToRefs(userStore);

const { data: ordersData, refresh } = await useFetch('/orders', {
	baseURL: API_URL,
	headers: {
		Authorization: userToken.value,
	},
	transform: (response) => {
		const { result } = response;
		const today = new Date();
		const futureOrders = result.filter(
			(order) => new Date(order.checkInDate) >= today && order.status !== -1
		);
		console.log('futureOrders', futureOrders);
		if (futureOrders.length > 0) {
			const closestOrderReduce = futureOrders.reduce((prev, curr) => {
				const prevDiff = Math.abs(new Date(prev.checkInDate) - today);
				const currDiff = Math.abs(new Date(curr.checkInDate) - today);
				return currDiff < prevDiff ? curr : prev;
			});
			const closestOrderIndex = result.indexOf(closestOrderReduce);
			if (closestOrderIndex > -1) {
				result.splice(closestOrderIndex, 1);
				result.unshift(closestOrderReduce);
			}
		}
		// console.log('result', result);
		return result;
	},
});
// 即將行程資料
// const closestOrder = computed(() => ordersData.value[0]);
const closestOrder = computed(() => {
	return ordersData.value[0].status === -1 ? null : ordersData.value[0];
});
console.log('closestOrder', closestOrder.value);
// 歷史訂單資料
const historyOrders = computed(() => ordersData.value.slice(1));
// 歷史訂單顯示數量
const savedHistoryOrders = ref(historyOrders.value.slice(0, 5));
const showMore = () => {
	const currentLength = savedHistoryOrders.value.length;
	const nextItems = historyOrders.value.slice(currentLength, currentLength + 5);
	savedHistoryOrders.value = [...savedHistoryOrders.value, ...nextItems];
};

// 查看更多開關
const showMoreSwitch = computed(() => {
	return savedHistoryOrders.value.length === historyOrders.value.length;
});

// 查看更多每筆的總價
const historyOrderPrice = (checkInDate, checkOutDate, price) => {
	const stayDuration = $daysBetween(checkInDate, checkOutDate);
	return $formatNumber(price * stayDuration);
};

// 即將行程的天數
const closestOrderStayDuration =
	$daysBetween(
		closestOrder.value?.checkInDate,
		closestOrder.value?.checkOutDate
	) || 0;

// 即將行程的總價
const closestOrderPrice = computed(() => {
	return closestOrder.value.roomId.price * closestOrderStayDuration;
});

// 取消訂單
const deleteOrder = async () => {
	try {
		const data = await $fetch(`/orders/${closestOrder.value._id}`, {
			baseURL: API_URL,
			method: 'DELETE',
			headers: {
				Authorization: userToken.value,
			},
		});
		console.log(data);
		refresh();
	} catch (error) {
		console.error('Error deleting order:', error);
	}
};

// 即將來的行程 & 歷史訂單 高度維持相同
const closestDom = ref(null);
const historyDom = ref(null);
const historyDomHeight = ref(0);

onMounted(() => {
	if (closestDom.value) {
		nextTick(() => {
			historyDomHeight.value = closestDom.value.clientHeight;
		});
	}
});

const updateHistoryDomHeight = () => {
	if (closestDom.value) {
		historyDomHeight.value = closestDom.value.clientHeight;
	}
};

if (process.client) {
	window.addEventListener('resize', updateHistoryDomHeight);

	onUnmounted(() => {
		window.removeEventListener('resize', updateHistoryDomHeight);
	});
}
</script>

<template>
	<div class="row gap-6 gap-md-0">
		<div class="col-12 col-md-7">
			<div
				v-if="closestOrder"
				ref="closestDom"
				class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
				style="max-width: 730px"
			>
				<div>
					<p class="mb-2 text-neutral-80 fs-8 fs-md-7 fw-medium">
						預訂參考編號： {{ closestOrder._id }}
					</p>
					<h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">
						即將來的行程
					</h2>
				</div>

				<img
					class="img-fluid rounded-3"
					:src="closestOrder.roomId.imageUrl"
					:alt="closestOrder.roomId.name"
				/>

				<section class="d-flex flex-column gap-6">
					<h3
						class="d-flex align-items-center mb-0 text-neutral-80 fs-8 fs-md-6 fw-bold"
					>
						<p class="mb-0">
							{{ closestOrder.roomId.name }}，{{ closestOrderStayDuration }} 晚
						</p>
						<span
							class="d-inline-block mx-4 bg-neutral-80"
							style="width: 1px; height: 18px"
						/>
						<p class="mb-0">住宿人數：{{ closestOrder.peopleNum }} 位</p>
					</h3>

					<div class="text-neutral-80 fs-8 fs-md-7 fw-bold">
						<p class="title-deco mb-2">
							入住：{{ $formatDate(closestOrder.checkInDate) }}，15:00 可入住
						</p>
						<p class="title-deco mb-0">
							退房：{{ $formatDate(closestOrder.checkOutDate) }}，12:00 前退房
						</p>
					</div>

					<p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold">
						NT$ {{ $formatNumber(closestOrderPrice) }}
					</p>
				</section>

				<hr class="my-0 opacity-100 text-neutral-40" />

				<section>
					<h3 class="title-deco mb-6 text-neutral-100 fs-8 fs-md-7 fw-bold">
						房內設備
					</h3>
					<ul
						class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
					>
						<li
							v-for="item in closestOrder.roomId.facilityInfo"
							:key="item.title"
							class="flex-item d-flex gap-2"
						>
							<Icon
								class="fs-5 text-primary-100"
								icon="material-symbols:check"
							/>
							<p class="mb-0 text-neutral-80 fw-bold">{{ item.title }}</p>
						</li>
					</ul>
				</section>

				<section>
					<h3 class="title-deco mb-6 text-neutral-100 fs-8 fs-md-7 fw-bold">
						備品提供
					</h3>
					<ul
						class="d-flex flex-wrap row-gap-2 column-gap-10 p-6 mb-0 fs-8 fs-md-7 bg-neutral-0 border border-neutral-40 rounded-3 list-unstyled"
					>
						<li
							v-for="item in closestOrder.roomId.facilityInfo"
							:key="item.title"
							class="flex-item d-flex gap-2"
						>
							<Icon
								class="fs-5 text-primary-100"
								icon="material-symbols:check"
							/>
							<p class="mb-0 text-neutral-80 fw-bold">{{ item.title }}</p>
						</li>
					</ul>
				</section>

				<div class="d-flex gap-4">
					<button
						data-bs-toggle="modal"
						data-bs-target="#cancelModal"
						class="btn btn-outline-primary-100 w-50 py-4 fw-bold"
						style="--bs-btn-hover-color: #fff"
						type="button"
					>
						取消預訂
					</button>
					<NuxtLink
						:to="{
							name: 'rooms-roomId',
							params: {
								roomId: closestOrder.roomId._id,
							},
						}"
						class="btn btn-primary-100 text-neutral-0 w-50 py-4 fw-bold"
						type="button"
					>
						查看詳情
					</NuxtLink>
				</div>
			</div>
			<div
				v-else
				ref="closestDom"
				style="height: 600px"
				class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
			>
				<h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">即將來的行程</h2>
				<p class="text-neutral-80 fs-8 fs-md-7 fw-medium">
					目前沒有即將來的行程
				</p>
			</div>
		</div>

		<div class="col-12 col-md-5">
			<div
				ref="historyDom"
				class="rounded-3xl d-flex flex-column gap-6 gap-md-10 p-4 p-md-10 bg-neutral-0"
				:style="`max-height: ${historyDomHeight}px;overflow-y: auto`"
			>
				<h2 class="mb-0 text-neutral-100 fs-7 fs-md-5 fw-bold">歷史訂單</h2>

				<div
					v-for="item in savedHistoryOrders"
					:key="item._id"
					class="d-flex flex-column flex-lg-row gap-6 border-bottom pb-md-10 pb-6"
				>
					<img
						class="img-fluid object-fit-cover rounded-3"
						style="max-width: 120px; height: 80px"
						:src="item.roomId.imageUrl"
						:alt="item.roomId.name"
					/>
					<section class="d-flex flex-column gap-4">
						<p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-medium">
							預訂參考編號： {{ item._id }}
						</p>

						<h3
							class="d-flex align-items-center mb-0 text-neutral-80 fs-8 fs-md-6 fw-bold"
						>
							{{ item.roomId.name }}
						</h3>

						<div class="text-neutral-80 fw-medium">
							<p class="mb-2">
								住宿天數：
								{{ $daysBetween(item.checkInDate, item.checkOutDate) }} 晚
							</p>
							<p class="mb-0">住宿人數：{{ item.peopleNum }} 位</p>
						</div>

						<div class="text-neutral-80 fs-8 fs-md-7 fw-medium">
							<p class="title-deco mb-2">
								入住：{{ $formatDate(item.checkInDate) }}，15:00 可入住
							</p>
							<p class="title-deco mb-0">
								退房：{{ $formatDate(item.checkOutDate) }}，12:00 前退房
							</p>
						</div>
						<p class="mb-0 text-neutral-80 fs-8 fs-md-7 fw-bold">
							NT$
							{{
								historyOrderPrice(
									item.checkInDate,
									item.checkOutDate,
									item.roomId.price
								)
							}}
						</p>
						<div
							class="text-end"
							:class="
								item.status === -1
									? 'text-danger'
									: new Date(item.checkInDate) > new Date()
									? 'text-warning'
									: 'text-success'
							"
						>
							{{
								item.status === -1
									? '已取消'
									: new Date(item.checkInDate) > new Date()
									? '等待入住'
									: '已完成'
							}}
						</div>
					</section>
				</div>

				<button
					class="btn btn-outline-primary-100 py-4 fw-bold"
					style="--bs-btn-hover-color: #fff"
					type="button"
					:disabled="showMoreSwitch"
					@click="showMore"
				>
					查看更多
				</button>
			</div>
		</div>
	</div>

	<div id="cancelModal" class="modal fade" tabindex="-1">
		<div
			class="modal-dialog modal-dialog-centered align-items-end align-items-md-center m-0 mx-md-auto h-100"
		>
			<div class="modal-content">
				<div class="modal-header">
					<button
						type="button"
						class="btn-close"
						data-bs-dismiss="modal"
						aria-label="Close"
					/>
				</div>
				<div
					class="modal-body mx-auto my-10 my-md-15 text-neutral-80 fs-8 fs-md-6 fw-bold"
				>
					確定要取消此房型的預訂嗎？
				</div>
				<div class="modal-footer d-flex gap-4">
					<button
						type="button"
						class="btn btn-outline-primary-100 flex-grow-1 m-0 py-4 fw-bold"
						style="--bs-btn-hover-color: #fff"
						data-bs-dismiss="modal"
					>
						關閉視窗
					</button>
					<button
						type="button"
						class="btn btn-primary-100 flex-grow-1 m-0 py-4 text-white fw-bold"
						data-bs-dismiss="modal"
						@click="deleteOrder"
					>
						確定取消
					</button>
				</div>
			</div>
		</div>
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

.rounded-3xl {
	border-radius: 1.25rem;
}

.title-deco {
	display: flex;
	align-items: center;
}

.title-deco::before {
	--color: #bf9d7d;
	content: '';
	display: inline-block;
	width: 4px;
	height: 24px;
	background-color: var(--color);
	border-radius: 10px;
	margin-right: 0.75rem;
}

.title-deco:nth-child(2)::before {
	--color: #909090;
}

.flex-item {
	max-width: 97px;
	width: 100%;
	white-space: nowrap;
}

.modal {
	backdrop-filter: blur(10px);

	@include media-breakpoint-down(md) {
		backdrop-filter: none;
	}
}

.modal-header {
	@include media-breakpoint-down(md) {
		border-bottom: 0 !important;
	}
}

.modal-content {
	@include media-breakpoint-down(md) {
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
}
</style>

