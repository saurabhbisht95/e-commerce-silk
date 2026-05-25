export const toJSONPlugin = schema => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform(_doc, ret) {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.emailVerificationToken;
      delete ret.refreshTokenHash;
      return ret;
    }
  });
};
