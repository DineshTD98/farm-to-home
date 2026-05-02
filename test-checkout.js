const puppeteer = require('puppeteer');
(async () => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
        
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle0' });
        await page.type('input[type="email"]', 'buyer@example.com');
        await page.type('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Add to cart
        await page.goto('http://localhost:5173/buyer/browse', { waitUntil: 'networkidle0' });
        await page.waitForTimeout(2000);
        // Assuming there's an add to cart button
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const addBtn = btns.find(b => b.textContent.includes('View Harvest') || b.textContent.includes('Cart'));
            if(addBtn) addBtn.click();
        });
        await page.waitForTimeout(2000);
        
        // Let's just create a dummy order payload and test Razorpay init directly in the page console!
        await page.evaluate(async () => {
             const options = {
                "key": "rzp_test_SgXTib4ZEQmULX",
                "amount": "50000",
                "currency": "INR",
                "name": "Test",
                "order_id": "order_Sk2Hyy7gvAokwW",
                "prefill": {
                    "contact": "9999999999",
                    "email": "test@test.com",
                    "method": "upi",
                    "vpa": "success@razorpay"
                },
                "handler": function (response){ console.log("SUCCESS", response); }
             };
             try {
                var rzp1 = new window.Razorpay(options);
                rzp1.on('payment.failed', function (response){
                    console.error("PAYMENT FAILED EVENT", response.error);
                });
                rzp1.open();
                console.log("RAZORPAY OPENED SUCCESSFULLY");
             } catch(e) {
                console.error("RAZORPAY INIT ERROR", e);
             }
        });
        
        await page.waitForTimeout(5000);
        await browser.close();
    } catch(err) {
        console.error("SCRIPT ERROR", err);
    }
})();
