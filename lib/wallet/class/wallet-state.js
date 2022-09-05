class WalletState {
  constructor(obj = {}) {
    this.id = obj.id;
    this.userId = obj.userId;
    this.amount = obj.amount || 0;
    this.lastTransactionRequestId = obj.lastTransactionRequestId;

    this.stateChange = {};
  }

  deposit(transactionRequestId, amount) {
    this.stateChange = {
      ...this.stateChange,
      amount: (this.stateChange.amount || 0) + amount,
      lastTransactionRequestId: transactionRequestId,
    };
  }

  withdraw(transactionRequestId, amount) {
    this.stateChange = {
      ...this.stateChange,
      amount: (this.stateChange.amount || 0) - amount,
      lastTransactionRequestId: transactionRequestId,
    };
  }

  transferTo(transactionRequestId, amount) {
    this.stateChange = {
      ...this.stateChange,
      amount: (this.stateChange.amount || 0) - amount,
      lastTransactionRequestId: transactionRequestId,
    };
  }

  receiveTransfer(transactionRequestId, amount) {
    this.stateChange = {
      ...this.stateChange,
      amount: (this.stateChange.amount || 0) + amount,
      lastTransactionRequestId: transactionRequestId,
    };
  }

  get newStateToCommit() {
    return Object.entries(this.stateChange).reduce((acc, [key, value]) => {
      if (key === 'amount') { acc[key] = this.amount + value; }
      if (key === 'lastTransactionRequestId') {
        acc[key] = value;
      }

      return acc;
    }, {});
  }

  commit() {
    Object.assign(this, this.newStateToCommit);

    this.stateChange = {};
  }
}

module.exports = WalletState;
