import { Banner } from '../../models/Banner.js';
import { ApiError } from '../../utils/ApiError.js';

const toBannerDTO = banner => {
  const plain = typeof banner.toJSON === 'function' ? banner.toJSON() : banner;

  return {
    ...plain,
    modelImage: plain.modelImage?.url || '',
    sideImage: plain.sideImage?.url || plain.modelImage?.url || '',
    modelImageData: plain.modelImage,
    sideImageData: plain.sideImage
  };
};

const normalizePayload = payload => {
  const normalized = { ...payload };
  if (payload.headline) normalized.headline = payload.headline.map(line => line.trim()).filter(Boolean);
  if (payload.sideImage && !payload.sideImage.url) delete normalized.sideImage;

  Object.keys(normalized).forEach(key => {
    if (normalized[key] === undefined) delete normalized[key];
  });

  return normalized;
};

export const bannerService = {
  async listBanners({ includeInactive = false } = {}) {
    const filter = { deletedAt: null };
    if (!includeInactive) filter.isActive = true;

    const banners = await Banner.find(filter).sort({ sortOrder: 1, createdAt: -1 });
    return banners.map(toBannerDTO);
  },

  async createBanner(payload) {
    const banner = await Banner.create(normalizePayload(payload));
    return toBannerDTO(banner);
  },

  async updateBanner(id, payload) {
    const update = normalizePayload(payload);
    const banner = await Banner.findOneAndUpdate(
      { _id: id, deletedAt: null },
      update,
      { new: true, runValidators: true }
    );

    if (!banner) throw ApiError.notFound('Banner not found');
    return toBannerDTO(banner);
  },

  async deleteBanner(id) {
    const banner = await Banner.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );

    if (!banner) throw ApiError.notFound('Banner not found');
    return banner;
  }
};
