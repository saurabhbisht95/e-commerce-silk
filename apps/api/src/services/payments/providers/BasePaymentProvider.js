export class BasePaymentProvider {
  constructor(name) {
    this.name = name;
  }

  createPayment() {
    throw new Error(`${this.name} createPayment is not implemented`);
  }

  verifyPayment() {
    throw new Error(`${this.name} verifyPayment is not implemented`);
  }

  verifyWebhook() {
    throw new Error(`${this.name} verifyWebhook is not implemented`);
  }

  refundPayment() {
    throw new Error(`${this.name} refundPayment is not implemented`);
  }
}
