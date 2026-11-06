
(function () {
  "use strict";

  let currentIndex = 0;
  let featuredProducts = [];
  let autoplayTimer = null;
  let initialized = false;

  const AUTOPLAY_INTERVAL = 5000;

  // Check featured products
  function isFeatured(product) {
    const value = product.featured;

    return value === true ||
      value === 1 ||
      String(value).trim().toLowerCase() === "true";
  }

  // Create product card
  function createRecommendedCard(product) {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "recommended-card";

    card.setAttribute(
      "aria-label",
      "View details for " + (product.name || "product")
    );

    // Product image
    const imageArea = document.createElement("div");
    imageArea.className = "recommended-card-image";

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

    // Product information
    const content = document.createElement("div");
    content.className = "recommended-card-content";

    const tag = document.createElement("span");
    tag.className = "recommended-card-tag";
    tag.textContent = "INJ RECOMMENDATION";

    const name = document.createElement("h3");
    name.textContent = product.name || "Unnamed product";

    const manufacturer = document.createElement("p");
    manufacturer.textContent = product.manufacturer || "";

    const more = document.createElement("span");
    more.className = "recommended-card-more";
    more.textContent = "VIEW DETAILS →";

    content.append(tag, name, manufacturer, more);
    card.append(imageArea, content);

    // Existing detail modal and click tracking
    card.addEventListener("click", function () {
      if (typeof window.handleProductClick === "function") {
        window.handleProductClick(product.id);
      } else {
        console.error("Product detail function is unavailable.");
      }
    });

    return card;
  }

  // Calculate card width
  function getCardWidth(viewportWidth) {
    if (window.innerWidth <= 600) {
      return viewportWidth * 0.84;
    }

    if (window.innerWidth <= 900) {
      return viewportWidth * 0.78;
    }

    return viewportWidth * 0.70;
  }

  // Update carousel position
  function updateCarousel() {
    const track = document.getElementById("recommended-track");
    const viewport = document.querySelector(
      ".recommended-viewport"
    );

    const previous = document.getElementById("recommended-prev");
    const next = document.getElementById("recommended-next");
    const position = document.getElementById(
      "recommended-position"
    );

    if (!track || !viewport) return;

    const cards = track.querySelectorAll(".recommended-card");

    if (!cards.length) return;

    const viewportWidth = viewport.clientWidth;
    const cardWidth = getCardWidth(viewportWidth);
    const gap = parseFloat(getComputedStyle(track).gap) || 0;

    const sideSpace = (viewportWidth - cardWidth) / 2;

    // Apply the same width to every card
    cards.forEach(function (card) {
      card.style.flex = "0 0 " + cardWidth + "px";
    });

    track.style.paddingLeft = sideSpace + "px";
    track.style.paddingRight = sideSpace + "px";

    const maxIndex = featuredProducts.length - 1;

    currentIndex = Math.max(
      0,
      Math.min(currentIndex, maxIndex)
    );

    const moveDistance = cardWidth + gap;

    track.style.transform =
      "translate3d(-" +
      (currentIndex * moveDistance) +
      "px, 0, 0)";

    if (previous) {
      previous.disabled = featuredProducts.length <= 1;
    }

    if (next) {
      next.disabled = featuredProducts.length <= 1;
    }

    if (position) {
      position.textContent =
        (currentIndex + 1) + " / " + featuredProducts.length;
    }
  }

  // Move to next product
  function nextProduct() {
    if (featuredProducts.length <= 1) return;

    currentIndex++;

    // Return to the first product after the last one
    if (currentIndex >= featuredProducts.length) {
      currentIndex = 0;
    }

    updateCarousel();
  }

  // Move to previous product
  function previousProduct() {
    if (featuredProducts.length <= 1) return;

    currentIndex--;

    // Move to the last product before the first one
    if (currentIndex < 0) {
      currentIndex = featuredProducts.length - 1;
    }

    updateCarousel();
  }

  // Stop automatic movement
  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  // Start automatic movement every 5 seconds
  function startAutoplay() {
    stopAutoplay();

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (featuredProducts.length <= 1) return;

    autoplayTimer = setInterval(function () {
      nextProduct();
    }, AUTOPLAY_INTERVAL);
  }

  // Render recommended products
  function renderRecommendedProducts() {
    const track = document.getElementById("recommended-track");

    if (!track || typeof products === "undefined") {
      return false;
    }

    featuredProducts = products.filter(isFeatured);

    track.replaceChildren();
    currentIndex = 0;

    if (featuredProducts.length === 0) {
      const message = document.createElement("p");

      message.className = "recommended-empty";
      message.textContent =
        "No recommended products are available.";

      track.appendChild(message);

      stopAutoplay();

      return true;
    }

    featuredProducts.forEach(function (product) {
      track.appendChild(createRecommendedCard(product));
    });

    updateCarousel();
    startAutoplay();

    return true;
  }

  // Set up arrows and events
  function setupCarousel() {
    if (initialized) return;

    initialized = true;

    const previous = document.getElementById("recommended-prev");
    const next = document.getElementById("recommended-next");

    if (previous) {
      previous.addEventListener("click", function () {
        previousProduct();
        startAutoplay();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        nextProduct();
        startAutoplay();
      });
    }

    window.addEventListener("resize", function () {
      updateCarousel();
    });

    // Pause while the browser tab is hidden
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  // Wait for the existing product catalog to load
  function waitForProducts() {
    let attempts = 0;
    const maxAttempts = 150;

    const timer = setInterval(function () {
      attempts++;

      const grid = document.getElementById("catalog-grid");

      if (grid && grid.children.length > 0) {
        clearInterval(timer);
        renderRecommendedProducts();
        return;
      }

      if (attempts >= maxAttempts) {
        clearInterval(timer);

        console.warn(
          "Recommended products could not be loaded."
        );
      }
    }, 200);
  }

  // Initialize
  document.addEventListener("DOMContentLoaded", function () {
    setupCarousel();
    waitForProducts();
  });

})();
