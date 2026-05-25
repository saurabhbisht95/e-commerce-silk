import slugify from 'slugify';

export const createSlug = value =>
  slugify(value, {
    lower: true,
    strict: true,
    trim: true
  });
