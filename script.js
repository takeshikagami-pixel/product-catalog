
const GAS_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbxxRPOPCQ9nLHz0YhacP4-sBrPL2WengyOONKfYMu9VsV-8Xv5uL_ZlpZIwvMlYlY7AYw/exec";

const PRODUCTS_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbz-ygSRlDjFslLJML4ndFcL9QsAnsgOOPbTZ3IbkFoTfQmQZJrmHChrH1M_M-5oONTPnA/exec";

const STORAGE_KEY = "catalog_click_counts";

function getElement(id) {
  return document.getElementById(id);
}

function getClickCounts() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function updateClickCount(productId) {
  const counts = getClickCounts();
  counts[productId] = (counts[productId] || 0) + 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  return counts[productId];
}

function getProductViewCount(productId) {
  return getClickCounts()[productId] || 0;
}

function sendClickToSpreadsheet(product) {
  const payload = new URLSearchParams({
    productId: String(product.id ?? ""),
    productName: String(product.name ?? ""),
    category: String(product.category ?? ""),
    manufacturer: String(product.manufacturer ?? "")
  });

  fetch(GAS_ENDPOINT_URL, {
    method: "POST",
    mode: "no-cors",
    body: payload
  }).catch(error => {
    console.error("Failed to send product click:", error);
  });
}

function trackProductDetailEvent(product) {
  document.dispatchEvent(
    new CustomEvent("productDetailOpened", {
      detail: {
        productId: product.id,
        productName: product.name
      }
    })
  );
}

function handleProductClick(productId) {
  const product = products.find(
    item => String(item.id) === String(productId)
  );

  if (!product) return;

  updateClickCount(product.id);
  sendClickToSpreadsheet(product);
  trackProductDetailEvent(product);
  openModal(product);
}

function openModal(product) {
  const modal = getElement("productModal");
  if (!modal) return;

  const modalImg = getElement("modalImg");
  const modalCategory = getElement("modalCategory");
  const modalTitle = getElement("modalTitle");
  const modalManufacturer = getElement("modalManufacturer");
  const modalDetails = getElement("modalDetails");
  const modalRecommendation = getElement("modalRecommendation");
  const modalDocLink = getElement("modalDocLink");
  const modalViewCount = getElement("modalViewCount");

  if (modalImg) {
    modalImg.style.display = product.image ? "" : "none";
    modalImg.src = product.image || "";
    modalImg.alt = product.name || "Product image";
    modalImg.onerror = function () {
      this.style.display = "none";
    };
  }

  if (modalCategory) {
    modalCategory.textContent = product.category || "Uncategorized";
  }

  if (modalTitle) {
    modalTitle.textContent = product.name || "";
  }

  if (modalManufacturer) {
    modalManufacturer.textContent = product.manufacturer
      ? "Manufacturer: " + product.manufacturer
      : "";
  }

  if (modalDetails) {
    modalDetails.textContent =
      product.description || "Product details are not available yet.";
  }

  if (modalRecommendation) {
    modalRecommendation.textContent =
      product.recommendation || "No recommendation details provided.";
  }

  if (modalDocLink) {
    if (product.catalogUrl) {
      modalDocLink.href = product.catalogUrl;
      modalDocLink.style.display = "inline-flex";
      modalDocLink.textContent = "View Document / Spec Sheet";
    } else {
      modalDocLink.removeAttribute("href");
      modalDocLink.style.display = "none";
    }
  }

  if (modalViewCount) {
    modalViewCount.textContent =
      "Views on this browser: " + getProductViewCount(product.id);
  }

  modal.hidden = false;
  document.body.classList.add("modal-open");

  const closeButton = getElement("modalCloseBtn");
  if (closeButton) closeButton.focus();
}

function closeModal() {
  const modal = getElement("productModal");
  if (modal) modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const imageArea = document.createElement("div");
  imageArea.className = "product-thumb";

  if (product.image) {
    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name || "Product image";
    image.loading = "lazy";
    image.onerror = function () {
      this.style.display = "none";
    };
    imageArea.appendChild(image);
  }

  const viewBadge = document.createElement("span");
  viewBadge.className = "view-badge";
  viewBadge.textContent = "Views: " + getProductViewCount(product.id);
  imageArea.appendChild(viewBadge);

  const info = document.createElement("div");
  info.className = "product-info";

  const category = document.createElement("span");
  category.className = "category-tag";
  category.textContent = product.category || "Uncategorized";

  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name || "Unnamed product";

  const manufacturer = document.createElement("p");
  manufacturer.className = "product-manufacturer";
  manufacturer.textContent = product.manufacturer
    ? "Manufacturer: " + product.manufacturer
    : "Manufacturer not specified";

  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent =
    product.description || "Product details are not available yet.";

  const detailsButton = document.createElement("button");
  detailsButton.type = "button";
  detailsButton.className = "btn-primary";
  detailsButton.textContent = "View Details";
  detailsButton.setAttribute("data-s4u-event", "detail-" + String(product.id));
  detailsButton.setAttribute("data-s4u-id", "7329541183");
  detailsButton.addEventListener("click", function () {
    handleProductClick(product.id);
  });

  info.append(category, name, manufacturer, description, detailsButton);
  card.append(imageArea, info);
  return card;
}

function renderCatalog() {
  const grid = getElement("catalog-grid");
  const countDisplay = getElement("product-count-display");
  const emptyState = getElement("emptyState");
  if (!grid) return;

  const keyword = (getElement("searchInput")?.value || "").trim().toLowerCase();
  const selectedCategory = getElement("categoryFilter")?.value || "";
  const selectedManufacturer = getElement("manufacturerFilter")?.value || "";
  const sortValue = getElement("sortBy")?.value || "featured";

  let filteredProducts = products.filter(product => {
    const searchableText = [
      product.name,
      product.category,
      product.manufacturer,
      product.description,
      product.recommendation
    ].join(" ").toLowerCase();

    return searchableText.includes(keyword) &&
      (!selectedCategory || product.category === selectedCategory) &&
      (!selectedManufacturer || product.manufacturer === selectedManufacturer);
  });

  if (sortValue === "name") {
    filteredProducts.sort((a, b) =>
      (a.name || "").localeCompare(b.name || "")
    );
  } else if (sortValue === "manufacturer") {
    filteredProducts.sort((a, b) =>
      (a.manufacturer || "").localeCompare(b.manufacturer || "")
    );
  } else {
    filteredProducts.sort((a, b) =>
      Number(Boolean(b.featured)) - Number(Boolean(a.featured))
    );
  }

  grid.replaceChildren();
  filteredProducts.forEach(product => {
    grid.appendChild(createProductCard(product));
  });

  if (countDisplay) countDisplay.textContent = filteredProducts.length;
  if (emptyState) emptyState.hidden = filteredProducts.length !== 0;
}

function populateFilterOptions() {
  const categoryFilter = getElement("categoryFilter");
  const manufacturerFilter = getElement("manufacturerFilter");

  if (categoryFilter) {
    const current = categoryFilter.value;
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    categoryFilter.replaceChildren(new Option("All categories", ""));
    categories.forEach(value => categoryFilter.add(new Option(value, value)));
    categoryFilter.value = categories.includes(current) ? current : "";
  }

  if (manufacturerFilter) {
    const current = manufacturerFilter.value;
    const manufacturers = [...new Set(products.map(p => p.manufacturer).filter(Boolean))].sort();
    manufacturerFilter.replaceChildren(new Option("All manufacturers", ""));
    manufacturers.forEach(value => manufacturerFilter.add(new Option(value, value)));
    manufacturerFilter.value = manufacturers.includes(current) ? current : "";
  }
}

function setupFilters() {
  const searchInput = getElement("searchInput");
  const categoryFilter = getElement("categoryFilter");
  const manufacturerFilter = getElement("manufacturerFilter");
  const sortBy = getElement("sortBy");
  const resetButton = getElement("resetFilters");

  if (searchInput) searchInput.addEventListener("input", renderCatalog);
  if (categoryFilter) categoryFilter.addEventListener("change", renderCatalog);
  if (manufacturerFilter) manufacturerFilter.addEventListener("change", renderCatalog);
  if (sortBy) sortBy.addEventListener("change", renderCatalog);

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (searchInput) searchInput.value = "";
      if (categoryFilter) categoryFilter.value = "";
      if (manufacturerFilter) manufacturerFilter.value = "";
      if (sortBy) sortBy.value = "featured";
      renderCatalog();
    });
  }
}

function setupModal() {
  const modal = getElement("productModal");
  const closeButton = getElement("modalCloseBtn");

  if (closeButton) closeButton.addEventListener("click", closeModal);

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) closeModal();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) closeModal();
  });
}


function loadProductsFromSpreadsheet() {
  return new Promise(function (resolve) {
    const callbackName =
      "productCatalogCallback_" + Date.now();

    const script = document.createElement("script");
    const timeout = setTimeout(function () {
      cleanup();
      console.error("Timed out loading products from Google Sheets.");
      resolve(false);
    }, 15000);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = function (remoteProducts) {
      cleanup();

      if (
        Array.isArray(remoteProducts) &&
        remoteProducts.length > 0
      ) {
        products = remoteProducts;
        console.log(
          "Products loaded from Google Sheets:",
          products.length
        );
        resolve(true);
      } else {
        console.error("No products returned from Google Sheets.");
        resolve(false);
      }
    };

    script.onerror = function () {
      cleanup();
      console.error("Failed to load product data.");
      resolve(false);
    };

    script.src =
      PRODUCTS_ENDPOINT_URL +
      "?callback=" +
      encodeURIComponent(callbackName) +
      "&t=" +
      Date.now();

    document.head.appendChild(script);
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  await loadProductsFromSpreadsheet();
  populateFilterOptions();
  setupFilters();
  setupModal();
  renderCatalog();
});
