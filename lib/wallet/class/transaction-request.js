const TRANSACTION_REQUEST_SOURCE_TYPE = {
  USER: 'USER',
  WALLET: 'WALLET',
};

const TRANSACTION_REQUEST_TYPE = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAW: 'WITHDRAW',
  TRANSFER: 'TRANSFER',
};

const TRANSACTION_REQUEST_STATUS = {
  UNKNOWN: 'UNKNOWN',
  STARTED: 'STARTED',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

class TransactionRequest {
  constructor(obj = {}) {
    // TODO: validate
    this.id = obj.id;
    this.sourceType = obj.sourceType;
    this.sourceId = obj.sourceId;
    this.type = obj.type;
    this.destinationId = obj.destinationId;
    this.destinationType = obj.destinationType;
    this.typeMeta = obj.typeMeta;
    this.ref = obj.ref;

    this.status = obj.status;
    this.startedAt = obj.startedAt;
    this.succeededAt = obj.succeededAt;
    this.failedAt = obj.failedAt;
  }

  deriveStatus() {
    this.status = TRANSACTION_REQUEST_STATUS.UNKNOWN;

    if (this.startedAt) { this.status = TRANSACTION_REQUEST_STATUS.STARTED; }
    if (this.failedAt) { this.status = TRANSACTION_REQUEST_STATUS.FAILURE; }
    if (this.succeededAt) { this.status = TRANSACTION_REQUEST_STATUS.SUCCESS; }
  }

  init() {
    this.startedAt = Date.now();
    this.deriveStatus();
  }

  succeed() {
    this.succeededAt = Date.now();
    this.deriveStatus();
  }

  fail() {
    this.failedAt = Date.now();
    this.deriveStatus();
  }

  static newForDeposit(userId, walletId, amount, ref) {
    return new this({
      ref,
      sourceType: TRANSACTION_REQUEST_SOURCE_TYPE.USER,
      sourceId: userId,
      type: TRANSACTION_REQUEST_TYPE.DEPOSIT,
      destinationId: walletId,
      destinationType: TRANSACTION_REQUEST_SOURCE_TYPE.WALLET,
      typeMeta: {
        amount,
      },
    });
  }

  static newForWithdraw(userId, walletId, amount, ref) {
    return new this({
      ref,
      sourceType: TRANSACTION_REQUEST_SOURCE_TYPE.USER,
      sourceId: userId,
      type: TRANSACTION_REQUEST_TYPE.WITHDRAW,
      destinationId: walletId,
      destinationType: TRANSACTION_REQUEST_SOURCE_TYPE.WALLET,
      typeMeta: {
        amount,
      },
    });
  }

  static newForTransfer(walletId, destinationWalletId, amount, ref) {
    return new this({
      ref,
      sourceType: TRANSACTION_REQUEST_SOURCE_TYPE.WALLET,
      sourceId: walletId,
      type: TRANSACTION_REQUEST_TYPE.TRANSFER,
      destinationId: destinationWalletId,
      destinationType: TRANSACTION_REQUEST_SOURCE_TYPE.WALLET,
      typeMeta: {
        amount,
      },
    });
  }
}

TransactionRequest.TRANSACTION_REQUEST_SOURCE_TYPE = TRANSACTION_REQUEST_SOURCE_TYPE;
TransactionRequest.TRANSACTION_REQUEST_TYPE = TRANSACTION_REQUEST_TYPE;
TransactionRequest.TRANSACTION_REQUEST_STATUS = TRANSACTION_REQUEST_STATUS;

module.exports = TransactionRequest;
