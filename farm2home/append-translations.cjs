const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const taPath = path.join(__dirname, 'src', 'i18n', 'ta.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const taData = JSON.parse(fs.readFileSync(taPath, 'utf8'));

// New strings for EN
enData.buyerOrders = {
  "pageTitle": "Order Tracking",
  "pageSubtitle": "Monitor Delivery",
  "syncHistory": "🔄 SYNC HISTORY",
  "syncing": "Syncing Encrypted Logs...",
  "syncError": "Sync Error",
  "inProgress": "In Progress",
  "shipments": "SHIPMENTS",
  "noActive": "No active shipments in transit",
  "exploreMarketplace": "Explore Marketplace →",
  "pastPurchases": "Past Purchases",
  "records": "RECORDS",
  "historyEmpty": "Your historical records are empty",
  "orderDetails": "Order Details",
  "deliveryDest": "Delivery Destination"
};

// New strings for TA
taData.buyerOrders = {
  "pageTitle": "ஆர்டர் கண்காணிப்பு",
  "pageSubtitle": "டெலிவரியை கண்காணிக்கவும்",
  "syncHistory": "🔄 வரலாற்றை ஒத்திசை",
  "syncing": "பதிவுகளை ஒத்திசைக்கிறது...",
  "syncError": "ஒத்திசைவு பிழை",
  "inProgress": "செயல்பாட்டில் உள்ளது",
  "shipments": "ஏற்றுமதிகள்",
  "noActive": "தற்போது ஏற்றுமதிகள் ஏதுமில்லை",
  "exploreMarketplace": "சந்தையை ஆராயுங்கள் →",
  "pastPurchases": "கடந்த கால கொள்முதல்",
  "records": "பதிவுகள்",
  "historyEmpty": "உங்கள் வரலாற்று பதிவுகள் காலியாக உள்ளன",
  "orderDetails": "ஆர்டர் விவரங்கள்",
  "deliveryDest": "டெலிவரி இலக்கு"
};

// New Strings for Add/Edit Product & Lists
enData.farmerCrops = {
  "addProduct": "Publish Harvest",
  "addSubtitle": "Digital Catalog Listing",
  "editProduct": "Update Product Details",
  "editSubtitle": "Inventory Management",
  "form": {
    "productName": "Crop Identity / Category Name",
    "desc": "Botanical Details & Growth Narrative",
    "price": "Base Wholesale Value (₹ per unit)",
    "quantity": "Current Available Volume",
    "category": "Classification / Crop Family",
    "unit": "Measurement Metric",
    "photo": "Harvest Photograph",
    "uploadHint": "\"Authentic photography drives immediate buyer trust in the ecosystem.\""
  },
  "buttons": {
    "cancel": "Cancel Entry",
    "publish": "PUBLISH TO MARKETPLACE",
    "update": "UPDATE LISTING"
  }
};

taData.farmerCrops = {
  "addProduct": "அறுவடையை வெளியிடு",
  "addSubtitle": "டிஜிட்டல் பட்டியல்",
  "editProduct": "தயாரிப்பு விவரங்களை புதுப்பிக்கவும்",
  "editSubtitle": "சரக்கு நிர்வாகம்",
  "form": {
    "productName": "பயிர் அடையாளம் / பெயர்",
    "desc": "விவரங்கள்",
    "price": "அடிப்படை விலை (₹ ஒரு அலகுக்கு)",
    "quantity": "தற்போதைய கிடைக்கும் அளவு",
    "category": "வகை / பயிர் குடும்பம்",
    "unit": "அளவீட்டு மெட்ரிக்",
    "photo": "அறுவடை புகைப்படம்",
    "uploadHint": "\"உண்மையான புகைப்படம் வாங்குபவர் நம்பிக்கையை அதிகரிக்கும்.\""
  },
  "buttons": {
    "cancel": "ரத்து செய்",
    "publish": "சந்தையில் வெளியிடு",
    "update": "பட்டியலை புதுப்பி"
  }
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(taPath, JSON.stringify(taData, null, 2));
console.log('Translations appended successfully!');
