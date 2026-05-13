// ==============================
// Supabase設定
// ==============================

const SUPABASE_URL = "https://fdkyhobujjssahrdnvxj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZka3lob2J1ampzc2FocmRudnhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2Nzk2NTksImV4cCI6MjA5NDI1NTY1OX0.puO3ciHMGe_B140npC_WM5p3ilDiS9adzE0eZIUYJ3Y";

const TABLE_NAME = "noodle_records";
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

let shops = [];
let selectedShopId = null;

// ==============================
// 初期化
// ==============================

init();

async function init() {
	await loadShops();
	renderPins();
	renderShopList();
}

// ==============================
// Supabaseから取得
// ==============================

async function loadShops() {
	const { data, error } = await supabaseClient
		.from(TABLE_NAME)
		.select("*")
		.order("created_at", { ascending: true });

	if (error) {
		console.error(error);
		alert("店舗データの取得に失敗しました");
		return;
	}

	shops = data || [];
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
			openShopModal(shop.id);
		});

		pinLayer.appendChild(pin);
	});
}

function renderShopList() {
	shopList.innerHTML = "";

	shops.forEach((shop) => {
		const card = document.createElement("div");
		card.className = "shop-card";

		if (shop.status === "visited") {
			card.classList.add("visited");
		}

		if (shop.id === selectedShopId) {
			card.classList.add("selected");
		}

		card.innerHTML = `
			<h3>${escapeHtml(shop.shop_name)}</h3>
			<span class="badge ${shop.status === "visited" ? "visited" : ""}">
			${shop.status === "visited" ? "訪問済み" : "未訪問"}
			</span>
		`;

		card.addEventListener("click", () => {
			selectShop(shop.id);
			openShopModal(shop.id);
		});

		shopList.appendChild(card);
	});
}

function renderVisitHistory(shop) {
	if (shop.status !== "visited") {
		visitHistory.innerHTML = `<p>まだ行っていません。</p>`;
		return;
	}

	const dateText = shop.created_at
		? new Date(shop.created_at).toLocaleString("ja-JP")
		: "";

	visitHistory.innerHTML = `
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

	modal.classList.remove("hidden");
	}

	closeModal.addEventListener("click", () => {
	modal.classList.add("hidden");
	});

	modal.addEventListener("click", (event) => {
	if (event.target === modal) {
		modal.classList.add("hidden");
	}
});

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

		alert("登録しました");
	} catch (error) {
		console.error(error);
		alert("登録に失敗しました");
	}
});

async function uploadPhoto(shopId, visitorName, file) {
	const fileExt = file.name.split(".").pop();
	const safeName = visitorName.replace(/[^\w\-ぁ-んァ-ン一-龥]/g, "");
	const fileName = `${shopId}/${Date.now()}-${safeName}.${fileExt}`;

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