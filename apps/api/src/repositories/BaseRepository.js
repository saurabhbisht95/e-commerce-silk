import { getPagination, buildPaginationMeta } from '../utils/pagination.js';

export class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  create(payload, options) {
    return this.model.create([payload], options).then(([doc]) => doc);
  }

  findById(id, projection, options) {
    return this.model.findById(id, projection, options);
  }

  findOne(filter, projection, options) {
    return this.model.findOne(filter, projection, options);
  }

  updateById(id, payload, options = {}) {
    return this.model.findByIdAndUpdate(id, payload, { new: true, runValidators: true, ...options });
  }

  softDeleteById(id, options = {}) {
    return this.updateById(id, { deletedAt: new Date() }, options);
  }

  async paginate({ filter = {}, query = {}, projection, populate = [], sort = '-createdAt' }) {
    const { page, limit, skip } = getPagination(query);
    const sortValue = query.sort || sort;

    const [items, total] = await Promise.all([
      this.model
        .find(filter, projection)
        .populate(populate)
        .sort(sortValue)
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      this.model.countDocuments(filter)
    ]);

    return {
      items,
      meta: buildPaginationMeta({ page, limit, total })
    };
  }
}
