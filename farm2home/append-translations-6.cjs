const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const taPath = path.join(__dirname, 'src', 'i18n', 'ta.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const taData = JSON.parse(fs.readFileSync(taPath, 'utf8'));

enData.orderSuccess = {
  title: "Success!",
  desc: "Hooray! Your request has been transmitted directly to the farm. Your produce is currently being prepared for its fresh journey to your doorstep.",
  viewDashboard: "VIEW DASHBOARD",
  continue: "CONTINUE SHOPPING"
};

enData.browse = {
  title: "Browse Produce",
  subtitle: "Farm Fresh Supply",
  categories: "Categories",
  all: "All",
  vegetables: "Vegetables",
  fruits: "Fruits",
  grains: "Grains",
  searchRadius: "Search Radius",
  within: "Within",
  locating: "Locating you...",
  useMap: "Use Map",
  pincode: "Or enter Pincode",
  noProduce: "No produce found. Try expanding your search radius!",
  available: "Available",
  per: "Per",
  getNotified: "Get Notified",
  subscribed: "Subscribed",
  quickAdd: "QUICK ADD",
  selectQty: "Select Quantity",
  totalInfo: "Total",
  addedAlert: "Added to cart!"
};

taData.orderSuccess = {
  title: "வெற்றி!",
  desc: "உங்கள் ஆர்டர் பண்ணைக்கு நேரடியாக அனுப்பப்பட்டுள்ளது. உங்கள் விளைபொருட்கள் உங்கள் வீட்டு வாசலுக்கு புதியதாக தயாராகிறது.",
  viewDashboard: "டாஷ்போர்டைக் காண்க",
  continue: "தொடர்ந்து வாங்கவும்"
};

taData.browse = {
  title: "தயாரிப்புகளை உலாவுக",
  subtitle: "பண்ணையின் புதிய விநியோகம்",
  categories: "வகைகள்",
  all: "அனைத்தும்",
  vegetables: "காய்கறிகள்",
  fruits: "பழங்கள்",
  grains: "தானியங்கள்",
  searchRadius: "தேடல் ஆரம்",
  within: "உள்ளே",
  locating: "உங்களை கண்டறிகிறது...",
  useMap: "வரைபடத்தைப் பயன்படுத்தவும்",
  pincode: "அல்லது அஞ்சல் குறியீட்டை உள்ளிடவும்",
  noProduce: "உற்பத்தி காணப்ப‌டவில்லை. உங்கள் தேடல் ஆரத்தை விரிக்கவும்!",
  available: "கிடைக்கும்",
  per: "ஒரு",
  getNotified: "அறிவிப்பைப் பெறவும்",
  subscribed: "குழுசேரப்பட்டது",
  quickAdd: "விரைவில் சேர்",
  selectQty: "அளவை தேர்ந்தெடுக்கவும்",
  totalInfo: "மொத்தம்",
  addedAlert: "கூடையில் சேர்க்கப்பட்டது!"
};

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(taPath, JSON.stringify(taData, null, 2));
console.log('Final missing translation strings added.');
