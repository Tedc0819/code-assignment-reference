const WalletModule = require('../index.js');

describe.only('Wallet Module - use case - show ', () => {
  let module;
  const userId = 'userId';
  let wallet;

  beforeEach(async () => {
    module = WalletModule.create();

    const { walletService } = module;
    wallet = await walletService.createWallet(null, userId);
    await walletService.deposit({ traceId: 'traceId' }, userId, wallet.id, 100);
    await walletService.deposit({ traceId: 'traceId' }, userId, wallet.id, 10);
    await walletService.withdraw({ traceId: 'traceId' }, userId, wallet.id, 30);
  });

  it('should have a correct state in wallet', async () => {
	  const { walletService } = module;

    const newWallet = await walletService.showWallet(null, userId, wallet.id);

    expect(newWallet.walletState.amount).toEqual(80);
  });

  it('should have a correct transactions in UserA wallet', async () => {
	  const { walletService } = module;

    const newWallet = await walletService.showWallet(null, userId, wallet.id);

    expect(newWallet.walletTransactions).toEqual([
      {
        walletId: wallet.id,
        transactionRequestId: expect.stringContaining(''),
        amountChange: 100,
        message: 'DEPOSIT 100',
        transactionRequestStartedAt: expect.anything(),
        id: expect.stringContaining(''),
      },
      {
        walletId: wallet.id,
        transactionRequestId: expect.stringContaining(''),
        amountChange: 10,
        message: 'DEPOSIT 10',
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
});
