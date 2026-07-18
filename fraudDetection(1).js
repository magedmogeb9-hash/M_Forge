function detectFraud(order) {
    const maxQty = Number(process.env.FRAUD_MAX_QTY) || 100;
    const maxTotal = Number(process.env.FRAUD_MAX_TOTAL) || 10000;

    if (order.qty > maxQty || order.total > maxTotal) {
        return true;
    }
    return false;
}

module.exports = { detectFraud };
