import { userService } from '../services/user/user.service.js';
import { sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const userController = {
  profile: asyncHandler(async (req, res) => {
    const user = await userService.getProfile(req.user._id);
    sendSuccess(res, 200, 'Profile fetched successfully', { user });
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user._id, req.body);
    sendSuccess(res, 200, 'Profile updated successfully', { user });
  })
};
