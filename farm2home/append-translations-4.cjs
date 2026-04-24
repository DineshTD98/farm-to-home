const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const taPath = path.join(__dirname, 'src', 'i18n', 'ta.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const taData = JSON.parse(fs.readFileSync(taPath, 'utf8'));

enData.checkout.promoTitle = "Voucher / Promo Code";
enData.checkout.promoPlaceholder = "Enter discount code";
enData.checkout.promoApply = "APPLY";
enData.checkout.promoInvalid = "Invalid or expired code.";
enData.checkout.promoApplied = "Discount applied successfully!";
enData.checkout.discount = "Discount";

taData.checkout.promoTitle = "தள்ளுபடி குறியீடு";
taData.checkout.promoPlaceholder = "தள்ளுபடி குறியீட்டை உள்ளிடவும்";
taData.checkout.promoApply = "விண்ணப்பிக்கவும்";
taData.checkout.promoInvalid = "தவறான அல்லது காலாவதியான குறியீடு.";
taData.checkout.promoApplied = "தள்ளுபடி வெற்றிகரமாகப் பயன்படுத்தப்பட்டது!";
taData.checkout.discount = "தள்ளுபடி";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(taPath, JSON.stringify(taData, null, 2));
console.log('Promo translation strings added.');
