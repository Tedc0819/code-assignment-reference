const { v4: uuidv4 } = require('uuid');
const WalletModule = require('../lib/wallet/index');

// try to run with process.env.APP_LOG_LEVEL=verbose

async function main() {
  const { walletService } = WalletModule.create();

  const userA = { id: 'userAId' };
  const userB = { id: 'userBId' };
  let walletA;
  let walletB;

  // UserA create wallet
  walletA = await walletService.createWallet({ traceId: '1' }, userA.id, `app:create-wallet:${userA.id}:${uuidv4()}`);
  // UserB create wallet
  walletB = await walletService.createWallet({ traceId: '2' }, userB.id, `app:create-wallet:${userB.id}:${uuidv4()}`);

  // userA deposit 100
  await walletService.deposit({ traceId: '3' }, userA.id, walletA.id, 100, `app:deposit:${userA.id}:${walletA.id}:${uuidv4()}`);

  // userA transfer 50 userB
  await walletService.transfer({ traceId: '4' }, userA.id, walletA.id, walletB.id, 50, `app:transfer:${walletA.id}:${walletB.id}:${uuidv4()}`);

  // userB withdraw 50
  await walletService.withdraw({ traceId: '5' }, userB.id, walletB.id, 50, `app:withdraw:${userB.id}:${walletB.id}:${uuidv4()}`);

  // userA views his wallet
  walletA = await walletService.showWallet({ traceId: '6' }, userA.id, walletA.id, `app:show-wallet:${userA.id}:${uuidv4()}`);
  // userB views his wallet
  walletB = await walletService.showWallet({ traceId: '7' }, userB.id, walletB.id, `app:show-wallet:${userB.id}:${uuidv4()}`);

  return [JSON.stringify(walletA, null, 2), JSON.stringify(walletB, null, 2)];
}

main().then(console.log);
