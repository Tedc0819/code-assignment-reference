const WalletRepository = require('./wallet.repository.js');

describe('WalletRepository', () => {
  let	mockLogger;
  let	mockWalletTransactionRepo;
  let	mockTransactionRequestRepo;
  let	mockWalletStateRepo;
  let walletRepository;
  const context = {};
  const userId = 'userId';
  const mockWalletState = { id: 'id' };

  beforeEach(() => {
    mockLogger = {
      child: jest.fn(() => mockLogger),
      verbose: jest.fn(),
      error: jest.fn(),
    };
    mockWalletTransactionRepo = {
      find: jest.fn(() => []),
		};
    mockTransactionRequestRepo = {
      create: jest.fn(),
      updateOne: jest.fn(),
    };
    mockWalletStateRepo = {
			findOne: jest.fn(() => mockWalletState),
      create: jest.fn(() => mockWalletState),
    };

    walletRepository = new WalletRepository(
      mockLogger,
      mockWalletTransactionRepo,
      mockTransactionRequestRepo,
      mockWalletStateRepo,
    );
  });

  describe('createWallet', () => {
    describe('normal use case', () => {
      beforeEach(async () => {
        await walletRepository.createWallet(context, userId);
      });

      it('should call walletStateRepo', () => {
        expect(mockWalletStateRepo.create).toHaveBeenCalledWith({ userId });
      });
    });

    describe('missing arguments', () => {
      let error;
      beforeEach(async () => {
        try {
          await walletRepository.createWallet(context);
        } catch (e) {
          error = e;
        }
      });

      it('should throw error', () => {
        expect(error.constructor.name).toEqual('WalletRepositoryArgumentsInvalidError');
      });
    });
  });

  describe('initTransactionRequest', () => {
    const mockTransactionRequest = {
      init: jest.fn(),
      ref: 'ref',
    };

    describe('normal use case', () => {
      beforeEach(async () => {
        await walletRepository.initTransactionRequest(context, mockTransactionRequest);
      });

      it('should call transactionRequest.init', () => {
        expect(mockTransactionRequest.init).toHaveBeenCalled();
      });

      it('should call walletStateRepo', () => {
        expect(mockTransactionRequestRepo.create).toHaveBeenCalledWith(mockTransactionRequest);
      });
    });

    describe('missing arguments', () => {
      let error;
      beforeEach(async () => {
        try {
          await walletRepository.initTransactionRequest(context);
        } catch (e) {
          error = e;
        }
      });

      it('should throw error', () => {
        expect(error.constructor.name).toEqual('WalletRepositoryArgumentsInvalidError');
      });
    });
  });

  describe('failTransactionRequest', () => {
    const mockTransactionRequest = {
      fail: jest.fn(),
      ref: 'ref',
    };

    describe('normal use case', () => {
      beforeEach(async () => {
        await walletRepository.failTransactionRequest(context, mockTransactionRequest);
      });

      it('should call transactionRequest.fail', () => {
        expect(mockTransactionRequest.fail).toHaveBeenCalled();
      });

      it('should call walletStateRepo', () => {
        expect(mockTransactionRequestRepo.updateOne).toHaveBeenCalledWith({ id: mockTransactionRequest.id }, mockTransactionRequest);
      });
    });

    describe('missing arguments', () => {
      let error;
      beforeEach(async () => {
        try {
          await walletRepository.failTransactionRequest(context);
        } catch (e) {
          error = e;
        }
      });

      it('should throw error', () => {
				console.log(error)
        expect(error.constructor.name).toEqual('WalletRepositoryArgumentsInvalidError');
      });
    });
  });

  describe('finishTransactionRequest', () => {
    const mockTransactionRequest = {
      succeed: jest.fn(),
      ref: 'ref',
    };

    describe('normal use case', () => {
      beforeEach(async () => {
        await walletRepository.finishTransactionRequest(context, mockTransactionRequest);
      });

      it('should call transactionRequest.succeed', () => {
        expect(mockTransactionRequest.succeed).toHaveBeenCalled();
      });

      it('should call walletStateRepo', () => {
        expect(mockTransactionRequestRepo.updateOne).toHaveBeenCalledWith({ id: mockTransactionRequest.id }, mockTransactionRequest);
      });
    });

    describe('missing arguments', () => {
      let error;
      beforeEach(async () => {
        try {
          await walletRepository.finishTransactionRequest(context);
        } catch (e) {
          error = e;
        }
      });

      it('should throw error', () => {
        expect(error.constructor.name).toEqual('WalletRepositoryArgumentsInvalidError');
      });
    });
  });

  describe('getWallet', () => {
		let walletId = 'walletId'
    describe('normal use case with no recentTransactionSize', () => {
      beforeEach(async () => {
        await walletRepository.getWallet(context, walletId);
      });

      it('should call walletStateRepo.findOne', () => {
        expect(mockWalletStateRepo.findOne).toHaveBeenCalledWith({ id: walletId });
      });

      it('should not call walletTransactionRepo.find', () => {
        expect(mockWalletTransactionRepo.find).not.toHaveBeenCalled()
      });
    });

    describe('normal use case with recentTransactionSize', () => {
      beforeEach(async () => {
        await walletRepository.getWallet(context, walletId, 10);
      });

      it('should call walletStateRepo.findOne', () => {
        expect(mockWalletStateRepo.findOne).toHaveBeenCalledWith({ id: walletId });
      });

      it('should call walletTransactionRepo.find', () => {
        expect(mockWalletTransactionRepo.find).toHaveBeenCalledWith({ walletId }, null, { limit: 10, sort: { transactionRequestStartedAt: 'desc' } })
      });
    });

    describe('Given walletState record does not exist', () => {
      let error;
      beforeEach(async () => {
        try {
					mockWalletStateRepo.findOne = jest.fn();
          await walletRepository.getWallet(context, walletId);
        } catch (e) {
          error = e;
        }
      });

      it('should throw error', () => {
        expect(error.constructor.name).toEqual('WalletRepositoryRecordNotFoundError');
      });
    });
  });
});
