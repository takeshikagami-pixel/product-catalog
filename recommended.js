
(function () {
  "use strict";

  let currentIndex = 0;
  let featuredProducts = [];
  let autoplayTimer = null;

  const AUTOPLAY_INTERVAL = 5000;

  function isFeatured(product) {
    const value = product.featured;

    return value === true ||
      value === 1 ||
      String(value).trim().toLowerCase() === "true";
  }

  // Create one recommended product card
  function createRecommendedCard(product) {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "recommended-card";

    card.setAttribute(
      "aria-label",
      "View details for " + (product.name || "product")
    );

    // Image
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

    // Use the existing click tracking and modal function
    card.addEventListener("click", function () {
      if (typeof window.handleProductClick === "function") {
        window.handleProductClick(product.id);
      } else {
        console.error("Product detail function is unavailable.");
      }
    });

    return card;
  }

  // Calculate how many cards are visible
  function getVisibleCount() {
    const viewport = document.querySelector(
      ".recommended-viewport"
    );

    const firstCard = document.querySelector(
      ".recommended-card"
    );

    if (!viewport || !firstCard) return 1;

    const gap = parseFloat(
      getComputedStyle(
        document.getElementById("recommended-track")
      ).gap
    ) || 0;

    const cardWidth = firstCard.getBoundingClientRect().width;

    if (!cardWidth) return 1;

    return Math.max(
      1,
      Math.floor(
        (viewport.clientWidth + gap) / (cardWidth + gap)
      )
    );
  }

  // Update carousel position
  function updateCarousel() {
    const track = document.getElementById("recommended-track");
    const previousButton = document.getElementById("recommended-prev");
    const nextButton = document.getElementById("recommended-next");
    const position = document.getElementById("recommended-position");

    if (!track || featuredProducts.length === 0) return;

    const firstCard = track.querySelector(".recommended-card");

    if (!firstCard) return;

    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = firstCard.getBoundingClientRect().width;

    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(
      0,
      featuredProducts.length - visibleCount
    );

    currentIndex = Math.min(currentIndex, maxIndex);

    const moveDistance = cardWidth + gap;

    track.style.transform =
      "translateX(-" + (currentIndex * moveDistance) + "px)";

    if (previousButton) {
      previousButton.disabled =
        featuredProducts.length <= visibleCount;
    }

    if (nextButton) {
      nextButton.disabled =
        featuredProducts.length <= visibleCount;
    }

    if (position) {
      const current = Math.min(
        currentIndex + 1,
        featuredProducts.length
      );

      position.textContent =
        current + " / " + featuredProducts.length;
    }
  }

  // Move one product forward
  function nextProduct() {
    const visibleCount = getVisibleCount();

    const maxIndex = Math.max(
      0,
      featuredProducts.length - visibleCount
    );

    if (maxIndex <= 0) return;

    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex++;
    }

    updateCarousel();
  }

  // Move one product backward
  function previousProduct() {
    const visibleCount = getVisibleCount();

    const maxIndex = Math.max(
      0,
      featuredProducts.length - visibleCount
    );

    if (maxIndex <= 0) return;

    if (currentIndex <= 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex--;
    }

    updateCarousel();
  }

  // Autoplay
  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    if (featuredProducts.length <= getVisibleCount()) {
      return;
    }

    autoplayTimer = setInterval(
      nextProduct,
      AUTOPLAY_INTERVAL
    );
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

  // Initialize controls and events
  function setupCarousel() {
    const previousButton = document.getElementById("recommended-prev");
    const nextButton = document.getElementById("recommended-next");
    const carousel = document.querySelector(".recommended-carousel");

    if (previousButton) {
      previousButton.addEventListener("click", function () {
        previousProduct();
        startAutoplay();
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", function () {
        nextProduct();
        startAutoplay();
      });
    }

    // Pause autoplay while the user is interacting
    if (carousel) {
      carousel.addEventListener("mouseenter", stopAutoplay);
      carousel.addEventListener("mouseleave", startAutoplay);
      carousel.addEventListener("focusin", stopAutoplay);
      carousel.addEventListener("focusout", startAutoplay);
    }

    window.addEventListener("resize", function () {
      updateCarousel();
      startAutoplay();
    });
  }

  // Wait until the existing catalog has loaded
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

  document.addEventListener("DOMContentLoaded", function () {
    setupCarousel();
    waitForProducts();
  });

})();
