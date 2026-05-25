export const formatMoney = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2
  }).format(amount);

export const toProductDTO = product => {
  const plain = typeof product.toJSON === 'function' ? product.toJSON() : product;
  const categoryName = plain.category?.name || plain.categoryName || plain.category;
  const firstImage = plain.images?.[0];
  const largeImage = plain.images?.find(image => image.position === 1) || firstImage;

  return {
    ...plain,
    id: plain.legacyId || plain.id || plain._id?.toString(),
    mongoId: plain.id || plain._id?.toString(),
    category: categoryName,
    categoryId: plain.category?.id || plain.category?._id?.toString(),
    price: plain.displayPrice || formatMoney(plain.price, plain.currency),
    amount: plain.price,
    image: firstImage?.url || '',
    imageLarge: largeImage?.url || firstImage?.url || ''
  };
};

export const toProductListDTO = products => products.map(toProductDTO);
