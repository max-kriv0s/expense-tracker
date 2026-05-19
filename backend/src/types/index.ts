import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
});

export const RegisterUserSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  password: z.string().min(6),
});

export const LoginUserSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const AuthTokensSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
});

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  icon: z.string().nullish(),
  color: z.string().nullish(),
  userId: z.string().uuid(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string(),
  date: z.date(),
  categoryId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type User = z.infer<typeof UserSchema>;
export type RegisterUser = z.infer<typeof RegisterUserSchema>;
export type LoginUser = z.infer<typeof LoginUserSchema>;
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type Expense = z.infer<typeof ExpenseSchema>;

export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE']);

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().positive(),
  type: TransactionTypeSchema,
  description: z.string().nullable(),
  date: z.date(),
  categoryId: z.string().uuid(),
  userId: z.string().uuid(),
  createdAt: z.date(),
});

export const TransactionSummarySchema = z.object({
  totalIncome: z.number(),
  totalExpense: z.number(),
  balance: z.number(),
});

export type TransactionType = z.infer<typeof TransactionTypeSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionSummary = z.infer<typeof TransactionSummarySchema>;
