function calculateProfitSharing(total) {
    const platformShare = total * 0.3; // 30% للمنصة
    const storeShare = total * 0.7;    // 70% للمتجر
    return { platformShare, storeShare };
}

module.exports = { calculateProfitSharing };
