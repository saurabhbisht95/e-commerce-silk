import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../config/logger.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PRODUCT_STATUS } from '../constants/enums.js';
import { createSlug } from '../utils/slug.js';

const catalog = [
  ['Doon Silk Saree Royal Red', 'Sarees', 6499, '1-26-430x430.webp', '1-26-700x700.webp'],
  ['Doon Silk Fabric Emerald', 'Fabrics', 1200, '1-27-430x430.webp', '1-27.webp', ' / Meter'],
  ['Classic Silk Kurta Ivory', 'Kurtas', 2499, '1-28-430x430.webp', '1-28-700x700.webp'],
  ['Handwoven Silk Stole Blush', 'Stoles', 1899, '1-29-430x430.webp', '1-29-700x700.webp'],
  ['Pure Silk Shawl Maroon', 'Shawls', 3499, '1-30-430x430.webp', '1-30-700x700.webp'],
  ['Silk Suit Set Champagne', 'Suits', 5999, '1-31-430x430.webp', '1-31-700x700.webp'],
  ['Doon Silk Muffler Indigo', 'Mufflers', 1299, '1-32-430x430.webp', '1-32-700x700.webp'],
  ['Zari Woven Saree Gold', 'Sarees', 8499, '1-33-430x430.webp', '1-33-700x700.webp'],
  ['Raw Silk Fabric Mustard', 'Fabrics', 1500, '1-34-430x430.webp', '1-34.webp', ' / Meter'],
  ['Festive Silk Kurta Rose', 'Kurtas', 4199, '1707131253219-50203-430x430.webp', '1707131253219-50203-700x700.webp'],
  ['Mulberry Silk Saree Cream', 'Sarees', 17385, '1707131253237-50201.webp', '1707131253237-50201.webp'],
  ['Himalayan Blue Saree', 'Sarees', 9999, '2-26-430x430.webp', '2-26.webp'],
  ['Printed Silk Stole Navy', 'Stoles', 1499, '2-27-430x430.webp', '2-27.webp'],
  ['Banarasi Silk Kurta Maroon', 'Kurtas', 3299, '2-28-430x430.webp', '2-28.webp'],
  ['Woven Pashmina Shawl Olive', 'Shawls', 4599, '2-29-430x430.webp', '2-29-430x430.webp'],
  ['Silk Blend Suit Turquoise', 'Suits', 6499, '2-30-430x430.webp', '2-30.webp'],
  ['Bridal Silk Saree Cherry', 'Sarees', 22999, '2-31.webp', '2-31.webp'],
  ['Handloom Silk Fabric Teal', 'Fabrics', 1100, '2-32-430x430.webp', '2-32.webp', ' / Meter'],
  ['Silk Muffler Charcoal', 'Mufflers', 1199, '2-33-430x430.webp', '2-33.webp'],
  ['Elegant Silk Suit Mint', 'Suits', 5499, '2-34-430x430.webp', '2-34.webp']
];

const formatDisplayPrice = (amount, suffix = '') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount) + suffix;

const assetUrl = fileName => `/src/assets/shop/${fileName}`;

const run = async () => {
  await connectDatabase();

  const categoryNames = [...new Set(catalog.map(([, category]) => category))];
  const categories = new Map();

  for (const name of categoryNames) {
    const category = await Category.findOneAndUpdate(
      { slug: createSlug(name) },
      {
        name,
        slug: createSlug(name),
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categories.set(name, category);
  }

  for (const [index, [name, categoryName, price, cardImage, largeImage, suffix = '']] of catalog.entries()) {
    await Product.findOneAndUpdate(
      { slug: createSlug(name) },
      {
        legacyId: index + 1,
        name,
        slug: createSlug(name),
        sku: `DS-${String(index + 1).padStart(4, '0')}`,
        category: categories.get(categoryName)._id,
        brand: 'Doon Silk',
        price,
        displayPrice: formatDisplayPrice(price, suffix),
        currency: 'INR',
        shortDescription: 'Handpicked from the Doon Silk collection with a refined weave, soft drape, and polished finish.',
        description:
          'A premium Doon Silk piece crafted for festive and everyday styling with elegant texture, rich color, and lasting comfort.',
        images: [
          { url: assetUrl(cardImage), alt: name, position: 0 },
          { url: assetUrl(largeImage), alt: `${name} large`, position: 1 }
        ],
        stock: 25,
        lowStockThreshold: 5,
        flags: {
          featured: index < 10,
          trending: index % 3 === 0
        },
        status: PRODUCT_STATUS.ACTIVE,
        publishedAt: new Date(),
        tags: [categoryName.toLowerCase(), 'silk', 'doon-silk']
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  logger.info({ products: catalog.length }, 'Doon Silk catalog seeded');
  await disconnectDatabase();
};

run().catch(async error => {
  logger.error({ err: error }, 'Seed failed');
  await disconnectDatabase();
  process.exit(1);
});
