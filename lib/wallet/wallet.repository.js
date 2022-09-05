const Wallet = require('./class/wallet');
const TransactionRequest = require('./class/transaction-request');
const WalletState = require('./class/wallet-state');
const WalletTransaction = require('./class/wallet-transaction');

const DEFAULT_GET_WALLET_TRANSACTION_LIMIT = 10;

class WalletRepositoryArgumentsInvalidError extends Error {}
class WalletRepositoryRecordNotFoundError extends Error {}

class WalletRepository {
  constructor(logger, walletTransactionRepo, transactionRequestRepo, walletStateRepo) {
    this.logger = logger.child({ scope: 'WalletRepository' });
    this.walletTransactionRepo = walletTransactionRepo;
    this.transactionRequestRepo = transactionRequestRepo;
    this.walletStateRepo = walletStateRepo;
  }

  async createWallet(context, userId) {
    let logger;
    try {
      logger = this.logger.child(context);

      if (!userId) {
        throw new WalletRepositoryArgumentsInvalidError('userId invalid');
      }

      const walletState = await this.walletStateRepo.create({
        userId,
      });

      logger.verbose(`DID createWallet for user ${userId}, Wallet id: ${walletState.id}`);

      const wallet = new Wallet(new WalletState(walletState));

      return wallet;
    } catch (e) {
      logger.error(`FAIL createWallet for user ${userId} - ${e.message}`);

      throw e;
    }
  }

  async initTransactionRequest(context, transactionRequest) {
    let logger;
    try {
      logger = this.logger.child(context);

      if (!transactionRequest) {
        throw new WalletRepositoryArgumentsInvalidError('transactionRequest invalid');
      }

      logger.verbose(`WILL initTransactionRequest ${transactionRequest.ref}`);

      transactionRequest.init();

      const obj = await this.transactionRequestRepo.create(transactionRequest);

      logger.verbose(`DID initTransactionRequest ${transactionRequest.ref}`);

      return new TransactionRequest(obj);
    } catch (e) {
      logger.error(`FAIL initTransactionRequest ${(transactionRequest || {}).ref} - ${e.message}`);

      throw e;
    }
  }

  async failTransactionRequest(context, transactionRequest) {
    let logger;
    try {
      logger = this.logger.child(context);

      if (!transactionRequest) {
        throw new WalletRepositoryArgumentsInvalidError('transactionRequest invalid');
      }

      logger.verbose(`WILL failTransactionRequest ${transactionRequest.ref}`);

      transactionRequest.fail();

      const obj = await this.transactionRequestRepo.updateOne({ id: transactionRequest.id }, transactionRequest);

      logger.verbose(`DID failTransactionRequest ${transactionRequest.ref}`);

      return new TransactionRequest(obj);
    } catch (e) {
      logger.error(`FAIL failTransactionRequest ${(transactionRequest || {}).ref} - ${e.message}`);

      throw e;
    }
  }

  async finishTransactionRequest(context, transactionRequest) {
    let logger;
    try {
      logger = this.logger.child(context);

      if (!transactionRequest) {
        throw new WalletRepositoryArgumentsInvalidError('transactionRequest invalid');
      }

      logger.verbose(`WILL initTransactionRequest ${transactionRequest.ref}`);

      transactionRequest.succeed();

      const obj = await this.transactionRequestRepo.updateOne({ id: transactionRequest.id }, transactionRequest);

      logger.verbose(`DID initTransactionRequest ${transactionRequest.ref}`);

      return new TransactionRequest(obj);
    } catch (e) {
      logger.error(`FAIL initTransactionRequest ${(transactionRequest || {}).ref} - ${e.message}`);

      throw e;
    }
  }

  async getWallet(context, walletId, recentTransactionSize = 0) {
    let logger;

    try {
      logger = this.logger.child(context);

      logger.verbose(`WILL get wallet with (${walletId})`);

      const walletState = await this.walletStateRepo.findOne({ id: walletId });

      if (!walletState) {
        throw new WalletRepositoryRecordNotFoundError('wallet state record not found');
      }

      let walletTransactions = [];
      if (recentTransactionSize) {
        walletTransactions = await this.walletTransactionRepo.find({ walletId }, null, { limit: recentTransactionSize, sort: { transactionRequestStartedAt: 'desc' } });

        walletTransactions = walletTransactions.map((t) => new WalletTransaction(t));

        walletTransactions.sort((a, b) => (a.transactionRequestStartedAt < b.transactionRequestStartedAt ? -1 : 1));
      }

      const wallet = new Wallet(new WalletState(walletState), walletTransactions);

      logger.verbose(`DID get wallet with (${walletId})`);

      return wallet;
    } catch (e) {
      logger.error(`FAIL get wallet with (${walletId}) - ${e.message}`);

      throw e;
    }
  }

  async commitWallet(context, wallet) {
    // TODO: will need to make sure it's a DB transaction (all-or-nothing)
    let logger;

    try {
      logger = this.logger.child(context);

      logger.verbose(`WILL commit wallet (${wallet.id})`);

      const promises = wallet.newWalletTransactions.map(async (walletTransaction) => this.walletTransactionRepo.create(walletTransaction));

      promises.push(this.commitWalletState(wallet.walletState));

      // TODO: may need to reconsider if it should be parallel or not
      // TODO: risk in failure case handling.
      await Promise.all(promises);

      const newWallet = await this.getWallet(context, wallet.id, DEFAULT_GET_WALLET_TRANSACTION_LIMIT);

      logger.verbose(`DID commit wallet (${wallet.id})`);

      return newWallet;
    } catch (e) {
      logger.verbose(`FAIL commit wallet (${wallet.id}) - ${e.message}`);

      throw e;
    }
  }

  async commitWalletState(walletState) {
    // WARN: to ensure we apply the change to the newest state of the wallet. Otherwise the staled data will create bug
    let obj = await this.walletStateRepo.findOne({ id: walletState.id });
    let newestWalletState = new WalletState(obj);

    newestWalletState.stateChange = walletState.stateChange;

    obj = await this.walletStateRepo.updateOne({ id: walletState.id }, newestWalletState.newStateToCommit);
    newestWalletState = new WalletState(obj);

    return newestWalletState.commit();
  }
}

module.exports = WalletRepository;
