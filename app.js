// ==============================
// Supabase設定
// ==============================

const SUPABASE_URL = "https://fdkyhobujjssahrdnvxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZka3lob2J1ampzc2FocmRudnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Nzk2NTksImV4cCI6MjA5NDI1NTY1OX0.puO3ciHMGe_B140npC_WM5p3ilDiS9adzE0eZIUYJ3Y";

const TABLE_NAME = "noodle_records";
const MEMBER_TABLE_NAME = "members";
const STORAGE_BUCKET = "noodle-photos";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==============================
// DOM
// ==============================

const pinLayer = document.getElementById("pinLayer");
const shopList = document.getElementById("shopList");

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");
const modalShopName = document.getElementById("modalShopName");
const visitHistory = document.getElementById("visitHistory");
const visitForm = document.getElementById("visitForm");

const visitorNameInput = document.getElementById("visitorName");
const commentInput = document.getElementById("comment");
const photoInput = document.getElementById("photoInput");

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

let shops = [];
let selectedShopId = null;
let members = [];

// ==============================
// 初期化
// ==============================

init();

async function init() {
	await Promise.all([
		loadShops(),
		loadMembers()
	]);

	renderPins();
	renderShopList();
	renderMemberSelect();
	renderMemberList();
}

// ==============================
// Supabaseから取得
// ==============================

async function loadShops() {
	const { data, error } = await supabaseClient
		.from(TABLE_NAME)
		.select("*")
		.order("area", { ascending: true })
		.order("created_at", { ascending: true });

	if (error) {
		console.error(error);
		alert("店舗データの取得に失敗しました");
		return;
	}

	shops = data || [];
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
}

// ==============================
// 描画
// ==============================

function renderPins() {
	pinLayer.innerHTML = "";

	shops.forEach((shop) => {
		const pin = document.createElement("button");

		pin.className = `pin ${shop.status === "visited" ? "visited" : "unvisited"}`;

		if (shop.id === selectedShopId) {
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
		const area = shop.area || "未分類";

		if (!groups[area]) {
			groups[area] = [];
		}

		groups[area].push(shop);
		return groups;
	}, {});

	Object.entries(groupedShops).forEach(([area, areaShops]) => {
		const areaGroup = document.createElement("div");
		areaGroup.className = "area-group";

		const areaTitle = document.createElement("h3");
		areaTitle.className = "area-title";
		areaTitle.textContent = area;

		areaGroup.appendChild(areaTitle);

		areaShops.forEach((shop) => {
			const card = document.createElement("div");
			card.className = "shop-card";

			const isVisited = shop.status === "visited";

			if (isVisited) {
				card.classList.add("visited");
			}

			if (shop.id === selectedShopId) {
				card.classList.add("selected");
			}

			const visitInfo = isVisited
				? `${escapeHtml(shop.visitor_name || "")} ${formatShortDate(shop.created_at)}`
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
}

function renderVisitHistory(shop) {
	if (shop.status !== "visited") {
		visitHistory.innerHTML = `<span class="visit-status">未訪問</span>`;
		return;
	}

	const dateText = shop.created_at
		? new Date(shop.created_at).toLocaleString("ja-JP")
		: "";

	visitHistory.innerHTML = `
		<span class="visit-status visited">訪問済み</span>

		<div class="visit-item">
			<div class="visit-item-name">${escapeHtml(shop.visitor_name || "")}</div>
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
		option.value = member.name;
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
		.map((member) => `
			<div class="member-item">
				${escapeHtml(member.name)}
			</div>
		`)
		.join("");
}

function renderRanking() {
	const visitedShops = shops.filter((shop) => shop.status === "visited" && shop.visitor_name);

	const rankingMap = visitedShops.reduce((map, shop) => {
		map[shop.visitor_name] = (map[shop.visitor_name] || 0) + 1;
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

	const visitorName = visitorNameInput.value.trim();
	const comment = commentInput.value.trim();
	const file = photoInput.files[0];

	if (!visitorName || !file) {
		alert("名前と写真を入力してください");
		return;
	}

	try {
		const photoUrl = await uploadPhoto(selectedShopId, visitorName, file);

		const { error } = await supabaseClient
			.from(TABLE_NAME)
			.update({
			status: "visited",
			visitor_name: visitorName,
			comment,
			photo_url: photoUrl,
			created_at: new Date().toISOString()
			})
			.eq("id", selectedShopId);

		if (error) throw error;

		visitorNameInput.value = "";
		commentInput.value = "";
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
				name
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