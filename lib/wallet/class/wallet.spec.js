const Wallet = require('./wallet');
const WalletState = require('./wallet-state');

describe('Wallet', () => {
  let wallet;
  let walletState;

  describe('processDepositTransactionRequest', () => {
    let mockTransactionRequest;

    beforeEach(() => {
      mockTransactionRequest = {
        id: 'id',
        destinationId: 'destinationId',
        startedAt: 'startedAt',
        typeMeta: {
				  amount: 20,
        },
      };

      walletState = new WalletState();
      wallet = new Wallet(walletState);

      wallet.processDepositTransactionRequest(mockTransactionRequest);
    });

    it('should set stageChange', () => {
      expect(wallet.walletState.stateChange).toEqual({
        amount: mockTransactionRequest.typeMeta.amount,
        lastTransactionRequestId: mockTransactionRequest.id,
      });
    });

    it('should create walletTransaction in newWalletTransactions', () => {
		  const amountChange = mockTransactionRequest.typeMeta.amount;

      expect(wallet.newWalletTransactions).toEqual([
        {
          amountChange,
          walletId: mockTransactionRequest.destinationId,
          transactionRequestId: mockTransactionRequest.id,
          transactionRequestStartedAt: mockTransactionRequest.startedAt,
          message: `DEPOSIT ${amountChange}`,
        },
      ]);
    });
  });

  describe('processWithdrawTransactionRequest', () => {
    let mockTransactionRequest;

    beforeEach(() => {
      mockTransactionRequest = {
        id: 'id',
        destinationId: 'destinationId',
        startedAt: 'startedAt',
        typeMeta: {
				  amount: 20,
        },
      };

      walletState = new WalletState();
      wallet = new Wallet(walletState);

    });

		describe('Given there is enough amount in userState', () => {
			beforeEach(() => {
				wallet.walletState.amount = 100;
        wallet.processWithdrawTransactionRequest(mockTransactionRequest);
			})

			it('should set stageChange', () => {
				expect(wallet.walletState.stateChange).toEqual({
					amount: -mockTransactionRequest.typeMeta.amount,
					lastTransactionRequestId: mockTransactionRequest.id,
				});
			});

			it('should create walletTransaction in newWalletTransactions', () => {
				const amountChange = mockTransactionRequest.typeMeta.amount;

				expect(wallet.newWalletTransactions).toEqual([
					{
						amountChange: -amountChange,
						walletId: mockTransactionRequest.destinationId,
						transactionRequestId: mockTransactionRequest.id,
						transactionRequestStartedAt: mockTransactionRequest.startedAt,
						message: `WITHDRAW ${amountChange}`,
					},
				]);
			});
		})

		describe('Given there is not enough  amount in userState', () => {
			let error

			beforeEach(() => {
				try {
					wallet.processWithdrawTransactionRequest(mockTransactionRequest);
				} catch (e) {
					error = e
				}
			})

			it('should throw error WalletAmountLessThanZeroError', () => {
				expect(error.constructor.name).toEqual('WalletAmountLessThanZeroError')
			})
		})
  });

	describe('processTransferTransactionRequest', () => {
		let walletA;
		let walletB;

		beforeEach(() => {
      walletStateA = new WalletState();
			walletStateA.id = 'walletAId';
      walletA = new Wallet(walletStateA);

      walletStateB = new WalletState();
			walletStateB.id = 'walletBId';
      walletB = new Wallet(walletStateB);
	  })

		describe('Given source has enough money in bank', function () {
			beforeEach(function () {
				walletA.walletState.amount = 100

				mockTransactionRequest = {
					id: 'id',
					sourceId: 'walletAId',
					destinationId: 'walletBId',
					startedAt: 'startedAt',
					typeMeta: {
						amount: 20,
					},
				};

				walletA.processTransferTransactionRequest(mockTransactionRequest);
				walletB.processTransferTransactionRequest(mockTransactionRequest);
			})

			it('should set stageChange walletA', () => {
				expect(walletA.walletState.stateChange).toEqual({
					amount: -20,
					lastTransactionRequestId: mockTransactionRequest.id,
				});
			});

			it('should create walletTransaction in newWalletTransactions in walletA', () => {
				const amountChange = mockTransactionRequest.typeMeta.amount;

				expect(walletA.newWalletTransactions).toEqual([
					{
						amountChange: -amountChange,
						walletId: walletA.id,
						transactionRequestId: mockTransactionRequest.id,
						transactionRequestStartedAt: mockTransactionRequest.startedAt,
						message: `TRANSFER ${amountChange} TO ${walletB.id}`,
					},
				]);
			});
	
			it('should set stageChange walletB', () => {
				expect(walletB.walletState.stateChange).toEqual({
					amount: mockTransactionRequest.typeMeta.amount,
					lastTransactionRequestId: mockTransactionRequest.id,
				});
			});

			it('should create walletTransaction in newWalletTransactions in walletB', () => {
				const amountChange = mockTransactionRequest.typeMeta.amount;

				expect(walletB.newWalletTransactions).toEqual([
					{
						amountChange: amountChange,
						walletId: mockTransactionRequest.destinationId,
						transactionRequestId: mockTransactionRequest.id,
						transactionRequestStartedAt: mockTransactionRequest.startedAt,
						message: `RECEIVE TRANSFER ${amountChange} FROM ${walletA.id}`,
					},
				]);
			});
		})

		describe('Given source dont have enough money in bank', function () {
			let error
			beforeEach(function () {
				mockTransactionRequest = {
					id: 'id',
					sourceId: 'walletAId',
					destinationId: 'walletBId',
					startedAt: 'startedAt',
					typeMeta: {
						amount: 20,
					},
				};

				try {
					walletA.processTransferTransactionRequest(mockTransactionRequest);
					walletB.processTransferTransactionRequest(mockTransactionRequest);
				} catch (e) {
					error = e
				}
			})

			it('should throw Error WalletAmountLessThanZeroError', function() {
				expect(error.constructor.name).toEqual('WalletAmountLessThanZeroError');
			})

			it('should set stageChange walletA', () => {
				expect(walletA.walletState.stateChange).toEqual({});
			});

			it('should create walletTransaction in newWalletTransactions in walletA', () => {
				expect(walletA.newWalletTransactions).toEqual([]);
			});
	
			it('should set stageChange walletB', () => {
				expect(walletB.walletState.stateChange).toEqual({});
			});

			it('should create walletTransaction in newWalletTransactions in walletB', () => {
				expect(walletB.newWalletTransactions).toEqual([]);
			});
		})
	})

  describe('commit', () => {
    let walletState;

    beforeEach(() => {
      walletState = new WalletState();
      jest.spyOn(walletState, 'commit');
      wallet = new Wallet(walletState);
    });

    it('should trigger walletState.commit', () => {
      wallet.commit();

      expect(walletState.commit).toHaveBeenCalledTimes(1);
    });

    describe('Given there are new and existing walletTransaction', () => {
      beforeEach(() => {
        wallet.walletTransactions = [{ startedAt: 3 }, { startedAt: 2 }];
        wallet.newWalletTransactions = [{ startedAt: 4 }, { startedAt: 5 }];
        wallet.commit();
      });

      it('should order the walletTransactions', () => {
	      expect(wallet.walletTransactions).toEqual([
          { startedAt: 2 },
          { startedAt: 3 },
          { startedAt: 4 },
          { startedAt: 5 },
        ]);
      });

      it('should reset newWalletTransactions', () => {
        expect(wallet.newWalletTransactions).toEqual([]);
      });
    });

  });
});
