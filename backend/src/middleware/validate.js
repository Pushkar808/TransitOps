// Validates req.body against a Zod schema, replacing it with parsed data.
const validate = (schema) => (req, _res, next) => {
  const parsed = schema.parse(req.body);
  req.body = parsed;
  next();
};

module.exports = validate;
