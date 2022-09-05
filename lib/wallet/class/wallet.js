const WalletTransaction = require('./wallet-transaction');

class WalletAmountLessThanZeroError extends Error {}

class Wallet {
  constructor(walletState, walletTransactions = []) {
    this.walletState = walletState;
    this.walletTransactions = walletTransactions;
    this.newWalletTransactions = [];
  }

  get id() {
    return this.walletState.id;
  }

  processDepositTransactionRequest(transactionRequest) {
    const amountChange = transactionRequest.typeMeta.amount;

    const walletTransaction = new WalletTransaction({
      amountChange,
      walletId: transactionRequest.destinationId,
      transactionRequestId: transactionRequest.id,
      transactionRequestStartedAt: transactionRequest.startedAt,
      message: `DEPOSIT ${amountChange}`,
    });

    this.newWalletTransactions.push(walletTransaction);

    this.walletState.deposit(transactionRequest.id, amountChange);

    return this;
  }

  processWithdrawTransactionRequest(transactionRequest) {
    const amountChange = transactionRequest.typeMeta.amount;

    if (this.walletState.amount - amountChange < 0) {
      throw new WalletAmountLessThanZeroError('Wallet amount is less than 0');
    }

    const walletTransaction = new WalletTransaction({
      amountChange: -1 * amountChange,
      walletId: transactionRequest.destinationId,
      transactionRequestId: transactionRequest.id,
      transactionRequestStartedAt: transactionRequest.startedAt,
      message: `WITHDRAW ${amountChange}`,
    });

    this.newWalletTransactions.push(walletTransaction);

    this.walletState.withdraw(transactionRequest.id, amountChange);

    return this;
  }

  processTransferTransactionRequest(transactionRequest) {
    const amountChange = transactionRequest.typeMeta.amount;

    // A , B logic
    let walletTransaction;
    if (this.id === transactionRequest.sourceId) {
      if (this.walletState.amount - amountChange < 0) {
        throw new WalletAmountLessThanZeroError('Wallet amount is less than 0');
      }

      walletTransaction = new WalletTransaction({
        amountChange: amountChange * -1,
        walletId: transactionRequest.sourceId,
        transactionRequestId: transactionRequest.id,
        transactionRequestStartedAt: transactionRequest.startedAt,
        message: `TRANSFER ${amountChange} TO ${transactionRequest.destinationId}`,
      });

      this.newWalletTransactions.push(walletTransaction);

      this.walletState.transferTo(transactionRequest.id, amountChange);
    }

    if (this.id === transactionRequest.destinationId) {
      walletTransaction = new WalletTransaction({
        amountChange,
        walletId: transactionRequest.destinationId,
        transactionRequestId: transactionRequest.id,
        transactionRequestStartedAt: transactionRequest.startedAt,
        message: `RECEIVE TRANSFER ${amountChange} FROM ${transactionRequest.sourceId}`,
      });

      this.newWalletTransactions.push(walletTransaction);

      this.walletState.receiveTransfer(transactionRequest.id, amountChange);
    }

    return this;
  }

  commit() {
    this.walletTransactions = [
      ...this.newWalletTransactions,
      ...this.walletTransactions,
    ].sort((a, b) => (a.startedAt < b.startedAt ? -1 : 1));

    this.walletState.commit();

    this.newWalletTransactions = [];

    return this;
  }
}

module.exports = Wallet;
