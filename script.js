
 // ========================================
// Product Catalog Functionality
// INJ Recommendations for INP
// ========================================

// Google Apps Script Web アプリ URL
const GAS_ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbxxRPOPCQ9nLHz0YhacP4-sBrPL2WengyOONKfYMu9VsV-8Xv5uL_ZlpZIwvMlYlY7AYw/exec";

// ブラウザごとの商品閲覧回数を保存するキー
const STORAGE_KEY = "catalog_click_counts";

// ----------------------------------------
// Utility
// ----------------------------------------

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

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, function (char) {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[char];
  });
}

// ----------------------------------------
// Google Sheets Logging
// ----------------------------------------

function sendClickToSpreadsheet(product) {
  if (!GAS_ENDPOINT_URL) {
    console.info(
      "Google Sheets logging is not configured. Set GAS_ENDPOINT_URL."
    );
    return;
  }

  // Apps Script の e.parameter で受け取れる形式にする
  const payload = new URLSearchParams({
    productId: String(product.id ?? ""),
    productName: String(product.name ?? ""),
    category: String(product.category ?? ""),
    manufacturer: String(product.manufacturer ?? "")
  });

  // no-cors ではレスポンス内容を読み取れません。
  // 記録されたかどうかは Google スプレッドシートで確認してください。
  fetch(GAS_ENDPOINT_URL, {
    method: "POST",
    mode: "no-cors",
    body: payload
  }).catch(function (error) {
    console.error("Failed to send product click:", error);
  });
}

// ----------------------------------------
// Stats4U Event Tracking
// ----------------------------------------

function trackProductDetailEvent(product) {
  /*
    Stats4U のページ閲覧カウンターと商品別イベント計測は別機能です。

    このイベントはページ内で発生させていますが、
    Stats4U 側で自動的に記録されることは保証されません。
  */

  document.dispatchEvent(
    new CustomEvent("productDetailOpened", {
      detail: {
        productId: product.id,
        productName: product.name
      }
    })
  );
}

// ----------------------------------------
// Product Click Handling
// ----------------------------------------

function handleProductClick(productId) {
  const product = products.find(function (item) {
    return String(item.id) === String(productId);
  });

  if (!product) {
    console.error("Product not found:", productId);
    return;
  }

  updateClickCount(product.id);
  sendClickToSpreadsheet(product);
  trackProductDetailEvent(product);
  openModal(product);
}

// ----------------------------------------
// Modal
// ----------------------------------------

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
    modalImg.src = product.image || "";
    modalImg.alt = product.name || "Product image";
    modalImg.onerror = function () {
      this.style.display = "none";
    };
    modalImg.style.display = product.image ? "" : "none";
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

  if (modal) {
    modal.hidden = true;
  }

  document.body.classList.remove("modal-open");
}

// ----------------------------------------
// Product Cards
// ----------------------------------------

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

  // Stats4U 用の属性。これだけで計測されるとは限りません。
  detailsButton.setAttribute(
    "data-s4u-event",
    "detail-" + String(product.id)
  );
  detailsButton.setAttribute("data-s4u-id", "7329541183");

  detailsButton.addEventListener("click", function () {
    handleProductClick(product.id);
  });

  info.appendChild(category);
  info.appendChild(name);
  info.appendChild(manufacturer);
  info.appendChild(description);
  info.appendChild(detailsButton);

  card.appendChild(imageArea);
  card.appendChild(info);

  return card;
}

function renderCatalog() {
  const grid = getElement("catalog-grid");
  const countDisplay = getElement("product-count-display");
  const emptyState = getElement("emptyState");

  if (!grid) return;

  const searchInput = getElement("searchInput");
  const categoryFilter = getElement("categoryFilter");
  const manufacturerFilter = getElement("manufacturerFilter");
  const sortBy = getElement("sortBy");

  const keyword = searchInput
    ? searchInput.value.trim().toLowerCase()
    : "";

  const selectedCategory = categoryFilter
    ? categoryFilter.value
    : "";

  const selectedManufacturer = manufacturerFilter
    ? manufacturerFilter.value
    : "";

  const sortValue = sortBy ? sortBy.value : "featured";

  let filteredProducts = products.filter(function (product) {
    const searchableText = [
      product.name,
      product.category,
      product.manufacturer,
      product.description,
      product.recommendation
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeyword = searchableText.includes(keyword);

    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;

    const matchesManufacturer =
      !selectedManufacturer ||
      product.manufacturer === selectedManufacturer;

    return (
      matchesKeyword &&
      matchesCategory &&
      matchesManufacturer
    );
  });

  if (sortValue === "name") {
    filteredProducts.sort(function (a, b) {
      return (a.name || "").localeCompare(b.name || "");
    });
  } else if (sortValue === "manufacturer") {
    filteredProducts.sort(function (a, b) {
      return (a.manufacturer || "").localeCompare(
        b.manufacturer || ""
      );
    });
  } else {
    filteredProducts.sort(function (a, b) {
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }

  grid.replaceChildren();

  filteredProducts.forEach(function (product) {
    grid.appendChild(createProductCard(product));
  });

  if (countDisplay) {
    countDisplay.textContent = filteredProducts.length;
  }

  if (emptyState) {
    emptyState.hidden = filteredProducts.length !== 0;
  }
}

// ----------------------------------------
// Filters
// ----------------------------------------

function populateFilterOptions() {
  const categoryFilter = getElement("categoryFilter");
  const manufacturerFilter = getElement("manufacturerFilter");

  if (categoryFilter) {
    const currentValue = categoryFilter.value;

    const categories = Array.from(
      new Set(
        products
          .map(function (product) {
            return product.category;
          })
          .filter(Boolean)
      )
    ).sort();

    categoryFilter.replaceChildren(
      new Option("All categories", "")
    );

    categories.forEach(function (category) {
      categoryFilter.add(new Option(category, category));
    });

    categoryFilter.value = categories.includes(currentValue)
      ? currentValue
      : "";
  }

  if (manufacturerFilter) {
    const currentValue = manufacturerFilter.value;

    const manufacturers = Array.from(
      new Set(
        products
          .map(function (product) {
            return product.manufacturer;
          })
          .filter(Boolean)
      )
    ).sort();

    manufacturerFilter.replaceChildren(
      new Option("All manufacturers", "")
    );

    manufacturers.forEach(function (manufacturer) {
      manufacturerFilter.add(new Option(manufacturer, manufacturer));
    });

    manufacturerFilter.value = manufacturers.includes(currentValue)
      ? currentValue
      : "";
  }
}

function setupFilters() {
  const searchInput = getElement("searchInput");
  const categoryFilter = getElement("categoryFilter");
  const manufacturerFilter = getElement("manufacturerFilter");
  const sortBy = getElement("sortBy");
  const resetButton = getElement("resetFilters");

  if (searchInput) {
    searchInput.addEventListener("input", renderCatalog);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderCatalog);
  }

  if (manufacturerFilter) {
    manufacturerFilter.addEventListener("change", renderCatalog);
  }

  if (sortBy) {
    sortBy.addEventListener("change", renderCatalog);
  }

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

// ----------------------------------------
// Modal Events
// ----------------------------------------

function setupModal() {
  const modal = getElement("productModal");
  const closeButton = getElement("modalCloseBtn");

  if (closeButton) {
    closeButton.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal && !modal.hidden) {
      closeModal();
    }
  });
}

// ----------------------------------------
// Initialize
// ----------------------------------------

document.addEventListener("DOMContentLoaded", function () {
  populateFilterOptions();
  setupFilters();
  setupModal();
  renderCatalog();
});
