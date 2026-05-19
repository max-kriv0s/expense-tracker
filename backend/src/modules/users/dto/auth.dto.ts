import { z } from 'zod';
import { RegisterUserSchema, LoginUserSchema } from '../../../types';

export const RegisterUserDto = RegisterUserSchema;
export type RegisterUserDto = z.infer<typeof RegisterUserDto>;

export const LoginUserDto = LoginUserSchema;
export type LoginUserDto = z.infer<typeof LoginUserDto>;
