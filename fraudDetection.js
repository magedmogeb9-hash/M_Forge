function detectFraud(order) {
    if (order.qty > 100 || order.total > 10000) {
        return true;
    }
    return false;
}

module.exports = { detectFraud };
