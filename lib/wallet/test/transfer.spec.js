const WalletModule = require('../index.js');

describe('Wallet Module - use case - transfer ', () => {
  let module;
  const userId = 'userId';
  let wallet;
  let destinationWallet;
	let ref
  const destinationUserId = 'destinationUserId';

  beforeEach(async () => {
    module = WalletModule.create();

    const { walletService } = module;
    wallet = await walletService.createWallet(null, userId);
    destinationWallet = await walletService.createWallet(null, destinationUserId, ref);

    await walletService.deposit(null, userId, wallet.id, 50);
  });

  describe('Given UserA transfer 30 dollars to others (less than current amount)', () => {
    const amount = 30;
    beforeEach(async () => {
		  const { walletService } = module;

      await walletService.transfer(null, userId, wallet.id, destinationWallet.id, amount, ref);
    });

    it('should have a correct amount in UserA wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, userId, wallet.id);

      expect(newWallet.walletState.amount).toEqual(20);
    });

    it('should have a correct transactions in UserA wallet', async () => {
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
        {
          walletId: wallet.id,
          transactionRequestId: expect.stringContaining(''),
          amountChange: -30,
          message: `TRANSFER 30 TO ${destinationWallet.id}`,
          transactionRequestStartedAt: expect.anything(),
          id: expect.stringContaining(''),
        },
      ]);
    });

    it('should have a correct amount in UserB wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, destinationUserId, destinationWallet.id);

      expect(newWallet.walletState.amount).toEqual(30);
    });

    it('should have a correct transactions in UserB wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, destinationUserId, destinationWallet.id);

      expect(newWallet.walletTransactions).toEqual([
        {
          walletId: destinationWallet.id,
          transactionRequestId: expect.stringContaining(''),
          amountChange: 30,
          message: `RECEIVE TRANSFER 30 FROM ${wallet.id}`,
          transactionRequestStartedAt: expect.anything(),
          id: expect.stringContaining(''),
        },
      ]);
    });
		
    it('should create related TransactionRequest', async () => {
		  const { transactionRequestRepository } = module;

			expect(transactionRequestRepository.entities).toEqual([
        {
					"id": expect.stringContaining(''),
          "destinationType": "WALLET",
					"destinationId": wallet.id,
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
				{
					id: expect.stringContaining(''),
					sourceType: 'WALLET',
					sourceId: wallet.id,
					type: 'TRANSFER',
					destinationId: destinationWallet.id,
					destinationType: 'WALLET',
					typeMeta: { amount: 30 },
					ref,
					status: 'SUCCESS',
					startedAt: expect.anything(),
					succeededAt: expect.anything(),
					failedAt: undefined
				}
			]);
		});
  });

  describe('Given UserA transfer 70 dollars (more than current amount)', () => {
    const amount = 70;
    let error;
    beforeEach(async () => {
		  const { walletService } = module;

      try {
			  await walletService.transfer(null, userId, wallet.id, destinationWallet.id, amount);
      } catch (err) {
        error = err;
      }
    });

    it('should throw error', async () => {
      expect(error.constructor.name).toEqual('WalletAmountLessThanZeroError');
    });

    it('should have a correct amount in UserA wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, userId, wallet.id);

      expect(newWallet.walletState.amount).toEqual(50);
    });

    it('should have a correct transactions in UserA wallet', async () => {
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

    it('should have a correct amount in UserB wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, destinationUserId, destinationWallet.id);

      expect(newWallet.walletState.amount).toEqual(0);
    });

    it('should have a correct transactions in UserB wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, destinationUserId, destinationWallet.id);

      expect(newWallet.walletTransactions).toEqual([]);
    });

		it('should create related TransactionRequest', async () => {
		  const { transactionRequestRepository } = module;

			expect(transactionRequestRepository.entities).toEqual([
        {
					"id": expect.stringContaining(''),
          "destinationType": "WALLET",
					"destinationId": wallet.id,
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
				{
					id: expect.stringContaining(''),
					sourceType: 'WALLET',
					sourceId: wallet.id,
					type: 'TRANSFER',
					destinationId: destinationWallet.id,
					destinationType: 'WALLET',
					typeMeta: { amount: 70 },
					ref,
					status: 'FAILURE',
					startedAt: expect.anything(),
					failedAt: expect.anything(),
				}
			]);
		});
  });
});
