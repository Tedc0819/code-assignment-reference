const winston = require('winston');
const WalletService = require('./wallet.service');
const WalletRepository = require('./wallet.repository');
const EntityRepository = require('./entity.repository');
const config = require('./config');

// WalletModule
module.exports = {
  create(walletTransactionRepo, transactionRequestRepo, walletStateRepo) {
    const logger = winston.createLogger(config.logger);

    const walletTransactionRepository = walletTransactionRepo || new EntityRepository();
    const transactionRequestRepository = transactionRequestRepo || new EntityRepository();
    const walletStateRepository = walletStateRepo || new EntityRepository();

    const repository = new WalletRepository(
      logger,
      walletTransactionRepository,
      transactionRequestRepository,
      walletStateRepository,
    );

    const walletService = new WalletService(logger, repository);

    return {
      walletService,
      walletTransactionRepository,
      transactionRequestRepository,
      walletStateRepository,
    };
  },
};
