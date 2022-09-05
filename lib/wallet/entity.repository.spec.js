const EntityRepository = require('./entity.repository');

describe('EntityRepository', () => {
  let repo;

  beforeEach(() => {
    repo = new EntityRepository();
  });

  describe('create', () => {
    beforeEach(async () => {
      await repo.create({ abc: 'aaa' });
    });

    it('should push the obj to the entities array', () => {
      expect(repo.entities).toHaveLength(1);
      expect(repo.entities[0]).toEqual({
        id: expect.stringContaining(''),
        abc: 'aaa',
      });
    });
  });

  describe('findOne', () => {
    beforeEach(async () => {
      repo.entities = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
      ];
    });

    describe('Given target record exist', () => {
      it('should return the obj', async () => {
        const obj = await repo.findOne({ id: 3 });

        expect(obj.id).toEqual(3);
      });
    });

    describe('Given target record does not exist', () => {
      it('should return null', async () => {
        const obj = await repo.findOne({ id: 8 });

        expect(obj).toEqual(null);
      });
    });
  });

  describe('updateOne', () => {
    beforeEach(async () => {
      repo.entities = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
      ];
    });

    it('should update the correct record', async () => {
      await repo.updateOne({ id: 3 }, { a: 'test' });

      const entity = repo.entities.find((e) => e.id === 3);
      expect(entity).toEqual({ id: 3, a: 'test' });
    });

    it('should throw error if record not exist', async () => {
      let error;
      try { await repo.updateOne({ id: 10 }, { a: 'test' }); } catch (e) { error = e; }

      expect(error.constructor.name).toEqual('EntityRepositoryEntityNotFoundError');
    });
  });
  describe('find', () => {
    beforeEach(async () => {
      repo.entities = [
        { id: 1, a: 'test' },
        { id: 2 },
        { id: 3, a: 'test' },
        { id: 4 },
      ];
    });

    it('should find the correct records', async () => {
      const result = await repo.find({ a: 'test' });

      expect(result).toEqual([
        { id: 1, a: 'test' },
        { id: 3, a: 'test' },
      ]);
    });
  });
});
