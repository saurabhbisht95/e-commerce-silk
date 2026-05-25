import { User } from '../../models/User.js';
import { userRepository } from '../../repositories/user.repository.js';
import { ApiError } from '../../utils/ApiError.js';

export const userService = {
  getProfile(userId) {
    return User.findOne({ _id: userId, deletedAt: null });
  },

  async updateProfile(userId, payload) {
    const user = await User.findOneAndUpdate(
      { _id: userId, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    if (!user) throw ApiError.notFound('User not found');
    return user;
  },

  listUsers(query) {
    return userRepository.listCustomers(query);
  },

  async updateUserStatus(id, payload) {
    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      payload,
      { new: true, runValidators: true }
    );
    if (!user) throw ApiError.notFound('User not found');
    return user;
  }
};
