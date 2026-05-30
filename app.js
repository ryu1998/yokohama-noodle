// ==============================
// Supabase設定
// ==============================

const SUPABASE_URL = "https://fdkyhobujjssahrdnvxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZka3lob2J1ampzc2FocmRudnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Nzk2NTksImV4cCI6MjA5NDI1NTY1OX0.puO3ciHMGe_B140npC_WM5p3ilDiS9adzE0eZIUYJ3Y";

const TABLE_NAME = "shops";
const MEMBER_TABLE_NAME = "members";
const AREA_TABLE_NAME = "areas";
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
const commentInput = document.getElementById("comment");
const photoInput = document.getElementById("photoInput");
const visitError = document.getElementById("visitError");

const menuButton = document.getElementById("menuButton");
const menuModal = document.getElementById("menuModal");
const closeMenu = document.getElementById("closeMenu");

const openMemberModal = document.getElementById("openMemberModal");
const memberModal = document.getElementById("memberModal");
const closeMemberModal = document.getElementById("closeMemberModal");
const memberForm = document.getElementById("memberForm");
const memberNameInput = document.getElementById("memberName");
const memberList = document.getElementById("memberList");

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

let shops = [];
let selectedShopId = null;
let members = [];
let isCoordinateMode = false;

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

	renderPins();
	renderShopList();
	renderCompletionStatus();
	renderMemberSelect();
	renderMemberList();
	renderAdminShopSelect();
}

// ==============================
// Supabaseから取得
// ==============================

async function loadShops() {
	const { data, error } = await supabaseClient
		.from(TABLE_NAME)
		.select("*")
		.order("area_id", { ascending: true })
		.order("shop_name", { ascending: true });

	if (error) {
		console.error(error);
		alert("店舗データの取得に失敗しました");
		return;
	}

	const rawShops = data || [];
	console.log('rawShops count:', rawShops.length, rawShops.slice(0,5));

	shops = rawShops.map((shop) => {
		const area = areaMap[String(shop.area_id)];

		console.log({
			shop_name: shop.shop_name,
			shop_area_id: shop.area_id,
			areaMap,
			area
		});

		return {
			...shop,
			area_name: area?.name || "未分類"
		};
	});
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

async function loadAreas() {
	const { data, error } = await supabaseClient
		.from(AREA_TABLE_NAME)
		.select("*")
		.order("id", { ascending: true });

	if (error) {
		console.error(error);
		alert("エリアデータの取得に失敗しました");
		return;
	}

	console.log('loadAreas response:', { data, error });
	areas = data || [];
	areaMap = areas.reduce((map, area) => {
		map[String(area.id)] = area;
		return map;
	}, {});
	console.log('areaMap built:', Object.keys(areaMap));
}

// ==============================
// 描画
// ==============================

function renderPins() {
	pinLayer.innerHTML = "";

	shops.forEach((shop) => {
		const pin = document.createElement("button");

		pin.className = `pin ${shop.status === "visited" ? "visited" : "unvisited"}`;

		if (String(shop.id) === String(selectedShopId)) {
			pin.classList.add("selected");
		}

		pin.style.left = `${shop.x}%`;
		pin.style.top = `${shop.y}%`;
		pin.setAttribute("aria-label", shop.shop_name);

		pin.addEventListener("click", () => {
			selectShop(shop.id);
		});

		pinLayer.appendChild(pin);
	});
}

function renderShopList() {
	shopList.innerHTML = "";

	const groupedShops = shops.reduce((groups, shop) => {
		const areaId = shop.area_id ?? "unclassified";
		const areaName = shop.area_name || "未分類";

		if (!groups[areaId]) {
			groups[areaId] = {
				name: areaName,
				shops: []
			};
		}

		groups[areaId].shops.push(shop);
		return groups;
	}, {});

	Object.values(groupedShops).forEach((group) => {
		const areaGroup = document.createElement("div");
		areaGroup.className = "area-group";

		const areaTitle = document.createElement("h3");
		areaTitle.className = "area-title";
		areaTitle.textContent = group.name;

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
			`;

			card.addEventListener("click", () => {
				selectShop(shop.id);
				openShopModal(shop.id);
			});

			areaGroup.appendChild(card);
		});

		shopList.appendChild(areaGroup);
	});

	renderCompletionStatus();
}

function renderCompletionStatus() {
	if (!completionStatus) return;

	const totalShops = shops.length;
	const visitedShops = shops.filter((shop) => shop.status === "visited").length;
	const percent = totalShops === 0 ? 0 : Math.round((visitedShops / totalShops) * 100);

	completionStatus.textContent = `訪問済：\n${visitedShops}/${totalShops} 店舗\n（${percent}%）`;
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

	visitHistory.innerHTML = `
		<span class="visit-status visited">訪問済み</span>

		<div class="visit-item">
			<div class="visit-item-name">${escapeHtml(visitorName)}</div>
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
}

function renderMemberList() {
	if (members.length === 0) {
		memberList.innerHTML = `<p>メンバーがまだ登録されていません。</p>`;
		return;
	}

	memberList.innerHTML = members
		.map((member) => {
			const status = member.status || "普通";
			const icons = {
				"余裕": "😋",
				"普通": "🙂",
				"腹八分目": "😐",
				"限界": "🤢"
			};
			return `
				<div class="member-item">
					<div class="member-item-name">${escapeHtml(member.name)}</div>
					<select class="member-status-select" data-member-id="${member.id}">
						<option value="余裕" ${status === "余裕" ? "selected" : ""}>😋 余裕</option>
						<option value="普通" ${status === "普通" ? "selected" : ""}>🙂 普通</option>
						<option value="腹八分目" ${status === "腹八分目" ? "selected" : ""}>😐 腹八分目</option>
						<option value="限界" ${status === "限界" ? "selected" : ""}>🤢 限界</option>
					</select>
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

openMemberModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	memberModal.classList.remove("hidden");
});

closeMemberModal.addEventListener("click", () => {
	memberModal.classList.add("hidden");
});

openRecordModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderRanking();
	recordModal.classList.remove("hidden");
});

closeRecordModal.addEventListener("click", () => {
	recordModal.classList.add("hidden");
});

memberList.addEventListener("change", async (event) => {
	const select = event.target.closest(".member-status-select");
	if (!select) return;

	const memberId = select.dataset.memberId;
	const status = select.value;
	await updateMemberStatus(memberId, status);
});

openAdminModal.addEventListener("click", () => {
	menuModal.classList.add("hidden");
	renderAdminShopSelect();
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

mapWrapper.addEventListener("click", async (event) => {
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

	const x = ((event.clientX - rect.left) / rect.width) * 100;
	const y = ((event.clientY - rect.top) / rect.height) * 100;

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

// ==============================
// 登録処理
// ==============================

visitForm.addEventListener("submit", async (event) => {
	event.preventDefault();

	if (!selectedShopId) return;

	const visitorId = visitorNameInput.value;
	const comment = commentInput.value.trim();
	const file = photoInput.files[0];

	if (!visitorId || !file) {
		visitError.textContent = "メンバーと写真の両方を選択してください。";
		visitError.classList.remove("hidden");
		return;
	}

	visitError.textContent = "";
	visitError.classList.add("hidden");

	try {
		const photoUrl = await uploadPhoto(selectedShopId, visitorId, file);

		const { error } = await supabaseClient
			.from(TABLE_NAME)
			.update({
				status: "visited",
				visitor_id: visitorId,
				comment,
				photo_url: photoUrl,
				created_at: new Date().toISOString()
			})
			.eq("id", selectedShopId);
		photoInput.value = "";

		await loadShops();
		renderPins();
		renderShopList();

		const updatedShop = shops.find((s) => s.id === selectedShopId);
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
		const allowed = ["余裕", "普通", "腹八分目", "限界"];
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

function formatShortDate(value) {
	if (!value) return "";

	const date = new Date(value);

	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	return `${month}/${day} ${hours}:${minutes}`;
}

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