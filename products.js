
/* ========================================
   Product Catalog Data
   INJ Recommendations for INP
======================================== */

/*
各商品の設定項目

id:
  商品ごとに異なるID

name:
  商品名

category:
  商品カテゴリ

manufacturer:
  メーカー名

description:
  商品の概要・主な特徴

recommendation:
  INJがINPにおすすめする理由

image:
  商品画像のパス

catalogUrl:
  PDFカタログ・仕様書のパス

price:
  参考価格（不要なら空欄）

featured:
  おすすめ商品を先に表示する場合は true
*/

const products = [
  {
    id: "product-001",
    name: "Industrial IoT Edge Gateway X1",
    category: "Industrial Automation",
    manufacturer: "TechCorp Japan",

    description:
      "An industrial IoT gateway designed to connect equipment and collect operational data. Please confirm the detailed specifications with the manufacturer.",

    recommendation:
      "INJ recommends this product for consideration in applications involving industrial equipment connectivity and production data collection.",

    image: "images/product-001.jpg",
    catalogUrl: "documents/product-001.pdf",

    price: "",
    featured: true
  },

  {
    id: "product-002",
    name: "Precision AC Servo Driver S-500",
    category: "Motion Control",
    manufacturer: "Nippon Motion Systems",

    description:
      "An AC servo driver intended for precision motion-control applications. Please check motor compatibility and technical specifications before use.",

    recommendation:
      "INJ recommends reviewing this product for applications requiring accurate motion control. Compatibility with the customer's equipment should be confirmed.",

    image: "images/product-002.jpg",
    catalogUrl: "documents/product-002.pdf",

    price: "",
    featured: true
  },

  {
    id: "product-003",
    name: "AI Inspection Vision Camera C-40",
    category: "Inspection Equipment",
    manufacturer: "OptoVision Lab",

    description:
      "A vision camera concept for industrial inspection applications. Confirm supported inspection functions, software requirements, and system compatibility before proposing it.",

    recommendation:
      "INJ recommends considering this product for customers exploring automated visual inspection or quality-control solutions.",

    image: "images/product-003.jpg",
    catalogUrl: "documents/product-003.pdf",

    price: "",
    featured: true
  },

  {
    id: "product-004",
    name: "Harmonic Miniature Gearhead MG-15",
    category: "Mechanical Components",
    manufacturer: "Precision Gear Works",

    description:
      "A miniature gearhead intended for compact mechanical drive applications. Please confirm dimensions, gear ratio, torque, and compatibility with the intended motor.",

    recommendation:
      "INJ recommends evaluating this product for applications where compact size and precise mechanical movement are important.",

    image: "images/product-004.jpg",
    catalogUrl: "documents/product-004.pdf",

    price: "",
    featured: false
  }
];
