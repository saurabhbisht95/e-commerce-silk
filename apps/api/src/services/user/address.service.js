import { Address } from '../../models/Address.js';
import { ApiError } from '../../utils/ApiError.js';

export const addressService = {
  list(userId) {
    return Address.find({ user: userId, deletedAt: null }).sort({ isDefault: -1, createdAt: -1 });
  },

  async create(userId, payload) {
    if (payload.isDefault) await Address.updateMany({ user: userId }, { isDefault: false });
    const existingCount = await Address.countDocuments({ user: userId, deletedAt: null });
    const address = await Address.create({
      ...payload,
      user: userId,
      isDefault: payload.isDefault ?? existingCount === 0
    });
    return address;
  },

  async update(userId, id, payload) {
    if (payload.isDefault) await Address.updateMany({ user: userId }, { isDefault: false });
    const address = await Address.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    if (!address) throw ApiError.notFound('Address not found');
    return address;
  },

  async remove(userId, id) {
    const address = await Address.findOneAndUpdate(
      { _id: id, user: userId, deletedAt: null },
      { deletedAt: new Date(), isDefault: false },
      { new: true }
    );
    if (!address) throw ApiError.notFound('Address not found');
    return address;
  },

  async setDefault(userId, id) {
    const address = await Address.findOne({ _id: id, user: userId, deletedAt: null });
    if (!address) throw ApiError.notFound('Address not found');
    await Address.updateMany({ user: userId }, { isDefault: false });
    address.isDefault = true;
    await address.save();
    return address;
  }
};
