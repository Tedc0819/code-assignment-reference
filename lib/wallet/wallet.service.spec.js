const WalletService = require('./wallet.service')

describe('WalletService', function () {
	let walletService
	let mockLogger 
  let	mockWalletRepository;
  let userId = 'userId';
  let ref = 'ref';
  let context = {};

	beforeEach(function () {
    mockLogger = {
      child: jest.fn(() => mockLogger),
      verbose: jest.fn(),
      error: jest.fn(),
    };
    
    mockWallet = {
      id: 'walletId',
      processDepositTransactionRequest: jest.fn(),
      processWithdrawTransactionRequest: jest.fn(),
      processTransferTransactionRequest: jest.fn(),
    }
  
    mockTransactionRequest = {}

    mockWalletRepository = {
      createWallet: jest.fn(() => mockWallet),
      initTransactionRequest: jest.fn(() => mockTransactionRequest),
      finishTransactionRequest: jest.fn(),
      failTransactionRequest: jest.fn(),
      getWallet: jest.fn(() => mockWallet),
      commitWallet: jest.fn(),
    }

		walletService = new WalletService(mockLogger, mockWalletRepository);
	}) 
	
	describe('createWallet', function () {
    let res

    describe('normal case', function () {
      beforeEach(async function () {
        res = await walletService.createWallet(context, userId, ref) 
      })

      it('should call wallerRepository.createWallet', function () {
        expect(mockWalletRepository.createWallet).toHaveBeenCalledWith(context, userId)
      })
    })

    describe('when error happen', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.createWallet = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.createWallet(context, userId, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })
    })
	})

	describe('deposit', function () {
    let res

    describe('normal case', function () {
      beforeEach(async function () {
        res = await walletService.deposit(context, userId, mockWallet.id, 50, ref) 
      })

      it('should call wallerRepository.initTransactionRequest ', function () {
        expect(mockWalletRepository.initTransactionRequest).toHaveBeenCalled()
      })

      it('should call wallerRepository.getWallet ', function () {
        expect(mockWalletRepository.getWallet).toHaveBeenCalled()
      })

      it('should call wallet.processDepositTransactionRequest ', function () {
        expect(mockWallet.processDepositTransactionRequest).toHaveBeenCalled()
      })

      it('should call wallerRepository.commitWallet', function () {
        expect(mockWalletRepository.commitWallet).toHaveBeenCalled()
      })
      
      it('should call wallerRepository.finishTransactionRequest', function () {
        expect(mockWalletRepository.finishTransactionRequest).toHaveBeenCalled()
      })

    })

    describe('when error happen and TransactionRequest is not started', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.initTransactionRequest = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.deposit(context, userId, mockWallet.id, 50, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })
    })

    describe('when error happen and TransactionRequest is started', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.getWallet = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.deposit(context, userId, mockWallet.id, 50, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })

      it('should call wallerRepository.failTransactionRequest', function () {
        expect(mockWalletRepository.failTransactionRequest).toHaveBeenCalled()
      })
    })
	})

  describe('withdraw', function () {
    let res

    describe('normal case', function () {
      beforeEach(async function () {
        res = await walletService.withdraw(context, userId, mockWallet.id, 50, ref) 
      })

      it('should call wallerRepository.initTransactionRequest ', function () {
        expect(mockWalletRepository.initTransactionRequest).toHaveBeenCalled()
      })

      it('should call wallerRepository.getWallet ', function () {
        expect(mockWalletRepository.getWallet).toHaveBeenCalled()
      })

      it('should call wallet.processWithdrawTransactionRequest ', function () {
        expect(mockWallet.processWithdrawTransactionRequest).toHaveBeenCalled()
      })

      it('should call wallerRepository.commitWallet', function () {
        expect(mockWalletRepository.commitWallet).toHaveBeenCalled()
      })
      
      it('should call wallerRepository.finishTransactionRequest', function () {
        expect(mockWalletRepository.finishTransactionRequest).toHaveBeenCalled()
      })

    })

    describe('when error happen and TransactionRequest is not started', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.initTransactionRequest = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.withdraw(context, userId, mockWallet.id, 50, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })
    })

    describe('when error happen and TransactionRequest is started', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.getWallet = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.deposit(context, userId, mockWallet.id, 50, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })

      it('should call wallerRepository.failTransactionRequest', function () {
        expect(mockWalletRepository.failTransactionRequest).toHaveBeenCalled()
      })
    })
	})

  describe('transfer', function () {
    let res
    let destinationWalletId = 'destinationWalletId'

    describe('normal case', function () {
      beforeEach(async function () {
        res = await walletService.transfer(context, userId, mockWallet.id, destinationWalletId, 50, ref) 
      })

      it('should call wallerRepository.initTransactionRequest ', function () {
        expect(mockWalletRepository.initTransactionRequest).toHaveBeenCalled()
      })

      it('should call wallerRepository.getWallet ', function () {
        expect(mockWalletRepository.getWallet).toHaveBeenCalled()
      })

      it('should call wallet.processTransferTransactionRequest ', function () {
        expect(mockWallet.processTransferTransactionRequest).toHaveBeenCalled()
      })

      it('should call wallerRepository.commitWallet', function () {
        expect(mockWalletRepository.commitWallet).toHaveBeenCalled()
      })
      
      it('should call wallerRepository.finishTransactionRequest', function () {
        expect(mockWalletRepository.finishTransactionRequest).toHaveBeenCalled()
      })

    })

    describe('when error happen and TransactionRequest is not started', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.initTransactionRequest = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.transfer(context, userId, mockWallet.id, destinationWalletId, 50, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })
    })

    describe('when error happen and TransactionRequest is started', function () {
      let error
      let errorMsg = 'errorMsg'

      beforeEach(async function () {
        mockWalletRepository.getWallet = jest.fn(() => { throw new Error(errorMsg) })

        try {
          res = await walletService.deposit(context, userId, mockWallet.id, 50, ref) 
        } catch (e) {
          error = e
        }
      })

      it('should call logger.error', function () {
        expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(errorMsg))
      })

      it('should call wallerRepository.failTransactionRequest', function () {
        expect(mockWalletRepository.failTransactionRequest).toHaveBeenCalled()
      })
    })
	})
})