const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const taPath = path.join(__dirname, 'src', 'i18n', 'ta.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const taData = JSON.parse(fs.readFileSync(taPath, 'utf8'));

enData.checkout.codSelected = "Cash on Delivery Selected";
enData.checkout.codPayInCash = "Pay ₹{{total}} in cash when your order arrives at your door";
enData.checkout.codTip1 = "✅ No online payment needed";
enData.checkout.codTip2 = "✅ Keep exact change ready";
enData.checkout.codTip3 = "✅ Order confirmed immediately";
enData.checkout.payViaUpi = "Pay via UPI";
enData.checkout.enterUpiIdOrApp = "Enter your UPI ID or choose an app";
enData.checkout.secure = "Secure";
enData.checkout.orEnterUpiId = "or enter UPI ID";
enData.checkout.upiIdLabel = "UPI ID";
enData.checkout.upiPlaceholder = "e.g. yourname@upi";

taData.checkout.codSelected = "பணம் செலுத்தும் முறை தேர்ந்தெடுக்கப்பட்டது";
taData.checkout.codPayInCash = "உங்கள் ஆர்டர் உங்கள் வீட்டு வாசலில் வரும்போது பணமாக ரூ {{total}} செலுத்தவும்";
taData.checkout.codTip1 = "✅ ஆன்லைன் கட்டணம் தேவையில்லை";
taData.checkout.codTip2 = "✅ சரியான மாற்று பணத்தை தயாராக வைத்திருக்கவும்";
taData.checkout.codTip3 = "✅ ஆர்டர் உடனடியாக உறுதிப்படுத்தப்படுகிறது";
taData.checkout.payViaUpi = "UPI மூலம் செலுத்தவும்";
taData.checkout.enterUpiIdOrApp = "உங்கள் UPI ஐடியை உள்ளிடவும் அல்லது பயன்பாட்டைத் தேர்வு செய்யவும்";
taData.checkout.secure = "பாதுகாப்பானது";
taData.checkout.orEnterUpiId = "அல்லது UPI ஐடியை உள்ளிடவும்";
taData.checkout.upiIdLabel = "UPI ஐடி";
taData.checkout.upiPlaceholder = "உதாரணம்: yourname@upi";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(taPath, JSON.stringify(taData, null, 2));
console.log('Done appending checkout strings');
