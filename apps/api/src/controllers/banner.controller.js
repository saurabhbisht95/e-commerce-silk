import { bannerService } from '../services/banner/banner.service.js';
import { USER_ROLES } from '../constants/enums.js';
import { sendCreated, sendSuccess } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const isAdmin = user => user?.roles?.some(role => [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN].includes(role));

export const bannerController = {
  list: asyncHandler(async (req, res) => {
    const includeInactive = req.query.includeInactive && isAdmin(req.user);
    const banners = await bannerService.listBanners({ includeInactive });
    sendSuccess(res, 200, 'Banners fetched successfully', { banners });
  }),

  create: asyncHandler(async (req, res) => {
    const banner = await bannerService.createBanner(req.body);
    sendCreated(res, 'Banner created successfully', { banner });
  }),

  update: asyncHandler(async (req, res) => {
    const banner = await bannerService.updateBanner(req.params.id, req.body);
    sendSuccess(res, 200, 'Banner updated successfully', { banner });
  }),

  remove: asyncHandler(async (req, res) => {
    await bannerService.deleteBanner(req.params.id);
    sendSuccess(res, 200, 'Banner deleted successfully');
  })
};
