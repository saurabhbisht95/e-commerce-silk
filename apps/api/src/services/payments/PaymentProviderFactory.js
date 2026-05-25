import { PAYMENT_PROVIDERS } from '../../constants/enums.js';
import { ApiError } from '../../utils/ApiError.js';
import { PayPalProvider } from './providers/PayPalProvider.js';
import { RazorpayProvider } from './providers/RazorpayProvider.js';
import { StripeProvider } from './providers/StripeProvider.js';

const providers = {
  [PAYMENT_PROVIDERS.RAZORPAY]: new RazorpayProvider(),
  [PAYMENT_PROVIDERS.STRIPE]: new StripeProvider(),
  [PAYMENT_PROVIDERS.PAYPAL]: new PayPalProvider()
};

export const paymentProviderFactory = {
  get(providerName) {
    const provider = providers[providerName];
    if (!provider) throw ApiError.badRequest(`Unsupported payment provider: ${providerName}`);
    return provider;
  }
};
