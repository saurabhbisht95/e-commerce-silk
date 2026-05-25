export const sendSuccess = (res, statusCode, message, data = {}, meta = undefined) => {
  const payload = {
    success: true,
    message,
    data
  };

  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, message, data = {}, meta = undefined) =>
  sendSuccess(res, 201, message, data, meta);
