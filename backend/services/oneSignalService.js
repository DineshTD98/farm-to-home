const https = require('https');

/**
 * Send dual notifications (Push + SMS) via OneSignal REST API
 * @param {string[]} userIds - Array of user MongoDB IDs (external_id in OneSignal)
 * @param {string} title - Notification title (used for Push)
 * @param {string} message - Notification content (used for both Push and SMS)
 * @param {object} data - Optional data payload
 */
const sendPushNotification = (userIds, title, message, data = {}) => {
    if (!process.env.ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
        console.warn('[OneSignal Service] Missing OneSignal App ID or REST API Key. Notification skipped.');
        return;
    }

    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;
    const smsFrom = process.env.ONESIGNAL_SMS_FROM;

    // Helper to send a single request
    const sendToChannel = (channel, extraPayload = {}) => {
        const payload = {
            app_id: appId,
            include_aliases: {
                external_id: userIds
            },
            target_channel: channel,
            contents: { en: message },
            ...extraPayload
        };

        if (channel === 'push') {
            payload.headings = { en: title };
            payload.data = data;
        }

        const postData = JSON.stringify(payload);

        const options = {
            hostname: 'api.onesignal.com',
            port: 443,
            path: '/notifications',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Key ${apiKey}`,
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                console.log(`[OneSignal Service] ${channel.toUpperCase()} Response (${res.statusCode}):`, responseData);
            });
        });

        req.on('error', (e) => {
            console.error(`[OneSignal Service] ${channel.toUpperCase()} Error:`, e.message);
        });

        req.write(postData);
        req.end();
    };

    // Send Push Notification
    sendToChannel('push');

    // Send Real SMS if SMS number is configured
    if (smsFrom) {
        sendToChannel('sms', { sms_from: smsFrom });
    }
};

module.exports = { sendPushNotification };
