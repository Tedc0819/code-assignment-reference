# Wallet Library

## Objective
1. Provide a nodejs module to provide Wallet related features
2. By replacing the Date Source(Entity Repository Layer), data can be stored in persistent storage 
3. with extra controller layer and routing, connecting to the service layer can directly provide functionalities through API

## HOW TO START
0. using node version >= 12
1. Remember to run `npm install`
2. using `npm run test` will be able to check the test cases
3. using `npm run test:coverage` will be able to check the test cases
4. the module provide a interface to start
	a. create(walletTransactionRepo, transactionRequestRepo, walletStateRepo)
		i. walletTransactionRepo(Optional)
			a. can be replaced by another classes which the same interfaces
			b. if null, it will use the EntityRepository
		ii. transactionRequestRepo(Optional)
			a. can be replaced by another classes which the same interfaces
			b. if null, it will use the EntityRepository
		iii. walletStateRepo(Optional)
			a. can be replaced by another classes which the same interfaces
			b. if null, it will use the EntityRepository
	b. returning 
    i. walletService
			a. the main class to serve your need
    ii.  walletTransactionRepository
		  a. the entry point to check walletTransaction entities
			b. check entity.repository.js
    iii.  transactionRequestRepository
			a. the entry point to check transactionRequest entities
			b. check entity.repository.js
    iv.  walletStateRepository
			a. the entry point to check walletState entities
			b. check entity.repository.js
5. just import the module and use the following API in WalletService(check example/basic.js)
	a. createWallet
	b. deposit
	c. withdraw
	d. transfer
	e. showWallet

## SPIKE and Planning
Please read the attached SPIKE.pdf 

## Key Design principle / Structure
1. Dependency injection
2. Layering
	a. Module layer - CLOSED layer
		i. the entry point of the library. will provide several contact points to the module
	b. Service layer - CLOSED layer
		i. manage all the business flow
		ii. provide business oriented interface 
	c. Business Repository layer - CLOSED layer
		i. manage the business related Storage I/O logic
		ii. wont return entities to service layer
	d. Entity Repository layer - CLOSEDlayer
		i. manage per resource level Storage I/O logic
3. Domain Object / Business Object
	a. those in `class` directory
	b. can work in the following layers
		i. Service Layer
		ii. Business Repository Layer
4. Entity
  a. temporarily using the EntityRepository (need enhancement)
	b. can work in the following layers
		i. Business Repository Layer 
		ii. Entity Repository Layer
## Highlight 
1. logging
	a. provide verbose log
2. traceId in the context
	a. business related layers will need to intake a `context` argument
	b. the context will be come part of the logging
	c. having a traceId in the context will chain up all the logs of one request 
	d. traceId serve request level tracing
3. ref as a identifier to chain up all user trigger business action
4. using Error sub-classing to provide Error identity
	a. monitor system like NewRelic identify Error by Error Class 
5. code structure
	a. mentioned in the above sections
6. providing use cases related integration test
	a. due to time limit and being early stage of the app, this kind of behavioral test is more worth to invest on. 
	b. based on a), the test case can gate-keep the changes of later on development
	c. too restricting unit test will become a burden on a unstable app.

## Improvements
1. Since the assignment mainly highlighting the code structure and practice. some minor decision is ignored, like data field type.
2. the flexibility of delegating data source will need a better interface definition
3. there should be more validation and checking.
4. should provide more unit tests.
5. the EntityRepository is just a temporary structure. will be better if we can have a library to support this part

## How long I spent on the test
1. ~8 hours