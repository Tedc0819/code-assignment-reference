const WalletModule = require('../index.js');

describe('Wallet Module - use case - createWallet ', () => {
  let module;
  const userId = 'userId';

  beforeEach(() => {
    module = WalletModule.create();
  });

  describe('When user create a wallet', () => {
    beforeEach(async () => {
      const { walletService } = module;

		  wallet = await walletService.createWallet(null, userId);
    });

    it('should return a wallet', () => {
      expect(wallet.walletState).toEqual(expect.objectContaining({
        userId: 'userId',
        id: expect.stringContaining(''),
      }));
      expect(wallet.walletTransactions).toEqual([]);
    });

    it('should create a WalletState record for user', () => {
      const { walletStateRepository } = module;

      expect(walletStateRepository.entities).toHaveLength(1);
    });
  });
});
