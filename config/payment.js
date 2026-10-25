module.exports = {
    currency: process.env.CURRENCY || "INR",
    appName: process.env.APP_NAME || "Wanderlust",
    themeColor: process.env.THEME_COLOR || "fe424d",
    texRatePercent: Number(process.env.TAX_RATE_PERCENT) || 18,
    KeyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
};