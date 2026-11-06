
(function () {
  "use strict";

  let currentIndex = 0;
  let featuredProducts = [];
  let initialized = false;

  function isFeatured(product) {
    const value = product.featured;

    return value === true ||
      value === 1 ||
      String(value).trim().toLowerCase() === "true";
  }

  function createRecommendedCard(product) {
    const card = document.createElement("button");

    card.type = "button";
    card.className = "recommended-card";

    const imageArea = document.createElement("div");
    imageArea.className = "recommended-card-image";

    if (product.image) {
      const image = document.createElement("img");
      image.src = product.image;
      image.alt = product.name || "Product image";
      image.loading = "lazy";
      imageArea.appendChild(image);
    }

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

    card.addEventListener("click", function () {
      if (typeof window.handleProductClick === "function") {
        window.handleProductClick(product.id);
      } else {
        console.error("handleProductClick is unavailable.");
      }
    });

    return card;
  }

  function getVisibleCount() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function updateCarousel() {
    const track = document.getElementById("recommended-track");
    const previous = document.getElementById("recommended-prev");
    const next = document.getElementById("recommended-next");
    const position = document.getElementById("recommended-position");

    if (!track) return;

    const cards = track.querySelectorAll(".recommended-card");

    if (!cards.length) return;

    const visibleCount = getVisibleCount();
    const maxIndex = Math.max(
      0,
      featuredProducts.length - visibleCount
    );

    currentIndex = Math.max(
      0,
      Math.min(currentIndex, maxIndex)
    );

    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;

    track.style.transform =
      "translate3d(-" +
      (currentIndex * (cardWidth + gap)) +
      "px, 0, 0)";

    if (previous) {
      previous.disabled = currentIndex === 0;
    }

    if (next) {
      next.disabled = currentIndex >= maxIndex;
    }

    if (position) {
      position.textContent =
        (currentIndex + 1) + " / " + featuredProducts.length;
    }
  }

  function nextProduct() {
    const maxIndex = Math.max(
      0,
      featuredProducts.length - getVisibleCount()
    );

    if (currentIndex < maxIndex) {
      currentIndex++;
      updateCarousel();
    }
  }

  function previousProduct() {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  }

  function renderRecommendedProducts() {
    const track = document.getElementById("recommended-track");

    if (!track || typeof products === "undefined") {
      return false;
    }

    featuredProducts = products.filter(isFeatured);
    track.replaceChildren();
    currentIndex = 0;

    if (!featuredProducts.length) {
      const message = document.createElement("p");
      message.className = "recommended-empty";
      message.textContent = "No recommended products are available.";
      track.appendChild(message);
      return true;
    }

    featuredProducts.forEach(function (product) {
      track.appendChild(createRecommendedCard(product));
    });

    updateCarousel();

    return true;
  }

  function setupCarousel() {
    if (initialized) return;
    initialized = true;

    const previous = document.getElementById("recommended-prev");
    const next = document.getElementById("recommended-next");

    if (previous) {
      previous.addEventListener("click", previousProduct);
    }

    if (next) {
      next.addEventListener("click", nextProduct);
    }

    window.addEventListener("resize", updateCarousel);
  }

  function waitForProducts() {
    let attempts = 0;

    const timer = setInterval(function () {
      attempts++;

      const grid = document.getElementById("catalog-grid");

      if (grid && grid.children.length > 0) {
        clearInterval(timer);
        renderRecommendedProducts();
        return;
      }

      if (attempts >= 150) {
        clearInterval(timer);
        console.error("Product loading timed out.");
      }
    }, 200);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupCarousel();
    waitForProducts();
  });

})();
