import Joi from "joi";

const eventSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).allow(""),
  date: Joi.date().greater("now").required(),
  location: Joi.string().min(3).max(100).required(),
  capacity: Joi.number().integer().min(1).required(),
});

const validateEvent = (req, res, next) => {
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

export default validateEvent;
