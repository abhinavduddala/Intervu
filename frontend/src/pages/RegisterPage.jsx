import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import PasswordField from '../components/PasswordField';
import Button from '../components/Button';
import ErrorBanner from '../components/ErrorBanner';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms of service' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      // The backend accepts email, password, and optionally role (default 'user')
      const result = await authService.register({
        email: data.email,
        password: data.password,
        role: 'user',
      });
      setAuth(result.user, result.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0F172A]">Create Account</h2>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Get started with your technical interview preparation.
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="Alex Mercer"
            error={errors.fullName}
            {...register('fullName')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email}
            {...register('email')}
          />

          <PasswordField
            label="Password"
            placeholder="••••••••"
            error={errors.password}
            {...register('password')}
          />

          <PasswordField
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />

          <div>
            <div className="flex items-start gap-2 select-none">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms')}
                className="h-4 w-4 rounded border-[#E2E8F0] text-[#4F46E5] focus:ring-indigo-100 transition-all cursor-pointer mt-0.5"
              />
              <label htmlFor="acceptTerms" className="text-xs text-[#64748B] font-medium cursor-pointer leading-normal">
                I accept the{' '}
                <span className="text-[#4F46E5] hover:text-[#4338CA] hover:underline font-semibold">Terms of Service</span>
                {' '}and{' '}
                <span className="text-[#4F46E5] hover:text-[#4338CA] hover:underline font-semibold">Privacy Policy</span>
              </label>
            </div>
            {errors.acceptTerms && (
              <p className="mt-1.5 text-red-500 text-xs font-medium">{errors.acceptTerms.message}</p>
            )}
          </div>

          <Button type="submit" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline">
            Login
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default RegisterPage;
