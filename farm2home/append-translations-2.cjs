const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'src', 'i18n', 'en.json');
const taPath = path.join(__dirname, 'src', 'i18n', 'ta.json');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const taData = JSON.parse(fs.readFileSync(taPath, 'utf8'));

// New strings for EN
enData.buyerReviews = {
  "pageTitle": "Voucher & Feedback",
  "pageSubtitle": "Rate Your Direct-From-Farm Experience",
  "syncing": "Syncing Farmer Directory...",
  "noInteractions": "No interactions yet",
  "noInteractionsDesc": "You haven't established direct connections with any farmers. Complete an order to leave feedback.",
  "exploreProduce": "Explore Local Produce →",
  "verifiedProducer": "Verified Producer",
  "updateFeedback": "✏️ Update Feedback",
  "endorseProducer": "⭐ Endorse Producer"
};

enData.notifications.subtitle = "Your alerts and updates";
enData.notifications.emptyTitle = "All caught up!";
enData.notifications.emptyDesc = "No new notifications.";
enData.notifications.markRead = "Mark as Read";
enData.notifications.stockUpdate = "Stock Update";
enData.notifications.noNotifications = "You have no unread encrypted transmissions";
enData.notifications.exploreMarketplace = "Return to Marketplace →";
enData.notifications.pageTitle = "Message Center";
enData.notifications.pageSubtitle = "Encrypted Communication Protocols";
enData.notifications.syncing = "Syncing Transmissions...";
enData.notifications.allClear = "All Clear";

// New strings for TA
taData.buyerReviews = {
  "pageTitle": "மதிப்புரைகள்",
  "pageSubtitle": "விவசாயிகளின் அனுபவத்தை மதிப்பிடவும்",
  "syncing": "விவசாயி தரவுகளை ஒத்திசைக்கிறது...",
  "noInteractions": "தொடர்புகள் ஏதுமில்லை",
  "noInteractionsDesc": "நீங்கள் எந்த விவசாயியுடனும் இன்னும் தொடர்பு கொள்ளவில்லை. மதிப்பாய்வு எழுத ஒரு ஆர்டரை நிறைவு செய்யுங்கள்.",
  "exploreProduce": "உள்ளூர் தயாரிப்புகளை ஆராயுங்கள் →",
  "verifiedProducer": "சரிபார்க்கப்பட்ட விவசாயி",
  "updateFeedback": "✏️ மதிப்பாய்வை புதுப்பி",
  "endorseProducer": "⭐ விவசாயியை ஆதரிக்கவும்"
};

taData.notifications.subtitle = "உங்கள் விழிப்பூட்டல்கள்";
taData.notifications.emptyTitle = "அனைத்தும் படிக்கப்பட்டது!";
taData.notifications.emptyDesc = "புதிய அறிவிப்புகள் இல்லை.";
taData.notifications.markRead = "படித்ததாக குறிக்கவும்";
taData.notifications.stockUpdate = "பங்கு புதுப்பிப்பு";
taData.notifications.noNotifications = "படிக்காத செய்திகள் உங்களிடம் இல்லை";
taData.notifications.exploreMarketplace = "சந்தைக்குத் திரும்பு →";
taData.notifications.pageTitle = "செய்தி மையம்";
taData.notifications.pageSubtitle = "மறைகுறியாக்கப்பட்ட தொடர்புகள்";
taData.notifications.syncing = "செய்திகளை ஒத்திசைக்கிறது...";
taData.notifications.allClear = "அனைத்தும் சரி";

fs.writeFileSync(enPath, JSON.stringify(enData, null, 2));
fs.writeFileSync(taPath, JSON.stringify(taData, null, 2));
console.log('Extra Translations appended successfully!');
