import Joi from 'joi';

export const LoginSchema = Joi.object({
  email: Joi.string().email().required().trim().lowercase(),
  password: Joi.string().min(1).required(),
});

export const RegisterSchema = Joi.object({
  name: Joi.string().min(1).max(255).trim().required(),
  email: Joi.string().email().required().trim().lowercase(),
  phone: Joi.string().max(50).trim().allow(null, '').default(null),
  password: Joi.string().min(8).required(),
});
