// ==============================
// Supabase設定
// ==============================

const SUPABASE_URL = "https://fdkyhobujjssahrdnvxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZka3lob2J1ampzc2FocmRudnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Nzk2NTksImV4cCI6MjA5NDI1NTY1OX0.puO3ciHMGe_B140npC_WM5p3ilDiS9adzE0eZIUYJ3Y";

const TABLE_NAME = "shops";
const MEMBER_TABLE_NAME = "members";
const AREA_TABLE_NAME = "areas";
const LOG_TABLE_NAME = "noodle_logs";
const STORAGE_BUCKET = "noodle-photos";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let areas = [];
let areaMap = {};
let memberMap = {};

// ==============================
// DOM
// ==============================

const pinLayer = document.getElementById("pinLayer");
const shopList = document.getElementById("shopList");
const completionStatus = document.getElementById("completionStatus");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalShopName = document.getElementById("modalShopName");
const visitHistory = document.getElementById("visitHistory");
const visitForm = document.getElementById("visitForm");

const visitorNameInput = document.getElementById("visitorName");
const visitorStatusInput = document.getElementById("visitorStatus");
const commentInput = document.getElementById("comment");
const photoInput = document.getElementById("photoInput");
const visitError = document.getElementById("visitError");

const menuButton = document.getElementById("menuButton");
const menuModal = document.getElementById("menuModal");
const closeMenu = document.getElementById("closeMenu");

const openAddMemberModal = document.getElementById("openAddMemberModal");
const addMemberModal = document.getElementById("addMemberModal");
const closeAddMemberModal = document.getElementById("closeAddMemberModal");

const openMemberStatusModal = document.getElementById("openMemberStatusModal");
const memberStatusModal = document.getElementById("memberStatusModal");
const closeMemberStatusModal = document.getElementById("closeMemberStatusModal");

const memberForm = document.getElementById("memberForm");
const memberNameInput = document.getElementById("memberName");
const memberList = document.getElementById("memberList");

const openTabelogModal = document.getElementById("openTabelogModal");
const tabelogModal = document.getElementById("tabelogModal");
const closeTabelogModal = document.getElementById("closeTabelogModal");
const tabelogList = document.getElementById("tabelogList");

const openRecordModal = document.getElementById("openRecordModal");
const recordModal = document.getElementById("recordModal");
const closeRecordModal = document.getElementById("closeRecordModal");
const rankingList = document.getElementById("rankingList");

const mapWrapper = document.getElementById("mapWrapper");

const openAdminModal = document.getElementById("openAdminModal");
const adminModal = document.getElementById("adminModal");
const closeAdminModal = document.getElementById("closeAdminModal");
const adminShopSelect = document.getElementById("adminShopSelect");
const toggleCoordinateModeButton = document.getElementById("toggleCoordinateMode");
const adminLastCoordinate = document.getElementById("adminLastCoordinate");
const adminSqlCoordinate = document.getElementById("adminSqlCoordinate");
const adminUpdateStatus = document.getElementById("adminUpdateStatus");
const adminCopyStatus = document.getElementById("adminCopyStatus");

const adminNewShopName = document.getElementById("adminNewShopName");
const adminNewShopArea = document.getElementById("adminNewShopArea");
const adminAddShopButton = document.getElementById("adminAddShopButton");
const adminAddShopStatus = document.getElementById("adminAddShopStatus");

const mapImage = document.querySelector(".map-image");

const MEMBER_STATUSES = [
	{ value: "余裕", label: "😋 余裕" },
	{ value: "普通", label: "🙂 普通" },
	{ value: "腹八分目", label: "😐 腹八分目" },
	{ value: "限界", label: "🤢 限界" },
	{ value: "撃沈", label: "💀 撃沈" }
];

let shops = [];
let logs = [];
let selectedShopId = null;
let members = [];
let isCoordinateMode = false;
let mapZoom = 1;
let mapPanX = 0;
let mapPanY = 0;
let isMapDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let startPanX = 0;
let startPanY = 0;
let collapsedAreaIds = new Set();
let pinchStartDistance = null;
let pinchStartZoom = 1;
let hasMapMoved = false;

// ==============================
// 初期化
// ==============================

init();

// グローバルエラーをキャッチしてコンソールに出力
window.addEventListener('error', (e) => {
	console.error('Uncaught error:', e.error || e.message, e);
});

async function init() {
	await loadAreas();
	console.log('areas loaded:', areas.length, areaMap);
	await loadMembers();
	console.log('members loaded:', members.length, Object.keys(memberMap).length);
	await loadShops();
	console.log('shops loaded:', shops.length);
	await loadLogs();
	console.log('logs loaded:', logs.length);
	renderPins();
	renderShopList();
	renderCompletionStatus();
	renderMemberSelect();
	renderMemberList();
	renderAdminShopSelect();
	renderAdminAreaSelect();
}

// ==============================
// Supabaseから取得
// ==============================

async function loadShops() {
	const { data, error } = await supabaseClient
		.from(TABLE_NAME)
		.select(`
			*,
			areas!shops_area_id_fkey (
				id,
				name,
				display_order
			)
		`)
		.order("area_id", { ascending: true });

	if (error) {
		console.error(error);
		alert("店舗データの取得に失敗しました");
		return;
	}

	shops = (data || [])
		.map((shop) => ({
			...shop,
			area_name: shop.areas?.name || "未分類",
			area_order: shop.areas?.display_order ?? 999
		}))
		.sort((a, b) => {
			if (a.area_order !== b.area_order) {
				return a.area_order - b.area_order;
			}

			const scoreA =
				(Number(a.x ?? 0) ** 2) +
				(Number(a.y ?? 0) ** 2);

			const scoreB =
				(Number(b.x ?? 0) ** 2) +
				(Number(b.y ?? 0) ** 2);

			return scoreB - scoreA;
		});

	console.log("shops with areas:", shops);
}

async function loadMembers() {
	const { data, error } = await supabaseClient
		.from(MEMBER_TABLE_NAME)
		.select("*")
		.order("created_at", { ascending: true });

	if (error) {
		console.error(error);
		alert("メンバーの取得に失敗しました");
		return;
	}

	members = data || [];
	memberMap = members.reduce((map, member) => {
		map[String(member.id)] = member;
		return map;
	}, {});
}

async function loadLogs() {
	const { data, error } = await supabaseClient
		.from(LOG_TABLE_NAME)
		.select("*")
		.order("logged_at", { ascending: false });

	if (error) {
		console.error(error);
		alert("ログの取得に失敗しました");
		return;
	}

	logs = data || [];
}

async function loadAreas() {
	const { data, error } = await supabaseClient
		.from(AREA_TABLE_NAME)
		.select("*")
		.order("display_order", { ascending: true });

	if (error) {
		console.error(error);
		alert("エリアデータの取得に失敗しました");
		return;
	}

	areas = data || [];
	areaMap = areas.reduce((map, area) => {
		map[String(area.id)] = area;
		return map;
	}, {});
}

// ==============================
// 描画
// ==============================

function renderPins() {
	pinLayer.innerHTML = "";

	shops.forEach((shop) => {
		const pinAnchor = document.createElement("button");
		pinAnchor.type = "button";
		pinAnchor.className = "pin-anchor";

	const pin = document.createElement("span");
	pin.className = `pin ${shop.status === "visited" ? "visited" : "unvisited"}`;

		if (String(shop.id) === String(selectedShopId)) {
			pin.classList.add("selected");
		}

		const displayX = 50 + (shop.x - 50) * mapZoom;
		const displayY = 50 + (shop.y - 50) * mapZoom;

		pinAnchor.style.left = `calc(${displayX}% + ${mapPanX}px)`;
		pinAnchor.style.top = `calc(${displayY}% + ${mapPanY}px)`;

		pinAnchor.setAttribute("aria-label", shop.shop_name);

		pinAnchor.addEventListener("click", (event) => {
			event.stopPropagation();
			selectShop(shop.id);
		});

		pinAnchor.appendChild(pin);
		pinLayer.appendChild(pinAnchor);
	});
}

function renderShopList() {
	shopList.innerHTML = "";

	const groupedShops = shops.reduce((groups, shop) => {
		const areaId = shop.area_id ?? "unclassified";
		const areaName = shop.area_name || "未分類";

		if (!groups[areaId]) {
			groups[areaId] = {
				id: areaId,
				name: areaName,
				shops: []
			};
		}

		groups[areaId].shops.push(shop);
		return groups;
	}, {});

	Object.values(groupedShops).forEach((group) => {
		const totalCount = group.shops.length;

		const visitedCount = group.shops.filter(
			(shop) => shop.status === "visited"
		).length;

		const isConquered =
			totalCount > 0 &&
			visitedCount === totalCount;

		const areaGroup = document.createElement("div");
		areaGroup.className = "area-group";

		const isCollapsed = collapsedAreaIds.has(String(group.id));

		const areaTitle = document.createElement("button");
		areaTitle.type = "button";
		areaTitle.className = `area-title-button ${isCollapsed ? "collapsed" : ""}`;
		areaTitle.innerHTML = `
			<span>
				${escapeHtml(group.name)}
				${
					isConquered
						? `<span class="area-conquered">👑 制圧！</span>`
						: ` (${visitedCount}/${totalCount})`
				}
			</span>

			<span class="area-toggle-icon">
				${isCollapsed ? "▶" : "▼"}
			</span>
		`;

		if (isConquered) {
			areaTitle.classList.add("conquered");
		}

		const shopContainer = document.createElement("div");
		shopContainer.className = `area-shop-container ${isCollapsed ? "collapsed" : ""}`;

		areaTitle.addEventListener("click", () => {
			const areaId = String(group.id);

			if (collapsedAreaIds.has(areaId)) {
				collapsedAreaIds.delete(areaId);
				areaTitle.classList.remove("collapsed");
				shopContainer.classList.remove("collapsed");
				areaTitle.querySelector(".area-toggle-icon").textContent = "▼";
			} else {
				collapsedAreaIds.add(areaId);
				areaTitle.classList.add("collapsed");
				shopContainer.classList.add("collapsed");
				areaTitle.querySelector(".area-toggle-icon").textContent = "▼";
			}
		});

		areaGroup.appendChild(areaTitle);

		group.shops.forEach((shop) => {
			const card = document.createElement("div");
			card.className = "shop-card";

			const isVisited = shop.status === "visited";
			const visitorName = memberMap[String(shop.visitor_id)]?.name || shop.visitor_name || "";

			if (isVisited) {
				card.classList.add("visited");
			}

			if (String(shop.id) === String(selectedShopId)) {
				card.classList.add("selected");
			}

			const visitInfo = isVisited
				? `${escapeHtml(visitorName)} ${formatShortDate(shop.created_at)}`
				: "";

			card.innerHTML = `
				<div class="shop-card-main">
					<div>
						<h3>${escapeHtml(shop.shop_name)}</h3>

						<div class="shop-card-meta">
							<span class="badge ${isVisited ? "visited" : "unvisited"}">
								${isVisited ? "訪問済み" : "未訪問"}
							</span>

							${
								isVisited
									? `<span class="visit-info">${visitInfo}</span>`
									: ""
							}
						</div>
					</div>

					<button
						type="button"
						class="shop-open-button"
						data-shop-id="${shop.id}"
					>
						開く
					</button>
				</div>
			`;

			card.addEventListener("click", () => {
				selectShop(shop.id);
				focusShopOnMap(shop.id);
			});

			const openButton = card.querySelector(".shop-open-button");

			openButton.addEventListener("click", (event) => {
				event.stopPropagation();

				selectShop(shop.id);
				openShopModal(shop.id);
			});

			shopContainer.appendChild(card);
		});

		areaGroup.appendChild(shopContainer);
		shopList.appendChild(areaGroup);
	});

	renderCompletionStatus();
}

function renderCompletionStatus() {
	if (!completionStatus) return;

	const totalShops = shops.length;
	const visitedShops = shops.filter((shop) => shop.status === "visited").length;
	const percent = totalShops === 0 ? 0 : Math.round((visitedShops / totalShops) * 100);

	completionStatus.textContent = `訪問済：\n${visitedShops}/${totalShops} 店舗\n(${percent}%)`;
}

function renderAdminShopSelect() {
	if (!adminShopSelect) return;

	const currentValue = adminShopSelect.value;
	adminShopSelect.innerHTML = `<option value="">店舗を選択</option>`;

	shops.forEach((shop) => {
		const option = document.createElement("option");
		option.value = shop.id;

		const x = shop.x ?? "-";
		const y = shop.y ?? "-";
		option.textContent = `${shop.shop_name}（現在: ${x}, ${y}）`;

		adminShopSelect.appendChild(option);
	});

	if (currentValue && shops.some((shop) => String(shop.id) === String(currentValue))) {
		adminShopSelect.value = currentValue;
	}
}

async function updateShopCoordinate(shopId, x, y) {
	const { error } = await supabaseClient
		.from(TABLE_NAME)
		.update({ x, y })
		.eq("id", shopId);

	if (error) throw error;

	shops = shops.map((shop) =>
		String(shop.id) === String(shopId)
			? { ...shop, x, y }
			: shop
	);
}

function renderVisitHistory(shop) {
	if (shop.status !== "visited") {
		visitHistory.innerHTML = `<span class="visit-status">未訪問</span>`;
		return;
	}

	const dateText = shop.created_at
		? new Date(shop.created_at).toLocaleString("ja-JP")
		: "";

	const visitorName = memberMap[String(shop.visitor_id)]?.name || shop.visitor_name || "";
	const visitorStatus = shop.visitor_status || "普通";
	const visitorStatusLabel =
		MEMBER_STATUSES.find((item) => item.value === visitorStatus)?.label || visitorStatus;

	visitHistory.innerHTML = `
		<span class="visit-status visited">訪問済み</span>

		<div class="visit-item">
			<div class="visit-item-name">
				${escapeHtml(visitorName)}
				<span class="visit-item-status">${visitorStatusLabel}</span>
			</div>
			<div class="visit-item-date">${dateText}</div>
			<p>${escapeHtml(shop.comment || "")}</p>
			${
				shop.photo_url
					? `<img src="${shop.photo_url}" alt="ラーメン写真" />`
					: ""
			}
		</div>
	`;
}

function renderMemberSelect() {
	visitorNameInput.innerHTML = `<option value="">メンバーを選択</option>`;

	members.forEach((member) => {
		const option = document.createElement("option");
		option.value = member.id;
		option.textContent = member.name;
		visitorNameInput.appendChild(option);
	});

	const selectedMember = memberMap[String(visitorNameInput.value)];
	if (selectedMember && visitorStatusInput) {
		visitorStatusInput.value = selectedMember.status || "普通";
	}
}

function renderMemberList() {
	if (members.length === 0) {
		memberList.innerHTML = `<p>メンバーがまだ登録されていません。</p>`;
		return;
	}

	memberList.innerHTML = members
		.map((member) => {
			const status = member.status || "普通";
			const statusInfo = MEMBER_STATUSES.find((item) => item.value === status);
			const label = statusInfo?.label || `🙂 ${escapeHtml(status)}`;

			return `
				<div class="member-item member-status-display">
					<span class="member-item-name">${escapeHtml(member.name)}</span>
					<span class="member-current-status">${label}</span>
				</div>
			`;
		})
		.join("");
}

function renderTabelog() {
	if (!tabelogList) return;

	if (logs.length === 0) {
		tabelogList.innerHTML = `<p>まだ記録がありません。</p>`;
		return;
	}

	tabelogList.innerHTML = logs
		.map((log) => {
			if (log.log_type === "conquest") {
				const statusText = formatStatusCounts(log.status_counts || {});

				return `
					<div class="tabelog-item tabelog-conquered">
						<div class="tabelog-date">${formatShortDate(log.logged_at)}</div>
						<div class="tabelog-text">
							<span class="tabelog-badge">👑 ${escapeHtml(log.area_name || "エリア")} 制覇！</span>
							<span>${escapeHtml(statusText)}</span>
						</div>
					</div>
				`;
			}

			const statusLabel = getStatusLabel(log.visitor_status);

			return `
				<div class="tabelog-item">
					<div class="tabelog-date">${formatShortDate(log.logged_at)}</div>
					<div class="tabelog-text">
						<span>${escapeHtml(log.shop_name || "店舗")}</span>
						<span>${escapeHtml(log.member_name || "未登録")}</span>
						<span>${escapeHtml(statusLabel)}</span>
						<span>訪問</span>
					</div>
				</div>
			`;
		})
		.join("");
}

function renderRanking() {
	const visitedShops = shops.filter((shop) => shop.status === "visited" && (memberMap[String(shop.visitor_id)]?.name || shop.visitor_name));

	const rankingMap = visitedShops.reduce((map, shop) => {
		const name = memberMap[String(shop.visitor_id)]?.name || shop.visitor_name;
		map[name] = (map[name] || 0) + 1;
		return map;
	}, {});

	const ranking = Object.entries(rankingMap)
		.map(([name, count]) => ({ name, count }))
		.sort((a, b) => b.count - a.count);

	if (ranking.length === 0) {
		rankingList.innerHTML = `<p>まだ訪問記録がありません。</p>`;
		return;
	}

	rankingList.innerHTML = ranking
		.map((item, index) => `
			<div class="ranking-item">
				<div>
					<span class="ranking-rank">${index + 1}位</span>
					${escapeHtml(item.name)}
				</div>
				<div class="ranking-count">${item.count}店</div>
			</div>
		`)
		.join("");
}

// ==============================
// 操作
// ==============================

function focusShopOnMap(shopId) {
	const shop = shops.find((s) => String(s.id) === String(shopId));
	if (!shop) return;

	selectedShopId = shop.id;

	mapZoom = 2.5;

	const rect = mapWrapper.getBoundingClientRect();

	const shopX = (Number(shop.x) / 100) * rect.width;
	const shopY = (Number(shop.y) / 100) * rect.height;

	const centerX = rect.width / 2;
	const centerY = rect.height / 2;

	mapPanX = centerX - (centerX + (shopX - centerX) * mapZoom);
	mapPanY = centerY - (centerY + (shopY - centerY) * mapZoom);

	updateMapZoom();
	renderShopList();

	const selectedCard = document.querySelector(".shop-card.selected");
	if (selectedCard) {
		selectedCard.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
	}
}

function selectShop(shopId) {
	selectedShopId = shopId;
	renderPins();
	renderShopList();

	const selectedCard = document.querySelector(".shop-card.selected");
	if (selectedCard) {
		selectedCard.scrollIntoView({
			behavior: "smooth",
			block: "center"
		});
	}
}

function openShopModal(shopId) {
	const shop = shops.find((s) => s.id === shopId);
	if (!shop) return;

	modalShopName.textContent = shop.shop_name;

	renderVisitHistory(shop);

	if (shop.status === "visited") {
		visitForm.classList.add("hidden");
	} else {
		visitForm.classList.remove("hidden");
	}

	modal.classList.remove("hidden");
}

menuButton.addEventListener("click", () => {
	menuModal.classList.remove("hidden");
});

closeMenu.addEventListener("click", () => {
	menuModal.classList.add("hidden");
});

menuModal.addEventListener("click", (event) => {
	if (event.target === menuModal) {
		menuModal.classList.add("hidden");
	}
});

openAddMemberModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	addMemberModal.classList.remove("hidden");
});

closeAddMemberModal.addEventListener("click", () => {
	addMemberModal.classList.add("hidden");
});

openMemberStatusModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderMemberList();
	memberStatusModal.classList.remove("hidden");
});

closeMemberStatusModal.addEventListener("click", () => {
	memberStatusModal.classList.add("hidden");
});

openTabelogModal.addEventListener("click", async () => {
	menuModal.classList.add("hidden");
	await loadLogs();
	renderTabelog();
	tabelogModal.classList.remove("hidden");
});

closeTabelogModal.addEventListener("click", () => {
	tabelogModal.classList.add("hidden");
});

openRecordModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderRanking();
	recordModal.classList.remove("hidden");
});

closeRecordModal.addEventListener("click", () => {
	recordModal.classList.add("hidden");
});

openAdminModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderAdminShopSelect();
	renderAdminAreaSelect();
	adminUpdateStatus.textContent = "";
	adminUpdateStatus.className = "admin-status";
	adminModal.classList.remove("hidden");
});

closeAdminModal.addEventListener("click", () => {
	adminModal.classList.add("hidden");
});

toggleCoordinateModeButton.addEventListener("click", () => {
	isCoordinateMode = !isCoordinateMode;

	toggleCoordinateModeButton.textContent = isCoordinateMode
		? "座標取得モード：ON"
		: "座標取得モード：OFF";

	mapWrapper.classList.toggle("coordinate-mode", isCoordinateMode);
});

visitorNameInput.addEventListener("change", () => {
	const selectedMember = memberMap[String(visitorNameInput.value)];

	if (!selectedMember || !visitorStatusInput) return;

	visitorStatusInput.value = selectedMember.status || "普通";
});

mapWrapper.addEventListener("click", async (event) => {
	if (hasMapMoved) {
		hasMapMoved = false;
		return;
	}

	if (isMapDragging) {
		return;
	}

	if (!isCoordinateMode) {
		return;
	}

	if (event.target.closest(".pin")) {
		return;
	}

	const selectedAdminShopId = adminShopSelect?.value;
	if (!selectedAdminShopId) {
		adminUpdateStatus.textContent = "店舗を選択してください";
		adminUpdateStatus.className = "admin-status error";
		return;
	}

	const rect = mapWrapper.getBoundingClientRect();

	const wrapperX = event.clientX - rect.left - mapPanX;
	const wrapperY = event.clientY - rect.top - mapPanY;

	const centerX = rect.width / 2;
	const centerY = rect.height / 2;

	const imageX = centerX + (wrapperX - centerX) / mapZoom;
	const imageY = centerY + (wrapperY - centerY) / mapZoom;

	const x = (imageX / rect.width) * 100;
	const y = (imageY / rect.height) * 100;

	const roundedX = Number(x.toFixed(1));
	const roundedY = Number(y.toFixed(1));

	adminLastCoordinate.textContent = `座標：x=${roundedX}, y=${roundedY}`;
	adminSqlCoordinate.textContent = `SQL：${roundedX}, ${roundedY}`;
	adminUpdateStatus.textContent = "座標を更新中...";
	adminUpdateStatus.className = "admin-status";

	console.log("地図クリック座標:", {
		shopId: selectedAdminShopId,
		x: roundedX,
		y: roundedY
	});

	try {
		await updateShopCoordinate(selectedAdminShopId, roundedX, roundedY);

		selectedShopId = String(selectedAdminShopId);
		renderPins();
		renderShopList();
		renderAdminShopSelect();

		const selectedCard = document.querySelector(".shop-card.selected");
		if (selectedCard) {
			selectedCard.scrollIntoView({
				behavior: "smooth",
				block: "center"
			});
		}

		await navigator.clipboard.writeText(`${roundedX}, ${roundedY}`);

		adminUpdateStatus.textContent = "座標を更新しました";
		adminUpdateStatus.className = "admin-status success";
		adminCopyStatus.textContent = "クリップボードにコピーしました";

		// 管理者モーダルを再表示してプルダウンにフォーカス
		adminModal.classList.remove("hidden");
		try {
			adminShopSelect?.focus();
		} catch (e) {}

		setTimeout(() => {
			adminCopyStatus.textContent = "";
		}, 1600);
	} catch (error) {
		console.error(error);
		adminUpdateStatus.textContent = "座標更新に失敗しました";
		adminUpdateStatus.className = "admin-status error";
	}
});

closeModal.addEventListener("click", closeShopModal);

modal.addEventListener("click", (event) => {
	if (event.target === modal) {
		closeShopModal();
	}
});

function closeShopModal() {
	modal.classList.add("hidden");
}

function getDistance(touch1, touch2) {
	const dx = touch1.clientX - touch2.clientX;
	const dy = touch1.clientY - touch2.clientY;

	return Math.sqrt(dx * dx + dy * dy);
}

// ==============================
// 登録処理
// ==============================

visitForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (!selectedShopId) return;

	const visitorId = visitorNameInput.value;
	const visitorStatus = visitorStatusInput.value;
	const comment = commentInput.value.trim();
	const file = photoInput.files[0];

	if (!visitorId || !visitorStatus || !file) {
		visitError.textContent = "メンバー、状態、写真を選択してください。";
		visitError.classList.remove("hidden");
		return;
	}

	const targetShop = shops.find((shop) => String(shop.id) === String(selectedShopId));

	if (!targetShop) {
		alert("店舗情報が見つかりません");
		return;
	}

	visitError.textContent = "";
	visitError.classList.add("hidden");

	const loggedAt = new Date().toISOString();

	try {
		const photoUrl = await uploadPhoto(selectedShopId, visitorId, file);

		const updatedShops = buildUpdatedShopsAfterVisit(
			selectedShopId,
			visitorId,
			visitorStatus,
			comment,
			photoUrl,
			loggedAt
		);

		const updatedMembers = buildUpdatedMembers(visitorId, visitorStatus);

		const { error } = await supabaseClient
			.from(TABLE_NAME)
			.update({
				status: "visited",
				visitor_id: visitorId,
				visitor_status: visitorStatus,
				comment,
				photo_url: photoUrl,
				created_at: loggedAt
			})
			.eq("id", selectedShopId);

		if (error) throw error;

		const { error: memberUpdateError } = await supabaseClient
			.from(MEMBER_TABLE_NAME)
			.update({
				status: visitorStatus
			})
			.eq("id", visitorId);

		if (memberUpdateError) throw memberUpdateError;

		await insertVisitLog(targetShop, visitorId, visitorStatus, loggedAt);

		await insertConquestLogIfNeeded(
			targetShop.area_id,
			updatedShops,
			updatedMembers,
			loggedAt
		);

		photoInput.value = "";

		await loadShops();
		await loadMembers();
		await loadLogs();

		renderPins();
		renderShopList();
		renderMemberSelect();
		renderMemberList();

		const updatedShop = shops.find((s) => String(s.id) === String(selectedShopId));
		renderVisitHistory(updatedShop);

		if (updatedShop.status === "visited") {
			visitForm.classList.add("hidden");
		} else {
			visitForm.classList.remove("hidden");
		}

		alert("登録しました");
	} catch (error) {
		console.error(error);
		alert("登録に失敗しました");
	}
});

async function uploadPhoto(shopId, visitorName, file) {
	const fileExt = file.name.split(".").pop().toLowerCase();
	const fileName = `${shopId}/${Date.now()}-${crypto.randomUUID()}.${fileExt}`;

	const { error } = await supabaseClient.storage
		.from(STORAGE_BUCKET)
		.upload(fileName, file, {
			cacheControl: "3600",
			upsert: false
		});

	if (error) throw error;

	const { data } = supabaseClient.storage
		.from(STORAGE_BUCKET)
		.getPublicUrl(fileName);

	return data.publicUrl;
}

memberForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	const name = memberNameInput.value.trim();

	if (!name) {
		alert("メンバー名を入力してください");
		return;
	}

	try {
		const { error } = await supabaseClient
			.from(MEMBER_TABLE_NAME)
			.insert({
				name,
				status: '普通'
			});

		if (error) throw error;

		memberNameInput.value = "";

		await loadMembers();
		renderMemberSelect();
		renderMemberList();

		alert("メンバーを追加しました");
	} catch (error) {
		console.error(error);
		alert("メンバー追加に失敗しました。同じ名前が既にあるかもしれません。");
	}
});

async function updateMemberStatus(memberId, status) {
	if (!memberId) return;

	try {
		const allowed = MEMBER_STATUSES.map((item) => item.value);
		if (!allowed.includes(status)) {
			alert("不正なステータスです");
			return;
		}
		const { error } = await supabaseClient
			.from(MEMBER_TABLE_NAME)
			.update({ status })
			.eq("id", memberId);

		if (error) {
			console.error(error);
			alert("メンバーのステータス更新に失敗しました。"
				+ "データベースにstatus列が存在するか確認してください。");
			return;
		}

		await loadMembers();
		renderMemberList();
		renderMemberSelect();
	} catch (error) {
		console.error(error);
		alert("メンバーのステータス更新に失敗しました。");
	}
}

function getStatusLabel(status) {
	return MEMBER_STATUSES.find((item) => item.value === status)?.label || status || "🙂 普通";
}

function countMemberStatuses(targetMembers) {
	return targetMembers.reduce((counts, member) => {
		const status = member.status || "普通";
		counts[status] = (counts[status] || 0) + 1;
		return counts;
	}, {});
}

function formatStatusCounts(statusCounts) {
	return MEMBER_STATUSES
		.map((item) => {
			const count = Number(statusCounts[item.value] || 0);
			return count > 0 ? `${item.label}${count}` : "";
		})
		.filter(Boolean)
		.join(" ");
}

function isAreaConquered(areaId, targetShops) {
	const areaShops = targetShops.filter(
		(shop) => String(shop.area_id) === String(areaId)
	);

	return (
		areaShops.length > 0 &&
		areaShops.every((shop) => shop.status === "visited")
	);
}

function buildUpdatedMembers(visitorId, visitorStatus) {
	return members.map((member) =>
		String(member.id) === String(visitorId)
			? { ...member, status: visitorStatus }
			: member
	);
}

function buildUpdatedShopsAfterVisit(shopId, visitorId, visitorStatus, comment, photoUrl, loggedAt) {
	return shops.map((shop) =>
		String(shop.id) === String(shopId)
			? {
				...shop,
				status: "visited",
				visitor_id: visitorId,
				visitor_status: visitorStatus,
				comment,
				photo_url: photoUrl,
				created_at: loggedAt
			}
			: shop
	);
}

async function insertVisitLog(shop, visitorId, visitorStatus, loggedAt) {
	const member = memberMap[String(visitorId)];

	const { error } = await supabaseClient
		.from(LOG_TABLE_NAME)
		.insert({
			log_type: "visit",
			shop_id: shop.id,
			shop_name: shop.shop_name,
			area_id: shop.area_id,
			area_name: shop.area_name,
			member_id: visitorId,
			member_name: member?.name || "",
			visitor_status: visitorStatus,
			logged_at: loggedAt
		});

	if (error) throw error;
}

async function insertConquestLogIfNeeded(areaId, updatedShops, updatedMembers, loggedAt) {
	const beforeConquered = isAreaConquered(areaId, shops);
	const afterConquered = isAreaConquered(areaId, updatedShops);

	if (beforeConquered || !afterConquered) {
		return;
	}

	const area = areaMap[String(areaId)];
	const areaName =
		area?.name ||
		updatedShops.find((shop) => String(shop.area_id) === String(areaId))?.area_name ||
		"未分類";

	const statusCounts = countMemberStatuses(updatedMembers);

	const { error } = await supabaseClient
		.from(LOG_TABLE_NAME)
		.insert({
			log_type: "conquest",
			area_id: areaId,
			area_name: areaName,
			status_counts: statusCounts,
			logged_at: loggedAt
		});

	if (error && error.code !== "23505") {
		throw error;
	}
}

function formatShortDate(value) {
	if (!value) return "";

	const date = new Date(value);

	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${month}/${day} ${hours}:${minutes}`;
}

function renderAdminAreaSelect() {
	if (!adminNewShopArea) return;

	adminNewShopArea.innerHTML = `<option value="">エリアを選択</option>`;

	areas.forEach((area) => {
		const option = document.createElement("option");
		option.value = area.id;

		// areas.name ならこっち
		option.textContent = area.name;

		// もしカラム名が areas._name なら上を消してこっち
		// option.textContent = area._name;

		adminNewShopArea.appendChild(option);
	});
}

adminAddShopButton.addEventListener("click", async () => {
	const shopName = adminNewShopName.value.trim();
	const areaId = adminNewShopArea.value;

	if (!shopName || !areaId) {
		adminAddShopStatus.textContent = "店舗名とエリアを入力してください";
		adminAddShopStatus.className = "admin-status error";
		return;
	}

	adminAddShopStatus.textContent = "店舗を追加中...";
	adminAddShopStatus.className = "admin-status";

	try {
		const { error } = await supabaseClient
			.from(TABLE_NAME)
			.insert({
					shop_name: shopName,
					area_id: Number(areaId),
					status: "unvisited",
					x: 50,
					y: 50
			});

		if (error) throw error;

		adminNewShopName.value = "";
		adminNewShopArea.value = "";

		await loadShops();

		renderPins();
		renderShopList();
		renderAdminShopSelect();

		adminAddShopStatus.textContent = "店舗を追加しました。座標は地図クリックで調整してください";
		adminAddShopStatus.className = "admin-status success";
	} catch (error) {
		console.error(error);
		adminAddShopStatus.textContent = "店舗追加に失敗しました";
		adminAddShopStatus.className = "admin-status error";
	}
});

function clampMapPan() {
	const rect = mapWrapper.getBoundingClientRect();

	const maxPanX = ((mapZoom - 1) * rect.width) / 2;
	const maxPanY = ((mapZoom - 1) * rect.height) / 2;

	mapPanX = Math.min(Math.max(mapPanX, -maxPanX), maxPanX);
	mapPanY = Math.min(Math.max(mapPanY, -maxPanY), maxPanY);
}

function updateMapZoom() {
	clampMapPan();

	mapImage.style.transform = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`;
	renderPins();
}

mapWrapper.addEventListener("wheel", (event) => {
	event.preventDefault();

	if (event.deltaY < 0) {
		mapZoom += 0.1;
	} else {
		mapZoom -= 0.1;
	}

	mapZoom = Math.min(Math.max(mapZoom, 1), 3);

	updateMapZoom();
});

mapWrapper.addEventListener("pointerdown", (event) => {
	if (event.pointerType !== "touch" && mapZoom <= 1) return;
	if (event.target.closest(".pin")) return;

	event.preventDefault();

	isMapDragging = true;
	hasMapMoved = false;

	dragStartX = event.clientX;
	dragStartY = event.clientY;
	startPanX = mapPanX;
	startPanY = mapPanY;

	mapWrapper.classList.add("dragging");
	mapWrapper.setPointerCapture(event.pointerId);
});

mapWrapper.addEventListener("pointermove", (event) => {
	if (!isMapDragging) return;

	const dx = event.clientX - dragStartX;
	const dy = event.clientY - dragStartY;

	if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
		hasMapMoved = true;
	}

	mapPanX = startPanX + dx;
	mapPanY = startPanY + dy;

	updateMapZoom();
});

mapWrapper.addEventListener("pointerup", (event) => {
	isMapDragging = false;
	mapWrapper.classList.remove("dragging");

	try {
		mapWrapper.releasePointerCapture(event.pointerId);
	} catch (e) {}
});

mapWrapper.addEventListener("pointercancel", () => {
	isMapDragging = false;
	mapWrapper.classList.remove("dragging");
});

mapWrapper.addEventListener("touchstart", (event) => {
	if (event.touches.length !== 2) return;

	pinchStartDistance = getDistance(
		event.touches[0],
		event.touches[1]
	);

	pinchStartZoom = mapZoom;
});

mapWrapper.addEventListener("touchmove", (event) => {
	if (event.touches.length !== 2) return;

	event.preventDefault();

	const currentDistance = getDistance(
		event.touches[0],
		event.touches[1]
	);

	const scale = currentDistance / pinchStartDistance;

	mapZoom = pinchStartZoom * scale;

	mapZoom = Math.min(Math.max(mapZoom, 1), 3);

	updateMapZoom();
});

mapWrapper.addEventListener("touchend", () => {
	pinchStartDistance = null;
});

// ==============================
// utility
// ==============================

function escapeHtml(value) {
	return String(value ?? "")
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#039;");
}