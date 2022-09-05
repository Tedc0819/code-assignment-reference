const TransactionRequest = require('./class/transaction-request');

class WalletService {
  constructor(logger, walletRepository) {
    this.walletRepository = walletRepository;
    this.logger = logger.child({ scope: 'WalletService' });
  }

  async createWallet(context = {}, userId, ref) {
    let logger;

    try {
      logger = this.logger.child(context);

      logger.verbose(`[${ref}]WILL create wallet for user ${userId}`);

      const wallet = await this.walletRepository.createWallet(context, userId);

      logger.verbose(`[${ref}]DID create wallet for user ${userId} - wallet ${wallet.id}`);

      return wallet;
    } catch (e) {
      logger.error(`[${ref}]FAIL create wallet for user ${userId} - ${e.message}`);

      throw e;
    }
  }

  async deposit(context = {}, userId, walletId, amount, ref) {
    let logger;
    let transactionRequest;
    let wallet;

    try {
      logger = this.logger.child(context);

      logger.verbose(`[${ref}]WILL handle deposit to wallet ${walletId} for userId ${userId}`);

      const depositTransactionRequest = TransactionRequest.newForDeposit(userId, walletId, amount, ref);

      transactionRequest = await this.walletRepository.initTransactionRequest(context, depositTransactionRequest);

      wallet = await this.walletRepository.getWallet(context, walletId);

      wallet.processDepositTransactionRequest(transactionRequest);

      wallet = await this.walletRepository.commitWallet(context, wallet);

      transactionRequest = await this.walletRepository.finishTransactionRequest(context, transactionRequest);

      logger.verbose(`[${ref}]DID handle deposit to wallet ${walletId} for userId ${userId}`);
    } catch (error) {
      logger.error(`[${ref}]FAIL handle deposit to wallet ${walletId} for userId ${userId} - ${error.message}`);

      // TODO: may need to think about how to handle if transactionRequest doesn't exist
      if (transactionRequest) {
        await this.walletRepository.failTransactionRequest(context, transactionRequest, error);
      }

      throw error;
    }
  }

  async withdraw(context = {}, userId, walletId, amount, ref) {
    let logger;
    let transactionRequest;
    let wallet;

    try {
      logger = this.logger.child(context);

      logger.verbose(`[${ref}]WILL handle withdraw to wallet ${walletId} for userId ${userId}`);

      const withdrawTransactionRequest = TransactionRequest.newForWithdraw(userId, walletId, amount, ref);

      transactionRequest = await this.walletRepository.initTransactionRequest(context, withdrawTransactionRequest);

      wallet = await this.walletRepository.getWallet(context, walletId);

      wallet.processWithdrawTransactionRequest(transactionRequest);

      wallet = await this.walletRepository.commitWallet(context, wallet);

      transactionRequest = await this.walletRepository.finishTransactionRequest(context, transactionRequest);

      logger.verbose(`[${ref}]DID handle withdraw to wallet ${walletId} for userId ${userId}`);
    } catch (error) {
      logger.error(`[${ref}]FAIL handle withdraw to wallet ${walletId} for userId ${userId} - ${error.message}`);

      // TODO: may need to think about how to handle if transactionRequest doesn't exist
      if (transactionRequest) {
        await this.walletRepository.failTransactionRequest(context, transactionRequest, error);
      }

      throw error;
    }
  }

  async transfer(context, userId, walletId, destinationWalletId, amount, ref) {
    let logger;
    let transactionRequest;
    let wallet;
    let destinationWallet;

    try {
      logger = this.logger.child(context);

      logger.verbose(`[${ref}]WILL handle withdraw to wallet ${walletId} for userId ${userId}`);

      const transferTransactionRequest = TransactionRequest.newForTransfer(walletId, destinationWalletId, amount, ref);

      transactionRequest = await this.walletRepository.initTransactionRequest(context, transferTransactionRequest);

      wallet = await this.walletRepository.getWallet(context, walletId);
      destinationWallet = await this.walletRepository.getWallet(context, destinationWalletId);

      wallet.processTransferTransactionRequest(transactionRequest);
      destinationWallet.processTransferTransactionRequest(transactionRequest);

      // WARN: seem a bad design. hard to manage to make it within a transaction?
      wallet = await this.walletRepository.commitWallet(context, wallet);
      destinationWallet = await this.walletRepository.commitWallet(context, destinationWallet);

      transactionRequest = await this.walletRepository.finishTransactionRequest(context, transactionRequest);

      logger.verbose(`[${ref}]DID handle withdraw to wallet ${walletId} for userId ${userId}`);
    } catch (error) {
      logger.error(`[${ref}]FAIL handle withdraw to wallet ${walletId} for userId ${userId} - ${error.message}`);

      // TODO: may need to think about how to handle if transactionRequest doesn't exist
      if (transactionRequest) {
        await this.walletRepository.failTransactionRequest(context, transactionRequest, error);
      }

      throw error;
    }
  }

  async showWallet(context, userId, walletId, ref) {
    let logger;

    try {
      logger = this.logger.child(context);

      logger.verbose(`[${ref}]WILL show wallet for user ${userId} wallet ${walletId}`);

      const wallet = await this.walletRepository.getWallet(context, walletId, 20);

      logger.verbose(`[${ref}]DID show wallet for user ${userId} wallet ${walletId}`);

      return wallet;
    } catch (e) {
      logger.error(`[${ref}]FAIL show wallet for user ${userId} wallet ${walletId} - ${e.message}`);

      throw e;
    }
  }
}

module.exports = WalletService;
