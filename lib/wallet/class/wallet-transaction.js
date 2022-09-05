class WalletTransaction {
  constructor(obj = {}) {
    this.id = obj.id;
    this.walletId = obj.walletId;
    this.transactionRequestId = obj.transactionRequestId;
    this.amountChange = obj.amountChange;
    this.message = obj.message;
    this.transactionRequestStartedAt = obj.transactionRequestStartedAt;
  }
}

module.exports = WalletTransaction;
