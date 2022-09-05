const WalletModule = require('../index.js');

describe('Wallet Module - use case - deposit ', () => {
  let module;
  const userId = 'userId';
  let wallet;
	let ref;

  beforeEach(async () => {
    module = WalletModule.create();

    const { walletService } = module;
    wallet = await walletService.createWallet(null, userId, ref);
  });

  describe('Given User deposit 50 dollars', () => {
    const amount = 50;
    beforeEach(async () => {
		  const { walletService } = module;

      await walletService.deposit({ traceId: 'traceId' }, userId, wallet.id, amount);
    });

    it('should have a correct state in wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, userId, wallet.id);

      expect(newWallet.walletState.amount).toEqual(amount);
    });

    it('should have a correct transactions in wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, userId, wallet.id);

      expect(newWallet.walletTransactions).toEqual([
        {
          walletId: wallet.id,
          transactionRequestId: expect.stringContaining(''),
          amountChange: 50,
          message: 'DEPOSIT 50',
          transactionRequestStartedAt: expect.anything(),
          id: expect.stringContaining(''),
        },
      ]);
    });

		it('should create related TransactionRequest', async () => {
		  const { transactionRequestRepository } = module;

			expect(transactionRequestRepository.entities).toEqual([
        {
          "destinationId": wallet.id, 
          "destinationType": "WALLET",
          "failedAt": undefined,
          "id": expect.anything(),
          "ref": ref,
          "sourceId": userId,
          "sourceType": "USER",
          "startedAt": expect.anything(),
          "status": "SUCCESS",
          "succeededAt": expect.anything(),
          "type": "DEPOSIT",
          "typeMeta": {
            "amount": 50,
          },
        },
			]);
		});
  });
});
