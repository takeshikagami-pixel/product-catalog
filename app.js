
"use strict";

/*
 * PRODUCT CATALOG
 * Images: images/
 * PDF documents: documents/
 */

// ========================================
// 1. PRODUCT DATA
// ========================================

const products = [
  {
    id: "p001",
    name: "Precision Regulator",
    manufacturer: "CKD",
    partNumber: "RP1000-8-02-G49PB3",
    category: "Pneumatic Components",
    featured: true,
    status: "active",
    updatedAt: "2026-10-26",
    image: "images/ckd-rp1000.jpg",
    tone: "tone-teal",
    documents: [
      {
        title: "Manufacturer Catalog (PDF)",
        file: "documents/precision-regulator-catalog.pdf"
      }
    ],
    description:
      "A precision regulator for industrial pneumatic applications.",
    recommendation:
      "Selected by the Japan team as a product worth introducing to overseas customers. Confirm the exact model and specifications before proposing it.",
    applications: [
      "Industrial pneumatic systems",
      "Equipment requiring pressure regulation"
    ],
    targetCustomers:
      "Manufacturers and factories using pneumatic equipment."
  },
  {
    id: "p002",
    name: "Switching Power Supply",
    manufacturer: "TDK-Lambda",
    partNumber: "HWS150A-24/A",
    category: "Power Supplies",
    featured: true,
    status: "active",
    updatedAt: "2026-10-23",
    image: "images/switching-power-supply.jpg",
    tone: "tone-blue",
    documents: [
      {
        title: "Manufacturer Catalog (PDF)",
        file: "documents/switching-power-supply-catalog.pdf"
      }
    ],
    description: "An industrial switching power supply product.",
    recommendation:
      "A candidate product for customers looking for industrial power supply solutions. Verify electrical requirements and the exact model before making a proposal.",
    applications: [
      "Industrial control equipment",
      "Electrical equipment"
    ],
    targetCustomers: "Manufacturers and system integrators."
  },
  {
    id: "p003",
    name: "Relay Socket",
    manufacturer: "OMRON",
    partNumber: "PYF14A-E",
    category: "Relays & Sockets",
    featured: false,
    status: "active",
    updatedAt: "2026-10-23",
    image: "images/relay-socket.jpg",
    tone: "tone-sand",
    documents: [
      {
        title: "Product Specifications (PDF)",
        file: "documents/relay-socket-specifications.pdf"
      }
    ],
    description:
      "A relay socket for compatible industrial relay applications.",
    recommendation:
      "Consider introducing this product to customers who use compatible relay systems. Confirm the relay model and mounting requirements.",
    applications: [
      "Industrial control panels",
      "Relay-based control systems"
    ],
    targetCustomers: "Factories and control panel builders."
  },
  {
    id: "p004",
    name: "Digital Pressure Switch",
    manufacturer: "SMC",
    partNumber: "ISE40A-01-R-M",
    category: "Sensors & Switches",
    featured: true,
    status: "active",
    updatedAt: "2026-10-23",
    image: "images/digital-pressure-switch.jpg",
    tone: "tone-lilac",
    documents: [
      {
        title: "Manufacturer Catalog (PDF)",
        file: "documents/digital-pressure-switch-catalog.pdf"
      }
    ],
    description:
      "A digital pressure switch for pressure monitoring applications.",
    recommendation:
      "A potential product for customers looking to monitor pressure in industrial equipment. Check the required range, connections, and output specifications.",
    applications: [
      "Pressure monitoring",
      "Industrial automation"
    ],
    targetCustomers:
      "Equipment manufacturers and factory automation teams."
  },
  {
    id: "p005",
    name: "Tower Lamp Base",
    manufacturer: "To be confirmed",
    partNumber: "TPWL5-110V",
    category: "Indicators & Signal Devices",
    featured: false,
    status: "active",
    updatedAt: "2026-10-23",
    image: "images/tower-lamp-base.jpg",
    tone: "tone-rose",
    documents: [],
    description:
      "A tower lamp base component. Verify the manufacturer and compatible product series before introducing it to customers.",
    recommendation:
      "Consider this item for customers who use industrial signal lamps. Confirm compatibility and voltage requirements before proposing it.",
    applications: [
      "Industrial status indication",
      "Equipment signal lamps"
    ],
    targetCustomers:
      "Factories and industrial equipment manufacturers."
  },
  {
    id: "p006",
    name: "DC24V Relay",
    manufacturer: "OMRON",
    partNumber: "MY4N-D2 DC24V",
    category: "Relays & Sockets",
    featured: false,
    status: "active",
    updatedAt: "2026-10-23",
    image: "images/dc24v-relay.jpg",
    tone: "tone-teal",
    documents: [],
    description:
      "A DC24V relay product for compatible control applications.",
    recommendation:
      "Consider introducing this relay to customers who use compatible control circuits. Verify the exact model, coil voltage, and contact configuration.",
    applications: [
      "Industrial control circuits",
      "Control panels"
    ],
    targetCustomers:
      "Factories and electrical equipment manufacturers."
  }
];

// ========================================
// 2. ELEMENTS
// ========================================

const $ = (id) => document.getElementById(id);

const searchInput = $("searchInput");
const categoryFilter = $("categoryFilter");
const manufacturerFilter = $("manufacturerFilter");
const sortSelect = $("sortSelect");
const productGrid = $("productGrid");
const resultCount = $("resultCount");
const emptyState = $("emptyState");
const modal = $("productModal");
const modalContent = $("modalContent");

// ========================================
// 3. SAFE HTML OUTPUT
// ========================================

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function getActiveProducts() {
  return products.filter(
    (product) => product.status === "active"
  );
}

// ========================================
// 4. FILTER DROPDOWNS
// ========================================

function populateFilters() {
  const activeProducts = getActiveProducts();

  const categories = [
    ...new Set(activeProducts.map((p) => p.category))
  ].sort();

  const manufacturers = [
    ...new Set(activeProducts.map((p) => p.manufacturer))
  ].sort();

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  manufacturers.forEach((manufacturer) => {
    const option = document.createElement("option");
    option.value = manufacturer;
    option.textContent = manufacturer;
    manufacturerFilter.appendChild(option);
  });
}

// ========================================
// 5. SEARCH, FILTER, AND SORT
// ========================================

function getFilteredProducts() {
  const query = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const selectedManufacturer = manufacturerFilter.value;

  const filtered = getActiveProducts().filter((product) => {
    const searchableText = [
      product.name,
      product.manufacturer,
      product.partNumber,
      product.category,
      product.description,
      product.recommendation,
      product.targetCustomers,
      ...(product.applications || [])
    ].join(" ").toLowerCase();

    const matchesSearch =
      !query || searchableText.includes(query);

    const matchesCategory =
      !selectedCategory ||
      product.category === selectedCategory;

    const matchesManufacturer =
      !selectedManufacturer ||
      product.manufacturer === selectedManufacturer;

    return matchesSearch &&
      matchesCategory &&
      matchesManufacturer;
  });

  switch (sortSelect.value) {
    case "name":
      filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      break;

    case "manufacturer":
      filtered.sort((a, b) =>
        a.manufacturer.localeCompare(b.manufacturer)
      );
      break;

    default:
      filtered.sort((a, b) =>
        Number(b.featured) - Number(a.featured) ||
        a.name.localeCompare(b.name)
      );
  }

  return filtered;
}

// ========================================
// 6. PRODUCT CARD TEMPLATE
// ========================================

function renderProductCard(product) {
  const featuredBadge = product.featured
    ? '<span class="featured-badge">FEATURED</span>'
    : "";

  return `
    <article class="product-card">
      <div class="product-art ${escapeHtml(product.tone || "tone-blue")}">
        ${featuredBadge}
        <img
          class="catalog-product-image"
          src="${escapeHtml(product.image || "")}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
        >
        <span class="product-symbol" hidden aria-hidden="true">
          ${escapeHtml(product.name.slice(0, 2).toUpperCase())}
        </span>
      </div>
      <div class="product-content">
        <p class="product-maker">${escapeHtml(product.manufacturer)}</p>
        <h3 class="product-name">${escapeHtml(product.name)}</h3>
        <p class="product-part">Part No. ${escapeHtml(product.partNumber)}</p>
        <p class="product-category">${escapeHtml(product.category)}</p>
        <p class="product-recommendation">${escapeHtml(product.recommendation)}</p>
        <div class="product-meta">
          <button
            class="details-button"
            type="button"
            data-product-id="${escapeHtml(product.id)}"
            data-s4u-event="detail-${escapeHtml(product.id)}"
            data-s4u-id="7329541183"
            aria-label="View details for ${escapeHtml(product.name)}"
          >View details</button>
        </div>
      </div>
    </article>
  `;
}

// ========================================
// 7. RENDER PRODUCT LIST
// ========================================

function renderProducts() {
  const filteredProducts = getFilteredProducts();

  resultCount.textContent = filteredProducts.length;
  emptyState.hidden = filteredProducts.length > 0;
  productGrid.hidden = filteredProducts.length === 0;

  productGrid.innerHTML = filteredProducts
    .map(renderProductCard)
    .join("");

  productGrid.querySelectorAll(".catalog-product-image")
    .forEach((img) => {
      img.addEventListener("error", () => {
        img.hidden = true;
        const fallback = img.nextElementSibling;
        if (fallback) fallback.hidden = false;
      }, { once: true });
    });
}

// ========================================
// 8. PRODUCT DETAILS
// ========================================

function openProductDetails(productId) {
  const product = getActiveProducts().find(
    (item) => item.id === productId
  );

  if (!product) return;

  const applications = (product.applications || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const documents = (product.documents || [])
    .map((doc) => `
      <li>
        <a class="document-link"
           href="${escapeHtml(doc.file)}"
           target="_blank"
           rel="noopener noreferrer">
          <span aria-hidden="true">📄</span>
          <span>${escapeHtml(doc.title)}</span>
          <span aria-hidden="true">↗</span>
        </a>
      </li>
    `)
    .join("");

  const documentSection = documents
    ? `
      <section class="detail-section">
        <h3>Product Documents</h3>
        <ul class="document-list">${documents}</ul>
      </section>
    `
    : `
      <section class="detail-section">
        <h3>Product Documents</h3>
        <p class="no-documents">Documents have not been added yet.</p>
      </section>
    `;

  modalContent.innerHTML = `
    <div class="modal-top">
      <div class="modal-art ${escapeHtml(product.tone || "tone-blue")}">
        <img class="modal-product-image"
             src="${escapeHtml(product.image || "")}"
             alt="${escapeHtml(product.name)}">
      </div>
      <div class="modal-heading">
        <p class="modal-maker">
          ${escapeHtml(product.manufacturer)} · ${escapeHtml(product.category)}
        </p>
        <h2 id="modalTitle">${escapeHtml(product.name)}</h2>
        <p class="modal-part">Part No. ${escapeHtml(product.partNumber)}</p>
        ${product.featured ? '<span class="featured-badge">FEATURED PRODUCT</span>' : ""}
      </div>
    </div>
    <section class="detail-section">
      <h3>Product Overview</h3>
      <p class="modal-description">${escapeHtml(product.description)}</p>
    </section>
    <section class="detail-section">
      <h3>Why We Recommend It</h3>
      <p class="modal-description">${escapeHtml(product.recommendation)}</p>
    </section>
    <section class="detail-section">
      <h3>Typical Applications</h3>
      <ul class="application-list">${applications}</ul>
    </section>
    <section class="detail-section">
      <h3>Target Customers</h3>
      <p class="modal-description">${escapeHtml(product.targetCustomers || "To be confirmed.")}</p>
    </section>
    ${documentSection}
    <section class="detail-section">
      <p class="last-updated">Last updated: ${escapeHtml(product.updatedAt || "Not specified")}</p>
    </section>
    <div class="modal-actions">
      <button class="button button-dark" type="button" data-close-modal>Close</button>
    </div>
  `;

  const modalImage = modalContent.querySelector(".modal-product-image");

  if (modalImage) {
    modalImage.addEventListener("error", () => {
      modalImage.hidden = true;
    }, { once: true });
  }

  modal.hidden = false;
  document.body.style.overflow = "hidden";

  const closeButton = modal.querySelector(".modal-close");
  if (closeButton) closeButton.focus();
}

// ========================================
// 9. CLOSE DETAILS
// ========================================

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

// ========================================
// 10. RESET FILTERS
// ========================================

function resetFilters() {
  searchInput.value = "";
  categoryFilter.value = "";
  manufacturerFilter.value = "";
  sortSelect.value = "featured";
  renderProducts();
}

// ========================================
// 11. EVENT LISTENERS
// ========================================

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
manufacturerFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

$("resetFilters").addEventListener("click", resetFilters);
$("emptyReset").addEventListener("click", resetFilters);

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-id]");
  if (button) {
    openProductDetails(button.dataset.productId);
  }
});

modal.addEventListener("click", (event) => {
  if (
    event.target === modal ||
    event.target.closest("[data-close-modal]")
  ) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) {
    closeModal();
  }
});

// ========================================
// 12. INITIALIZE
// ========================================

populateFilters();
renderProducts();
