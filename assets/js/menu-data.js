/**
 * Calcutta Heritage Kitchen & Bistro
 * Default Menu & Restaurant Data Store
 */

const DEFAULT_RESTAURANT_DATA = {
  restaurant: {
    name: "Calcutta Heritage",
    subtitle: "Kitchen & Bistro • Est. 1928",
    tagline: "The Timeless Culinary Soul of Kolkata",
    headline: "Royalty, Romance & Slow-Braised Heritage in Every Bite",
    subheadline: "Experience the iconic harmony of Nawabi Awadh dum cooking and authentic Bengali Zamindari traditions, nestled right in the heart of Kolkata.",
    phone: "+91 98300 24891",
    whatsapp: "919830024891",
    email: "contact@calcuttaheritagebistro.com",
    address: "24B Park Street, Near Camac Street Crossing, Kolkata, West Bengal 700016",
    mapsUrl: "https://maps.google.com/?q=Park+Street+Kolkata",
    lunchHours: "12:00 PM – 4:30 PM",
    dinnerHours: "7:00 PM – 11:30 PM",
    curfewNote: "Open All 7 Days • Valet Parking Available",
    bannerAnnouncement: "✨ Pujor Special & Autumn Tasting Menu now live! Reserve tables early."
  },
  dishes: [
    {
      id: "dish-1",
      name: "Royal Kolkata Mutton Dum Biryani",
      bengaliName: "রয়্যাল কলকাতা মাটন দম বিরিয়ানি",
      category: "biryani",
      price: 495,
      isFeatured: true,
      isVeg: false,
      spiceLevel: 2, // 1 to 3
      badge: "Chef's Signature",
      image: "assets/images/biryani_hero.jpg",
      description: "Aged long-grain basmati infused with royal saffron, melt-in-mouth tender lamb shanks, the quintessential golden Kolkata potato, farm-fresh egg, and crispy beresta onions sealed in a brass handi."
    },
    {
      id: "dish-2",
      name: "Slow-Braised Kosha Mangsho & Luchi",
      bengaliName: "কষা মাংস ও ফুলকো লুচি",
      category: "mains",
      price: 520,
      isFeatured: true,
      isVeg: false,
      spiceLevel: 3,
      badge: "Legendary Bestseller",
      image: "assets/images/kosha_mangsho.jpg",
      description: "Heritage slow-cooked goat meat reduced to a luscious, dark velvety mahogany gravy in seasoned iron karahi with crushed whole spices, served alongside 4 piping hot, puffed golden luchis."
    },
    {
      id: "dish-3",
      name: "Smoked Daab Chingri in Green Coconut",
      bengaliName: "স্মোকড ডাব চিংড়ি",
      category: "mains",
      price: 640,
      isFeatured: true,
      isVeg: false,
      spiceLevel: 2,
      badge: "House Specialty",
      image: "assets/images/daab_chingri.jpg",
      description: "Jumbo Bay of Bengal tiger prawns gently simmered in stone-ground mustard paste, tender coconut malai, and green chillies, baked and smoked inside a carved green coconut shell."
    },
    {
      id: "dish-4",
      name: "Gondhoraj Bhetki Paturi",
      bengaliName: "গন্ধরাজ ভেটকি পাতুড়ি",
      category: "starters",
      price: 490,
      isFeatured: true,
      isVeg: false,
      spiceLevel: 2,
      badge: "Authentic Classic",
      image: "assets/images/bhetki_paturi.jpg",
      description: "Fresh water Kolkata Bhetki (barramundi) fillet coated in fragrant yellow mustard, grated coconut, virgin mustard oil, and Gondhoraj zest, enveloped in charred banana leaves."
    },
    {
      id: "dish-5",
      name: "Caramelized Baked Mishti Doi & Rosogolla",
      bengaliName: "বেকড মিষ্টি দই ও জাফরান রসগোল্লা",
      category: "desserts",
      price: 240,
      isFeatured: true,
      isVeg: true,
      spiceLevel: 0,
      badge: "Sweet Indulgence",
      image: "assets/images/mishti_doi.jpg",
      description: "Velvety fermented sweet date-palm jaggery yogurt baked to a golden crust in artisanal terracotta matkas, paired with saffron-steeped warm cottage cheese dumplings and roasted pistachios."
    },
    {
      id: "dish-6",
      name: "Gondhoraj Royal Botanical Fizz",
      bengaliName: "গন্ধরাজ বোটানিক্যাল ফিজ",
      category: "cocktails",
      price: 280,
      isFeatured: true,
      isVeg: true,
      spiceLevel: 0,
      badge: "Artisanal Craft",
      image: "assets/images/gondhoraj_cocktail.jpg",
      description: "A celebrated signature refresher with crushed wild mint, aromatic Kolkata Gondhoraj king lime nectar, star anise mist, Himalayan pink salt, and chilled effervescent soda."
    },
    {
      id: "dish-7",
      name: "Park Street Sizzling Chelo Kebab",
      bengaliName: "পার্ক স্ট্রিট চেলো কাবাব",
      category: "starters",
      price: 540,
      isFeatured: false,
      isVeg: false,
      spiceLevel: 2,
      badge: "Colonial Legacy",
      image: "assets/images/restaurant_interior.jpg",
      description: "Charcoal grilled Persian-Kolkata minced mutton seekh and chicken boti skewers, served over fragrant butter-tossed steamed basmati rice with a grilled plum tomato and poached egg yolk."
    },
    {
      id: "dish-8",
      name: "Chhanar Dalna (Artisanal Cottage Cheese Dumplings)",
      bengaliName: "ঘিয়ে ভাজা ছানার ডালনা",
      category: "mains",
      price: 380,
      isFeatured: false,
      isVeg: true,
      spiceLevel: 1,
      badge: "Pure Vegetarian",
      image: "assets/images/daab_chingri.jpg",
      description: "Hand-kneaded fresh chena dumplings stuffed with raisins, fried in pure desi ghee and simmered in a fragrant cumin, ginger, and green cardamom gravy."
    },
    {
      id: "dish-9",
      name: "Nolen Gurer Artisanal Ice Cream",
      bengaliName: "নলেন গুড়ের আইসক্রিম",
      category: "desserts",
      price: 210,
      isFeatured: false,
      isVeg: true,
      spiceLevel: 0,
      badge: "Seasonal Pride",
      image: "assets/images/mishti_doi.jpg",
      description: "Slow-churned dairy ice cream infused with winter liquid date palm jaggery (Jhola Gur) straight from the date palms of rural Bengal."
    }
  ],
  testimonials: [
    {
      id: "t1",
      name: "Anirban Mukherjee",
      role: "Kolkata Heritage Food Critic",
      rating: 5,
      review: "The Kolkata Biryani here is transcendent—the potato has soaked in all the rich meat stock and saffron aroma just like the royal Awadhi kitchens intended. A rare culinary gem on Park Street.",
      verified: true
    },
    {
      id: "t2",
      name: "Pooja & Rohan Sen",
      role: "Regular Patrons, South Kolkata",
      rating: 5,
      review: "The Kosha Mangsho and Luchis transported us straight back to our grandmother’s Sunday lunches, but elevated with five-star finesse and the warmest hospitality.",
      verified: true
    },
    {
      id: "t3",
      name: "Devina Roy",
      role: "Gastronomy Blogger",
      rating: 5,
      review: "Daab Chingri served inside real green coconut with that delicate coconut-mustard cream is worth visiting Kolkata for. The Gondhoraj Botanical Fizz is unmatched!",
      verified: true
    }
  ]
};
