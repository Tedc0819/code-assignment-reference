const { v4: uuidv4 } = require('uuid');

// TODO: this class is a temp structure
class EntityRepositoryEntityNotFoundError extends Error {}

class EntityRepository {
  constructor() {
    this.entities = [];
  }

  async create(obj) {
    const clone = { ...obj };
    clone.id = uuidv4();

    this.entities.push(clone);

    return clone;
  }

  filter(query) {
    return function (e) {
      return Object.entries(query).reduce((result, [key, value]) => {
        if (e[key] !== value) return false;

        return result;
      }, true);
    };
  }

  async findOne(query) {
    const obj = this.entities.find(this.filter(query));

    return obj || null;
  }

  async updateOne(query, update) {
    const target = await this.findOne(query);

    if (!target) {
      throw new EntityRepositoryEntityNotFoundError();
    }

    const newTarget = {
      ...target,
      ...update,
    };

    this.entities = this.entities.reduce((acc, entity) => {
      if (entity.id === target.id) {
        acc.push(newTarget);
      } else {
        acc.push(entity);
      }

      return acc;
    }, []);

    return newTarget;
  }

  async find(query, options) {
    // TODO: missing logic to handle options which include sorting
    const entities = this.entities.filter(this.filter(query));

    return entities;
  }
}

module.exports = EntityRepository;
