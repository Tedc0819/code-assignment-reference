const WalletModule = require('../index.js');

describe('Wallet Module - use case - withdraw ', () => {
  let module;
  const userId = 'userId';
  let wallet;
	let ref;

  beforeEach(async () => {
    module = WalletModule.create();

    const { walletService } = module;
    wallet = await walletService.createWallet(null, userId, ref);
    await walletService.deposit(null, userId, wallet.id, 50);
  });

  describe('Given User withdraw 30 dollars (less than current amount)', () => {
    const amount = 30;
    beforeEach(async () => {
		  const { walletService } = module;

      await walletService.withdraw({ traceId: 'traceId' }, userId, wallet.id, amount);
    });

    it('should have a correct amount in wallet', async () => {
		  const { walletService } = module;

      const newWallet = await walletService.showWallet(null, userId, wallet.id);

      expect(newWallet.walletState.amount).toEqual(20);
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
        {
          walletId: wallet.id,
          transactionRequestId: expect.stringContaining(''),
          amountChange: -30,
          message: 'WITHDRAW 30',
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
          "type": "WITHDRAW",
          "typeMeta": {
            "amount": 30,
          },
        },
			]);
		});
  });

  describe('Given User withdraw 70 dollars (more than current amount)', () => {
    const amount = 70;
    let error;
    beforeEach(async () => {
		  const { walletService } = module;

      try {
        await walletService.withdraw({ traceId: 'traceId' }, userId, wallet.id, amount);
      } catch (err) {
        error = err;
      }
    });

    it('should have a correct state in wallet', async () => {
      expect(error.constructor.name).toEqual('WalletAmountLessThanZeroError');
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
        {
          "destinationId": wallet.id, 
          "destinationType": "WALLET",
          "failedAt": undefined,
          "id": expect.anything(),
          "ref": ref,
          "sourceId": userId,
          "sourceType": "USER",
          "startedAt": expect.anything(),
          "status": "FAILURE",
          "failedAt": expect.anything(),
          "type": "WITHDRAW",
          "typeMeta": {
            "amount": 70,
          },
        },
			]);
		});


  });
});
