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

const areaLayer = document.getElementById("areaLayer");
const pinLayer = document.getElementById("pinLayer");
const shopList = document.getElementById("shopList");
const completionStatus = document.getElementById("completionStatus");
const currentMemberHeader = document.getElementById("currentMemberHeader");
const visitorNameText = document.getElementById("visitorNameText");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalShopName = document.getElementById("modalShopName");
const visitHistory = document.getElementById("visitHistory");
const visitForm = document.getElementById("visitForm");

const visitorStatusInput = document.getElementById("visitorStatus");
const ramenTypeInput = document.getElementById("ramenType");
const commentInput = document.getElementById("comment");
const photoInput = document.getElementById("photoInput");
const visitError = document.getElementById("visitError");

const bowserCallButton = document.getElementById("bowserCallButton");
const bowserConfirmModal = document.getElementById("bowserConfirmModal");
const closeBowserConfirmModal = document.getElementById("closeBowserConfirmModal");
const cancelBowserCall = document.getElementById("cancelBowserCall");
const confirmBowserCall = document.getElementById("confirmBowserCall");

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

const areaConquestModal = document.getElementById("areaConquestModal");
const closeAreaConquestModal = document.getElementById("closeAreaConquestModal");
const areaConquestSubtitle = document.getElementById("areaConquestSubtitle");

const completeConquestModal = document.getElementById("completeConquestModal");
const closeCompleteConquestModal = document.getElementById("closeCompleteConquestModal");

const openMemberRecordModal = document.getElementById("openMemberRecordModal");
const memberRecordModal = document.getElementById("memberRecordModal");
const closeMemberRecordModal = document.getElementById("closeMemberRecordModal");
const memberRecordList = document.getElementById("memberRecordList");

const openConquestProgressModal = document.getElementById("openConquestProgressModal");
const conquestProgressModal = document.getElementById("conquestProgressModal");
const closeConquestProgressModal = document.getElementById("closeConquestProgressModal");
const conquestProgressContent = document.getElementById("conquestProgressContent");

const currentMemberModal = document.getElementById("currentMemberModal");
const currentMemberSelect = document.getElementById("currentMemberSelect");
const saveCurrentMemberButton = document.getElementById("saveCurrentMemberButton");

const changeCurrentMemberButton = document.getElementById("changeCurrentMemberButton");

const bowserSummonModal = document.getElementById("bowserSummonModal");

const openRamenTypeModal =	document.getElementById("openRamenTypeModal");
const ramenTypeModal = document.getElementById("ramenTypeModal");
const closeRamenTypeModal = document.getElementById("closeRamenTypeModal");
const ramenTypeList = document.getElementById("ramenTypeList");

const adminAreaPolygonSelect = document.getElementById("adminAreaPolygonSelect");
const adminAreaColorInput = document.getElementById("adminAreaColorInput");
const toggleAreaPolygonModeButton = document.getElementById("toggleAreaPolygonMode");
const undoAreaPointButton = document.getElementById("undoAreaPointButton");
const clearAreaPointsButton = document.getElementById("clearAreaPointsButton");
const saveAreaPolygonButton = document.getElementById("saveAreaPolygonButton");
const adminAreaPointList = document.getElementById("adminAreaPointList");
const adminAreaPolygonStatus = document.getElementById("adminAreaPolygonStatus");

const MEMBER_STATUSES = [
	{ value: "余裕", label: "😋 余裕" },
	{ value: "普通", label: "🙂 普通" },
	{ value: "腹八分目", label: "😐 腹八分目" },
	{ value: "限界", label: "🤢 限界" },
	{ value: "撃沈", label: "💀 撃沈" }
];

const RAMEN_TYPES = [
	"家系",
	"二郎系",
	"豚骨",
	"豚骨醤油",
	"醤油",
	"塩",
	"味噌",
	"煮干し",
	"魚介",
	"鶏白湯",
	"担々麺",
	"油そば",
	"まぜそば",
	"つけ麺",
	"ちゃんぽん",
	"台湾ラーメン",
	"喜多方",
	"佐野",
	"博多",
	"札幌味噌",
	"旭川",
	"その他"
];

const BOWSER_PHONE_NUMBER = "09091799052";

let shops = [];
let logs = [];
let selectedShopId = null;
let members = [];
let currentMemberId = sessionStorage.getItem("currentMemberId");
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
let isAreaPolygonMode = false;
let editingAreaPoints = [];

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
	renderAreaPolygons();
	renderPins();
	renderAdminAreaPolygonSelect();
	renderShopList();
	renderCompletionStatus();
	renderMemberSelect();
	renderMemberList();
	renderAdminShopSelect();
	renderAdminAreaSelect();
	renderCurrentMemberSelect();
	renderRamenTypeSelect();
	applyCurrentMemberToVisitForm();
	showCurrentMemberModalIfNeeded();
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
		.order("logged_at", { ascending: false })
		.order("id", { ascending: false });

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

	Object.values(groupedShops)
	.sort((a, b) => {
		const areaA = areaMap[String(a.id)];
		const areaB = areaMap[String(b.id)];

		return (
			(areaA?.display_order ?? 999) -
			(areaB?.display_order ?? 999)
		);
	})
	.forEach((group) => {
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

			if (isConquered) {
				card.classList.add("area-conquered-card");
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

	completionStatus.textContent =
		`訪問済：${visitedShops}/${totalShops} 店舗（${percent}%）`;

	renderCurrentMemberHeader();
}

function renderCurrentMemberHeader() {
	if (!currentMemberHeader) return;

	const member = getCurrentMember();

	if (!member) {
		currentMemberHeader.textContent = "未選択";
		return;
	}

	currentMemberHeader.innerHTML = `
		<span class="header-member-label">PLAYER：</span>
		<span class="header-member-name">${escapeHtml(member.name)}</span>
	`;
}

function renderRamenTypeStats() {

	const counts = {};

	shops
		.filter(shop => shop.status === "visited")
		.forEach(shop => {

			const type =
				shop.ramen_type || "未分類";

			counts[type] =
				(counts[type] || 0) + 1;
		});

	const html =
		Object.entries(counts)
		.sort((a,b) => b[1]-a[1])
		.map(([type,count]) => `
			<div class="ranking-card">
				<div>
					🍜 ${type}
				</div>
				<div>
					${count}店舗
				</div>
			</div>
		`)
		.join("");

	ramenTypeList.innerHTML =
		html || "<p>まだ記録がありません</p>";
}

function renderAdminShopSelect() {
	if (!adminShopSelect) return;

	const currentValue = adminShopSelect.value;
	adminShopSelect.innerHTML = `<option value="">店舗を選択</option>`;

	const sortedShops = [...shops].sort((a, b) => {
		if (a.area_id !== b.area_id) {
			return a.area_id - b.area_id;
		}

		return a.id - b.id;
	});

	sortedShops.forEach((shop) => {
		const option = document.createElement("option");
		option.value = shop.id;

		const x = shop.x ?? "-";
		const y = shop.y ?? "-";

		option.textContent =
			`${shop.shop_name}（現在: ${x}, ${y}）`;

		adminShopSelect.appendChild(option);
	});

	if (
		currentValue &&
		shops.some((shop) => String(shop.id) === String(currentValue))
	) {
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
			<div>🍜 ${escapeHtml(shop.ramen_type || "不明")}</div>
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
	applyCurrentMemberToVisitForm();
}

function renderCurrentMemberSelect() {
	if (!currentMemberSelect) return;

	currentMemberSelect.innerHTML = `<option value="">メンバーを選択</option>`;

	members.forEach((member) => {
		const option = document.createElement("option");
		option.value = member.id;
		option.textContent = member.name;
		currentMemberSelect.appendChild(option);
	});

	if (
		currentMemberId &&
		members.some((member) => String(member.id) === String(currentMemberId))
	) {
		currentMemberSelect.value = currentMemberId;
	}
}

function showCurrentMemberModalIfNeeded() {
	const exists = members.some(
		(member) => String(member.id) === String(currentMemberId)
	);

	if (!exists) {
		currentMemberModal.classList.remove("hidden");
	}
}

function applyCurrentMemberToVisitForm() {
	const member = getCurrentMember();

	if (!member) {
		if (visitorNameText) {
			visitorNameText.textContent = "メンバー未選択";
		}

		return;
	}

	if (visitorNameText) {
		visitorNameText.textContent = member.name;
	}

	if (visitorStatusInput) {
		visitorStatusInput.value = member.status || "普通";
	}

	renderCurrentMemberHeader();
	updateBowserCallButton();
}

function getCurrentMember() {
	return memberMap[String(currentMemberId)];
}

function renderMemberList() {
	if (members.length === 0) {
		memberList.innerHTML = `<p>メンバーがまだ登録されていません。</p>`;
		return;
	}

	const sortedMembers = [...members].sort((a, b) => {
		if (String(a.id) === String(currentMemberId)) return -1;
		if (String(b.id) === String(currentMemberId)) return 1;
		return 0;
	});

	memberList.innerHTML = sortedMembers
		.map((member) => {
			const status = member.status || "普通";
			const statusInfo = MEMBER_STATUSES.find((item) => item.value === status);
			const label = statusInfo?.label || `🙂 ${escapeHtml(status)}`;
			const isCurrent = String(member.id) === String(currentMemberId);

			return `
				<div class="member-item member-status-display ${isCurrent ? "current-member-highlight" : ""}">
					<span class="member-item-name ${isCurrent ? "current-member-name" : ""}">
						${escapeHtml(member.name)}
						${isCurrent ? "（あなた）" : ""}
					</span>
					<span class="member-current-status">${label}</span>
				</div>
			`;
		})
		.join("");
}

function renderRamenTypeSelect() {
	if (!ramenTypeInput) return;

	ramenTypeInput.innerHTML =
		'<option value="">種類を選択</option>';

	RAMEN_TYPES.forEach(type => {
		const option = document.createElement("option");
		option.value = type;
		option.textContent = type;
		ramenTypeInput.appendChild(option);
	});
}

function renderTabelog() {
	if (!tabelogList) return;

	if (logs.length === 0) {
		tabelogList.innerHTML = `<p>まだ記録がありません。</p>`;
		return;
	}

	tabelogList.innerHTML = logs
		.map((log) => {
			const statusText = formatStatusCounts(log.status_counts || {});

			if (log.log_type === "full_conquest") {
				return `
					<div class="tabelog-item tabelog-full-conquered">
						<div class="tabelog-date">
							${formatShortDate(log.logged_at)}
						</div>

						<div class="tabelog-text">
							<div class="tabelog-conquest-title">
								🏆 完全制覇！
							</div>

							<div>
								${escapeHtml(statusText)}
							</div>
						</div>
					</div>
				`;
			}

			if (log.log_type === "area_conquest") {
				return `
					<div class="tabelog-item tabelog-conquered">
						<div class="tabelog-date">
							${formatShortDate(log.logged_at)}
						</div>

						<div class="tabelog-text">
							<div class="tabelog-conquest-title">
								👑 ${escapeHtml(log.area_name || "エリア")} 制覇！
							</div>

							<div>
								${escapeHtml(statusText)}
							</div>
						</div>
					</div>
				`;
			}

			if (log.log_type === "bowser_call") {
				return `
					<div class="tabelog-item tabelog-bowser">
						<div class="tabelog-date">
							${formatShortDate(log.logged_at)}
						</div>

						<div class="tabelog-text">
							<div class="tabelog-conquest-title">
								🐷 バウザーコール！
							</div>

							<div>
								${escapeHtml(log.member_name || "メンバー")} が
								${escapeHtml(log.shop_name || "店舗")} で禁断の召喚を発動
							</div>
						</div>
					</div>
				`;
			}

			const statusLabel = getStatusLabel(log.visitor_status);

			return `
				<div class="tabelog-item">
					<div class="tabelog-date">
						${formatShortDate(log.logged_at)}
					</div>

					<div class="tabelog-text">
						<div class="tabelog-shop-name">
							${escapeHtml(log.shop_name || "店舗")}
						</div>

						<div>
							${escapeHtml(log.member_name || "未登録")}
							&nbsp;
							${escapeHtml(statusLabel)}
						</div>
					</div>
				</div>
			`;
		})
		.join("");
}

function renderRanking() {
	const ranking = members
		.map((member) => {
			const count = shops.filter(
				(shop) => String(shop.visitor_id) === String(member.id)
			).length;

			return {
				id: member.id,
				name: member.name,
				status: member.status || "普通",
				count
			};
		})
		.sort((a, b) => b.count - a.count);

	if (ranking.length === 0) {
		rankingList.innerHTML = `<p>まだメンバーがいません。</p>`;
		return;
	}

	rankingList.innerHTML = ranking
		.map((item, index) => {
			const rankIcon = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}`;
			const isCurrent = String(item.id) === String(currentMemberId);

			return `
				<div class="ranking-card ${index < 3 ? "top-rank" : ""} ${isCurrent ? "current-member-highlight" : ""}">
					<div class="ranking-left">
						<div class="ranking-rank-badge">${rankIcon}</div>
						<div>
							<div class="ranking-name ${isCurrent ? "current-member-name" : ""}">
								${escapeHtml(item.name)}
								${isCurrent ? "（あなた）" : ""}
							</div>
							<div class="ranking-status">${escapeHtml(getStatusLabel(item.status))}</div>
						</div>
					</div>

					<div class="ranking-cups">
						<span>${item.count}</span>
						杯
					</div>
				</div>
			`;
		})
		.join("");
}

function renderMemberRecords() {
	if (!memberRecordList) return;

	const memberRecords = members
		.map((member) => {
			const memberShops = shops.filter(
				(shop) => String(shop.visitor_id) === String(member.id)
			);

			const areaCounts = memberShops.reduce((map, shop) => {
				const areaName = shop.area_name || "未分類";
				map[areaName] = (map[areaName] || 0) + 1;
				return map;
			}, {});

			const favoriteArea = Object.entries(areaCounts)
				.sort((a, b) => b[1] - a[1])[0];

			const latestShop = memberShops
				.slice()
				.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

			return {
				member,
				count: memberShops.length,
				favoriteAreaName: favoriteArea?.[0] || "なし",
				favoriteAreaCount: favoriteArea?.[1] || 0,
				latestShop
			};
		})
		.sort((a, b) => {
			if (String(a.member.id) === String(currentMemberId)) return -1;
			if (String(b.member.id) === String(currentMemberId)) return 1;
			return b.count - a.count;
		});

	memberRecordList.innerHTML = memberRecords
		.map((record) => {
			const statusLabel = getStatusLabel(record.member.status);
			const latestText = record.latestShop
				? `${escapeHtml(record.latestShop.shop_name)} / ${formatShortDate(record.latestShop.created_at)}`
				: "まだ訪問なし";

			return `
				<div class="member-record-card ${String(record.member.id) === String(currentMemberId) ? "current-member-highlight" : ""}">
					<div class="member-record-header">
						<div>
							<div class="member-record-name">${escapeHtml(record.member.name)}</div>
							<div class="member-record-status">${escapeHtml(statusLabel)}</div>
						</div>
						<div class="member-record-cups">
							<span>${record.count}</span>杯
						</div>
					</div>

					<div class="member-record-grid">
						<div class="member-record-mini">
							<div class="mini-label">得意エリア</div>
							<div class="mini-value">${escapeHtml(record.favoriteAreaName)}</div>
							<div class="mini-sub">${record.favoriteAreaCount}杯</div>
						</div>

						<div class="member-record-mini">
							<div class="mini-label">最新訪問</div>
							<div class="mini-value">${latestText}</div>
						</div>
					</div>
				</div>
			`;
		})
		.join("");
}

function renderConquestProgress() {
	if (!conquestProgressContent) return;

	const totalCount = shops.length;
	const visitedCount = shops.filter((shop) => shop.status === "visited").length;
	const totalPercent = totalCount === 0 ? 0 : Math.round((visitedCount / totalCount) * 100);

	const areaProgressList = areas
		.map((area) => {
			const areaShops = shops.filter(
				(shop) => String(shop.area_id) === String(area.id)
			);

			const areaTotal = areaShops.length;
			const areaVisited = areaShops.filter((shop) => shop.status === "visited").length;
			const percent = areaTotal === 0 ? 0 : Math.round((areaVisited / areaTotal) * 100);

			return {
				name: area.name,
				visited: areaVisited,
				total: areaTotal,
				percent
			};
		})
		.filter((area) => area.total > 0)
		.sort((a, b) => b.percent - a.percent || b.visited - a.visited);

	conquestProgressContent.innerHTML = `
		<div class="total-progress-card">
			<div class="total-progress-label">全店舗制覇率</div>
			<div class="total-progress-main">
				<span>${visitedCount}/${totalCount}</span>
				<small>(${totalPercent}%)</small>
			</div>
			<div class="progress-bar large">
				<div class="progress-bar-fill" style="width: ${totalPercent}%"></div>
			</div>
		</div>

		<div class="area-progress-ranking">
			${areaProgressList
				.map((area, index) => `
					<div class="area-progress-item">
						<div class="area-progress-head">
							<div>
								<span class="area-progress-rank">${index + 1}</span>
								<span class="area-progress-name">${escapeHtml(area.name)}</span>
							</div>
							<div class="area-progress-score">
								${area.visited}/${area.total} (${area.percent}%)
							</div>
						</div>

						<div class="progress-bar">
							<div class="progress-bar-fill" style="width: ${area.percent}%"></div>
						</div>
					</div>
				`)
				.join("")}
		</div>
	`;
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
	renderAreaPolygons();
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

	if (shop.link) {
		modalShopLink.innerHTML = `
			<a href="${escapeHtml(shop.link)}" target="_blank" rel="noopener noreferrer">
				店舗ページを開く
			</a>
		`;
	} else {
		modalShopLink.innerHTML = "";
	}

	renderVisitHistory(shop);

	if (shop.status === "visited") {
		visitForm.classList.add("hidden");
	} else {
		visitForm.classList.remove("hidden");
	}

	updateBowserCallButton();

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

changeCurrentMemberButton.addEventListener("click", () => {
	menuModal.classList.add("hidden");

	currentMemberId = null;
	sessionStorage.removeItem("currentMemberId");

	renderCurrentMemberSelect();
	applyCurrentMemberToVisitForm();
	renderCurrentMemberHeader();

	currentMemberModal.classList.remove("hidden");
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
	renderAreaPolygons();
	renderPins();
	renderAdminAreaPolygonSelect();
	adminUpdateStatus.textContent = "";
	adminUpdateStatus.className = "admin-status";
	adminModal.classList.remove("hidden");
});

closeAdminModal.addEventListener("click", () => {
	adminModal.classList.add("hidden");
});

closeAreaConquestModal.addEventListener("click", () => {
	areaConquestModal.classList.add("hidden");
});

areaConquestModal.addEventListener("click", (event) => {
	if (event.target === areaConquestModal) {
		areaConquestModal.classList.add("hidden");
	}
});

closeCompleteConquestModal.addEventListener("click", () => {
	completeConquestModal.classList.add("hidden");
});

completeConquestModal.addEventListener("click", (event) => {
	if (event.target === completeConquestModal) {
		completeConquestModal.classList.add("hidden");
	}
});

toggleCoordinateModeButton.addEventListener("click", () => {
	isCoordinateMode = !isCoordinateMode;

	if (isCoordinateMode) {
		isAreaPolygonMode = false;
		toggleAreaPolygonModeButton.textContent = "エリア座標取得モード：OFF";
		mapWrapper.classList.remove("area-polygon-mode");
	}

	toggleCoordinateModeButton.textContent = isCoordinateMode
		? "座標取得モード：ON"
		: "座標取得モード：OFF";

	mapWrapper.classList.toggle("coordinate-mode", isCoordinateMode);
});

toggleAreaPolygonModeButton.addEventListener("click", () => {
	isAreaPolygonMode = !isAreaPolygonMode;

	if (isAreaPolygonMode) {
		isCoordinateMode = false;
		toggleCoordinateModeButton.textContent = "座標取得モード：OFF";
		mapWrapper.classList.remove("coordinate-mode");
	}

	toggleAreaPolygonModeButton.textContent = isAreaPolygonMode
		? "エリア座標取得モード：ON"
		: "エリア座標取得モード：OFF";

	mapWrapper.classList.toggle("area-polygon-mode", isAreaPolygonMode);
});

adminAreaPolygonSelect.addEventListener("change", () => {
	const area = areas.find(
		(area) => String(area.id) === String(adminAreaPolygonSelect.value)
	);

	editingAreaPoints = normalizePolygonPoints(area?.polygon_points);

	if (adminAreaColorInput) {
		adminAreaColorInput.value = area?.polygon_color || getAreaColor(area?.id);
	}

	renderAreaPointList();
	renderAreaPolygons();
});

undoAreaPointButton.addEventListener("click", () => {
	editingAreaPoints.pop();
	renderAreaPointList();
	renderAreaPolygons();
});

clearAreaPointsButton.addEventListener("click", () => {
	editingAreaPoints = [];
	renderAreaPointList();
	renderAreaPolygons();
});

saveAreaPolygonButton.addEventListener("click", async () => {
	const areaId = adminAreaPolygonSelect.value;

	if (!areaId) {
		adminAreaPolygonStatus.textContent = "エリアを選択してください";
		adminAreaPolygonStatus.className = "admin-status error";
		return;
	}

	if (editingAreaPoints.length < 3) {
		adminAreaPolygonStatus.textContent = "ポリゴンは3点以上必要です";
		adminAreaPolygonStatus.className = "admin-status error";
		return;
	}

	adminAreaPolygonStatus.textContent = "エリアを保存中...";
	adminAreaPolygonStatus.className = "admin-status";

	try {
		const polygonColor = adminAreaColorInput.value || getAreaColor(areaId);

		const { error } = await supabaseClient
			.from(AREA_TABLE_NAME)
			.update({
				polygon_points: editingAreaPoints,
				polygon_color: polygonColor
			})
			.eq("id", areaId);

		if (error) throw error;

		await loadAreas();

		isAreaPolygonMode = false;
		editingAreaPoints = [];

		toggleAreaPolygonModeButton.textContent = "エリア座標取得モード：OFF";
		mapWrapper.classList.remove("area-polygon-mode");

		renderAdminAreaPolygonSelect();
		renderAreaPointList();
		renderAreaPolygons();

		adminAreaPolygonStatus.textContent = "エリアを保存しました";
		adminAreaPolygonStatus.className = "admin-status success";
	} catch (error) {
		console.error(error);
		adminAreaPolygonStatus.textContent = "エリア保存に失敗しました";
		adminAreaPolygonStatus.className = "admin-status error";
	}
});

function renderAreaPolygons() {
	if (!areaLayer) return;

	areaLayer.innerHTML = "";

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("class", "area-svg");
	svg.setAttribute("viewBox", "0 0 100 100");
	svg.setAttribute("preserveAspectRatio", "none");

	areas.forEach((area) => {
		const points = normalizePolygonPoints(area.polygon_points);
		if (points.length < 3) return;

		const areaShops = shops.filter(
			(shop) => String(shop.area_id) === String(area.id)
		);

		const total = areaShops.length;
		const visited = areaShops.filter((shop) => shop.status === "visited").length;
		const conquestRate = total === 0 ? 0 : visited / total;

		const opacity = 0.1 + conquestRate * 0.5;
		const color = area.polygon_color || getAreaColor(area.id);

		const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");

		polygon.setAttribute(
			"points",
			points.map((point) => `${point.x},${point.y}`).join(" ")
		);

		const selectedShop = shops.find(
			(shop) => String(shop.id) === String(selectedShopId)
		);

		const isSelectedArea =
			selectedShop &&
			String(selectedShop.area_id) === String(area.id);

		const isConquered =
			total > 0 &&
			visited === total;

const displayColor =
	isConquered
		? "#FFD700"
		: color;

const displayOpacity =
	isConquered
		? 0.7
		: (
			isSelectedArea
				? Math.min(opacity + 0.15, 0.8)
				: opacity
		);

		polygon.setAttribute("fill", displayColor);

		polygon.setAttribute(
			"fill-opacity",
			displayOpacity.toFixed(2)
		);

		polygon.setAttribute(
			"stroke",
			displayColor
		);

		polygon.setAttribute(
			"stroke-width",
			isConquered
				? "4"
				: isSelectedArea
					? "3"
					: "2"
		);
		polygon.setAttribute("stroke-opacity", "1");

		polygon.setAttribute(
			"class",
			`area-polygon ${isSelectedArea ? "selected-area" : ""}`
		);

		svg.appendChild(polygon);
	});

	if (isAreaPolygonMode && editingAreaPoints.length >= 2) {
		const previewColor = adminAreaColorInput?.value || "#2196f3";

		const preview = document.createElementNS("http://www.w3.org/2000/svg", "polyline");

		preview.setAttribute(
			"points",
			editingAreaPoints.map((point) => `${point.x},${point.y}`).join(" ")
		);

		preview.setAttribute("class", "area-polygon-preview");
		preview.setAttribute("stroke", previewColor);
		preview.setAttribute("fill", "none");

		svg.appendChild(preview);
	}

	areaLayer.appendChild(svg);

	if (!isAreaPolygonMode) return;

	editingAreaPoints.forEach((point, index) => {
		const marker = document.createElement("div");
		marker.className = "area-point-marker";
		marker.textContent = index + 1;
		marker.style.left = `${point.x}%`;
		marker.style.top = `${point.y}%`;
		areaLayer.appendChild(marker);
	});
}

mapWrapper.addEventListener("click", async (event) => {
	if (hasMapMoved) {
		hasMapMoved = false;
		return;
	}

	if (isMapDragging) {
		return;
	}

	if (isAreaPolygonMode) {
		if (event.target.closest(".pin")) {
			return;
		}

		const selectedAreaId = adminAreaPolygonSelect?.value;

		if (!selectedAreaId) {
			adminAreaPolygonStatus.textContent = "エリアを選択してください";
			adminAreaPolygonStatus.className = "admin-status error";
			return;
		}

		const point = getMapCoordinateFromClick(event);

		editingAreaPoints.push(point);

		adminAreaPolygonStatus.textContent = `${editingAreaPoints.length}点目を追加しました`;
		adminAreaPolygonStatus.className = "admin-status success";

		renderAreaPointList();
		renderAreaPolygons();

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

	const coordinate = getMapCoordinateFromClick(event);

	const roundedX = coordinate.x;
	const roundedY = coordinate.y;

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
		renderAreaPolygons();
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

function getMapCoordinateFromClick(event) {
	const rect = mapWrapper.getBoundingClientRect();

	const wrapperX = event.clientX - rect.left - mapPanX;
	const wrapperY = event.clientY - rect.top - mapPanY;

	const centerX = rect.width / 2;
	const centerY = rect.height / 2;

	const imageX = centerX + (wrapperX - centerX) / mapZoom;
	const imageY = centerY + (wrapperY - centerY) / mapZoom;

	const x = (imageX / rect.width) * 100;
	const y = (imageY / rect.height) * 100;

	return {
		x: Number(x.toFixed(1)),
		y: Number(y.toFixed(1))
	};
}

bowserCallButton.addEventListener("click", openBowserConfirmModal);

closeBowserConfirmModal.addEventListener("click", closeBowserModal);
cancelBowserCall.addEventListener("click", closeBowserModal);

bowserConfirmModal.addEventListener("click", (event) => {
	if (event.target === bowserConfirmModal) {
		closeBowserModal();
	}
});

confirmBowserCall.addEventListener("click", async () => {
	const memberId = currentMemberId;
	const member = memberMap[String(memberId)];
	const shop = shops.find((s) => String(s.id) === String(selectedShopId));

	if (!member || !shop) return;

	const calledAt = new Date().toISOString();

	try {
		confirmBowserCall.disabled = true;
		confirmBowserCall.textContent = "召喚中...";

		const { error: memberError } = await supabaseClient
			.from(MEMBER_TABLE_NAME)
			.update({
				bowser_called_at: calledAt,
				bowser_called_shop_id: shop.id,
				bowser_called_shop_name: shop.shop_name
			})
			.eq("id", memberId)
			.is("bowser_called_at", null);

		if (memberError) throw memberError;

		await insertBowserLog(shop, member, calledAt);

		// 店舗は選択状態のまま、モーダルはいったん全部閉じて地図画面に戻す
		selectedShopId = shop.id;
		closeBowserModal();
		closeShopModal();

		renderAreaPolygons();
		renderPins();
		renderShopList();
		focusShopOnMap(shop.id);

		// 召喚演出を表示
		bowserSummonModal.classList.remove("hidden");

		setTimeout(async () => {
			bowserSummonModal.classList.add("hidden");

			window.location.href = `tel:${BOWSER_PHONE_NUMBER}`;

			await loadMembers();
			await loadLogs();

			renderMemberSelect();
			renderMemberList();
			updateBowserCallButton();
		}, 1200);
	} catch (error) {
		console.error(error);
		alert("バウザーコールに失敗しました");
	} finally {
		confirmBowserCall.disabled = false;
		confirmBowserCall.textContent = "🐷 召喚する";
	}
});

closeModal.addEventListener("click", closeShopModal);

modal.addEventListener("click", (event) => {
	if (event.target === modal) {
		closeShopModal();
	}
});

saveCurrentMemberButton.addEventListener("click", () => {
	const selectedId = currentMemberSelect.value;

	if (!selectedId) {
		alert("メンバーを選択してください");
		return;
	}

	currentMemberId = selectedId;
	sessionStorage.setItem("currentMemberId", selectedId);

	currentMemberModal.classList.add("hidden");

	applyCurrentMemberToVisitForm();
	renderCurrentMemberHeader();

	renderMemberList();
	renderMemberRecords();
	renderRanking();
	renderTabelog();
});

openRamenTypeModal.addEventListener(
	"click",
	() => {
		menuModal.classList.add("hidden");

		renderRamenTypeStats();

		ramenTypeModal.classList.remove("hidden");
	}
);

closeRamenTypeModal.addEventListener(
	"click",
	() => {
		ramenTypeModal.classList.add("hidden");
	}
);

function closeShopModal() {
	modal.classList.add("hidden");
}

function getDistance(touch1, touch2) {
	const dx = touch1.clientX - touch2.clientX;
	const dy = touch1.clientY - touch2.clientY;

	return Math.sqrt(dx * dx + dy * dy);
}

openMemberRecordModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderMemberRecords();
	memberRecordModal.classList.remove("hidden");
});

closeMemberRecordModal.addEventListener("click", () => {
	memberRecordModal.classList.add("hidden");
});

openConquestProgressModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderConquestProgress();
	conquestProgressModal.classList.remove("hidden");
});

closeConquestProgressModal.addEventListener("click", () => {
	conquestProgressModal.classList.add("hidden");
});

// ==============================
// 登録処理
// ==============================

visitForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (!selectedShopId) return;

	const visitorId = currentMemberId;
	const visitorStatus = visitorStatusInput.value;
	const ramenType = ramenTypeInput.value;
	const comment = commentInput.value.trim();
	const file = photoInput.files[0];

	if (!visitorId || !visitorStatus || !ramenType || !file) {
		visitError.textContent = "メンバー、状態、ラーメン種別、写真を選択してください。";
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

	const beforeShops = structuredClone(shops);

	try {
		const photoUrl = await uploadPhoto(selectedShopId, visitorId, file);

		const updatedShops = buildUpdatedShopsAfterVisit(
			selectedShopId,
			visitorId,
			visitorStatus,
			ramenType,
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
				ramen_type: ramenType,
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

		await insertVisitLog(targetShop, visitorId, visitorStatus, ramenType, loggedAt);

		await insertConquestLogIfNeeded(
			targetShop.area_id,
			updatedShops,
			updatedMembers,
			loggedAt
		);

		await insertFullConquestLogIfNeeded(
			beforeShops,
			updatedShops,
			updatedMembers,
			loggedAt
		);

		photoInput.value = "";

		await loadAreas();
		await loadShops();
		await loadMembers();
		await loadLogs();

		renderAreaPolygons();
		renderPins();
		renderShopList();
		renderMemberSelect();
		renderMemberList();

		const updatedShop = shops.find(
			(s) => String(s.id) === String(selectedShopId)
		);

		renderVisitHistory(updatedShop);

		showAreaConquestModalIfNeeded(
			targetShop.area_id,
			beforeShops,
			updatedShops
		);

		showCompleteConquestModalIfNeeded(
			beforeShops,
			updatedShops
		);

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

function updateBowserCallButton() {
	if (!bowserCallButton) return;

	const selectedMember = getCurrentMember();

	if (!selectedMember) {
		bowserCallButton.disabled = true;
		bowserCallButton.classList.add("used");
		bowserCallButton.querySelector("small").textContent = "先にメンバーを選択してください";
		return;
	}

	if (selectedMember.bowser_called_at) {
		bowserCallButton.disabled = true;
		bowserCallButton.classList.add("used");
		bowserCallButton.querySelector("small").textContent = "このメンバーは召喚済み";
		return;
	}

	bowserCallButton.disabled = false;
	bowserCallButton.classList.remove("used");
	bowserCallButton.querySelector("small").textContent = "1人1回だけ使える禁断のコール";
}

function openBowserConfirmModal() {
	const selectedMember = getCurrentMember();

	if (!selectedMember) {
		visitError.textContent = "バウザーコールするメンバーを選択してください。";
		visitError.classList.remove("hidden");
		return;
	}

	if (selectedMember.bowser_called_at) {
		visitError.textContent = "このメンバーはすでにバウザーコール済みです。";
		visitError.classList.remove("hidden");
		return;
	}

	bowserConfirmModal.classList.remove("hidden");
}

function closeBowserModal() {
	bowserConfirmModal.classList.add("hidden");
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

function buildUpdatedShopsAfterVisit(shopId, visitorId, visitorStatus, ramenType, comment, photoUrl, loggedAt) {
	return shops.map((shop) =>
		String(shop.id) === String(shopId)
			? {
				...shop,
				status: "visited",
				visitor_id: visitorId,
				visitor_status: visitorStatus,
				ramen_type: ramenType,
				comment,
				photo_url: photoUrl,
				created_at: loggedAt
			}
			: shop
	);
}

async function insertVisitLog(shop, visitorId, visitorStatus, ramenType, loggedAt) {
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

async function insertBowserLog(shop, member, loggedAt) {
	const { error } = await supabaseClient
		.from(LOG_TABLE_NAME)
		.insert({
			log_type: "bowser_call",
			shop_id: shop.id,
			shop_name: shop.shop_name,
			area_id: shop.area_id,
			area_name: shop.area_name,
			member_id: member.id,
			member_name: member.name,
			visitor_status: member.status || "普通",
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
			log_type: "area_conquest",
			area_id: areaId,
			area_name: areaName,
			status_counts: statusCounts,
			logged_at: loggedAt
		});

	if (error && error.code !== "23505") {
		throw error;
	}
}

async function insertFullConquestLogIfNeeded(beforeShops, updatedShops, updatedMembers, loggedAt) {
	const beforeComplete = isFullyConquered(beforeShops);
	const afterComplete = isFullyConquered(updatedShops);

	if (beforeComplete || !afterComplete) {
		return;
	}

	const statusCounts = countMemberStatuses(updatedMembers);

	const { error } = await supabaseClient
		.from(LOG_TABLE_NAME)
		.insert({
			log_type: "full_conquest",
			area_name: "全エリア",
			status_counts: statusCounts,
			logged_at: loggedAt
		});

	if (error && error.code !== "23505") {
		throw error;
	}
}

function isFullyConquered(targetShops) {
	return (
		targetShops.length > 0 &&
		targetShops.every((shop) => shop.status === "visited")
	);
}

function showAreaConquestModalIfNeeded(areaId, beforeShops, afterShops) {
	const beforeConquered = isAreaConquered(areaId, beforeShops);
	const afterConquered = isAreaConquered(areaId, afterShops);

	if (beforeConquered || !afterConquered) {
		return;
	}

	const areaName =
		areaMap[String(areaId)]?.name ||
		afterShops.find((shop) => String(shop.area_id) === String(areaId))?.area_name ||
		"エリア";

	areaConquestSubtitle.textContent = `${areaName} 制覇達成！`;
	areaConquestModal.classList.remove("hidden");
}

function showCompleteConquestModalIfNeeded(beforeShops, afterShops) {
	const beforeComplete = isFullyConquered(beforeShops);
	const afterComplete = isFullyConquered(afterShops);

	if (!beforeComplete && afterComplete) {
		completeConquestModal.classList.remove("hidden");
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

function renderAdminAreaPolygonSelect() {
	if (!adminAreaPolygonSelect) return;

	const currentValue = adminAreaPolygonSelect.value;

	adminAreaPolygonSelect.innerHTML = `<option value="">エリアを選択</option>`;

	areas.forEach((area) => {
		const option = document.createElement("option");
		option.value = area.id;

		const points = normalizePolygonPoints(area.polygon_points);
		option.textContent = `${area.name}（${points.length}点）`;

		adminAreaPolygonSelect.appendChild(option);
	});

	if (
		currentValue &&
		areas.some((area) => String(area.id) === String(currentValue))
	) {
		adminAreaPolygonSelect.value = currentValue;
	}
}

function normalizePolygonPoints(value) {
	if (!value) return [];

	if (Array.isArray(value)) {
		return value
			.map((point) => ({
				x: Number(point.x),
				y: Number(point.y)
			}))
			.filter((point) =>
				Number.isFinite(point.x) &&
				Number.isFinite(point.y)
			);
	}

	try {
		const parsed = JSON.parse(value);
		return normalizePolygonPoints(parsed);
	} catch {
		return [];
	}
}

function getAreaColor(areaId) {
	const colors = [
		"#ff9800",
		"#2196f3",
		"#4caf50",
		"#9c27b0",
		"#f44336",
		"#00bcd4",
		"#795548",
		"#ff5722"
	];

	const index = Math.abs(Number(areaId) || 0) % colors.length;
	return colors[index];
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

		renderAreaPolygons();
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

	const mapTransform = `translate(${mapPanX}px, ${mapPanY}px) scale(${mapZoom})`;

	mapImage.style.transform = mapTransform;

	if (areaLayer) {
		areaLayer.style.transform = mapTransform;
	}

	renderAreaPolygons();
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
	if (isCoordinateMode || isAreaPolygonMode) {
		return;
	}

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