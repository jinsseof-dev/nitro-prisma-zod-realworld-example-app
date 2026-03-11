import { z } from 'zod';

const emailField = z.string().trim().min(1, "can't be blank").email('is invalid');
const usernameField = z.string().trim().min(1, "can't be blank");
const passwordField = z.string().min(1, "can't be blank").min(8, 'is too short (minimum is 8 characters)');

export const registerUserSchema = z.object({
  user: z.object({
    email: emailField,
    username: usernameField,
    password: passwordField,
    image: z.string().optional(),
    bio: z.string().optional(),
  }),
});

export const loginUserSchema = z.object({
  user: z.object({
    email: z.string().trim().min(1, "can't be blank"),
    password: z.string().min(1, "can't be blank"),
  }),
});

export const updateUserSchema = z.object({
  user: z.object({
    email: emailField.optional(),
    username: usernameField.optional(),
    password: passwordField.optional(),
    image: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v === '' ? null : v)),
    bio: z
      .string()
      .nullable()
      .optional()
      .transform((v) => (v === '' ? null : v)),
  }),
});
