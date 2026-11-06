
(function () {
  "use strict";

  function isFeatured(product) {
    const value = product.featured;

    return value === true ||
      value === 1 ||
      String(value).trim().toLowerCase() === "true";
  }

  function createRecommendedCard(product) {
    const card = document.createElement("article");

    card.className = "recommended-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");

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

    tag.textContent =
      product.recommendation || "Recommended Product";

    const name = document.createElement("h3");
    name.textContent = product.name || "Unnamed product";

    const manufacturer = document.createElement("p");
    manufacturer.textContent = product.manufacturer || "";

    const more = document.createElement("span");
    more.className = "recommended-card-more";
    more.textContent = "VIEW DETAILS →";

    content.append(tag, name, manufacturer, more);
    card.append(imageArea, content);

    // Open the existing product detail modal
    function openDetails() {
      if (typeof window.handleProductClick === "function") {
        window.handleProductClick(product.id);
      } else {
        console.warn("Product detail function is not available yet.");
      }
    }

    card.addEventListener("click", openDetails);

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openDetails();
      }
    });

    return card;
  }

  function renderRecommendedProducts() {
    const track = document.getElementById("recommended-track");

    if (!track || typeof products === "undefined") {
      return false;
    }

    const featuredProducts = products.filter(isFeatured);

    track.replaceChildren();

    if (featuredProducts.length === 0) {
      const message = document.createElement("p");

      message.className = "recommended-empty";
      message.textContent =
        "No recommended products are available.";

      track.appendChild(message);
      track.style.animation = "none";

      return true;
    }

    // First set of products
    featuredProducts.forEach(function (product) {
      track.appendChild(createRecommendedCard(product));
    });

    // Duplicate products for continuous scrolling
    if (featuredProducts.length > 1) {
      featuredProducts.forEach(function (product) {
        const duplicate = createRecommendedCard(product);

        duplicate.setAttribute("aria-hidden", "true");
        duplicate.tabIndex = -1;

        track.appendChild(duplicate);
      });
    } else {
      track.style.animation = "none";
    }

    return true;
  }

  function waitForProducts() {
    let attempts = 0;
    const maxAttempts = 100;

    const timer = setInterval(function () {
      attempts++;

      const grid = document.getElementById("catalog-grid");

      // Wait for the existing catalog to render
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

  document.addEventListener(
    "DOMContentLoaded",
    waitForProducts
  );

})();
