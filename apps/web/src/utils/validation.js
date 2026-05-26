const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const objectIdPattern = /^[a-f\d]{24}$/i

export const getFirstValidationMessage = errors =>
  Object.values(errors).find(Boolean) || ''

export const isValidEmail = email => emailPattern.test(String(email || '').trim())

export const isValidHttpUrl = value => /^https?:\/\/\S+\.\S+/.test(String(value || '').trim())

export const validateLoginForm = form => ({
  email: isValidEmail(form.email) ? '' : 'Enter a valid email address.',
  password: form.password ? '' : 'Enter your password.',
})

export const validateRegisterForm = form => ({
  name: String(form.name || '').trim().length >= 2 ? '' : 'Name must be at least 2 characters.',
  email: isValidEmail(form.email) ? '' : 'Enter a valid email address.',
  phone: !form.phone || String(form.phone).trim().length >= 7 ? '' : 'Phone number must be at least 7 digits.',
  password: String(form.password || '').length >= 8 ? '' : 'Password must be at least 8 characters.',
})

export const validateAddressForm = address => ({
  fullName: String(address.fullName || '').trim().length >= 2 ? '' : 'Enter the receiver name.',
  phone: String(address.phone || '').trim().length >= 7 ? '' : 'Enter a valid phone number.',
  line1: String(address.line1 || '').trim().length >= 3 ? '' : 'Enter a complete address line.',
  city: String(address.city || '').trim().length >= 2 ? '' : 'Enter the city.',
  state: String(address.state || '').trim().length >= 2 ? '' : 'Enter the state.',
  postalCode: String(address.postalCode || '').trim().length >= 3 ? '' : 'Enter a valid postal code.',
  country: String(address.country || '').trim().length >= 2 ? '' : 'Enter the country.',
})

export const validateProductForm = form => ({
  name: String(form.name || '').trim().length >= 2 ? '' : 'Product name must be at least 2 characters.',
  sku: String(form.sku || '').trim() ? '' : 'SKU is required.',
  category: objectIdPattern.test(String(form.category || '')) ? '' : 'Select a valid category.',
  price: Number(form.price) >= 0 && form.price !== '' ? '' : 'Enter a valid product price.',
  stock: form.stock !== '' && Number.isInteger(Number(form.stock)) && Number(form.stock) >= 0 ? '' : 'Enter a valid stock quantity.',
})

export const validateBannerForm = (form, modelFile) => ({
  headline: String(form.headlineOne || '').trim() ? '' : 'Banner headline line 1 is required.',
  cta: String(form.cta || '').trim() ? '' : 'Banner CTA text is required.',
  ctaHref: String(form.ctaHref || '').trim().startsWith('/') || isValidHttpUrl(form.ctaHref) ? '' : 'Banner CTA link must be a site path or URL.',
  modelImage: modelFile || isValidHttpUrl(form.modelImageUrl) ? '' : 'Add a main banner image URL or upload a main image.',
})
