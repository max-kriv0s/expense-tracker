import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

export const registerSchema = z.object({
  email: z.string().email('Введите корректный email'),
  name: z.string().min(1, 'Введите имя'),
  password: z.string().min(6, 'Пароль — минимум 6 символов'),
  agreedToTerms: z.boolean().refine((v) => v === true, {
    message: 'Необходимо принять соглашение и политику',
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
