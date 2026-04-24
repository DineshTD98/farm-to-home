const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const taPath = path.join(__dirname, 'src', 'i18n', 'ta.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const taData = JSON.parse(fs.readFileSync(taPath, 'utf8'));

enData.checkout.card = "Credit/Debit Card";
enData.checkout.cardSecure = "Bank level security";
enData.checkout.cardNumber = "Card Number";
enData.checkout.cardName = "Cardholder Name";
enData.checkout.cardExpiry = "Expiry Date";
enData.checkout.cardCvv = "CVV";

taData.checkout.card = "கிரெடிட்/டெபிட் கார்டு";
taData.checkout.cardSecure = "நிறுவன பாதுகாப்பு";
taData.checkout.cardNumber = "கார்டு எண்";
taData.checkout.cardName = "அட்டைதாரரின் பெயர்";
taData.checkout.cardExpiry = "காலாவதியாகும் தேதி";
taData.checkout.cardCvv = "CVV";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(taPath, JSON.stringify(taData, null, 2));
console.log('Card translation strings added.');
