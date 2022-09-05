const WalletModule = require('../index.js');

describe('Wallet Module Integration test', () => {
  let module;
  describe('create', () => {
    describe('Given no argument is passed as argument', () => {
      beforeEach(() => {
        module = WalletModule.create();
      });

      it('should return WalletService', () => {
        const { walletService } = module;

        expect(walletService.constructor.name).toEqual('WalletService');
      });

      it('should return WalletStateRepository', () => {
        const { walletStateRepository } = module;

        expect(walletStateRepository.constructor.name).toEqual('EntityRepository');
      });

      it('should return WalletTransactionRepository', () => {
        const { walletTransactionRepository } = module;

        expect(walletTransactionRepository.constructor.name).toEqual('EntityRepository');
      });

      it('should return TransactionRequestRepository', () => {
        const { transactionRequestRepository } = module;

        expect(transactionRequestRepository.constructor.name).toEqual('EntityRepository');
      });

      it('should inject correct dependency - WalletRepository', () => {
        const { walletService } = module;

        expect(walletService.walletRepository.constructor.name).toEqual('WalletRepository');
      });
    });
  });
});
