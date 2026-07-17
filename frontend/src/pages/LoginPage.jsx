import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import PasswordField from '../components/PasswordField';
import Button from '../components/Button';
import Divider from '../components/Divider';
import SocialButton from '../components/SocialButton';
import ErrorBanner from '../components/ErrorBanner';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const LoginPage = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false
    }
  });

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);
    try {
      const result = await authService.login({
        email: data.email,
        password: data.password
      });
      setAuth(result.user, result.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard>
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#0F172A]">Welcome Back</h2>
          <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
            Sign in to continue your interview preparation tracks.
          </p>
        </div>

        {error && <ErrorBanner message={error} className="mb-4" />}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            error={errors.email}
            {...register('email')}
          />

          <div>
            <PasswordField
              label="Password"
              placeholder="••••••••"
              error={errors.password}
              {...register('password')}
            />
            <div className="flex justify-end mt-1.5">
              <Link 
                to="/forgot-password" 
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 select-none">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-[#E2E8F0] text-[#4F46E5] focus:ring-indigo-100 transition-all cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs text-[#64748B] font-medium cursor-pointer">
              Remember me on this device
            </label>
          </div>

          <Button type="submit" loading={loading}>
            Sign In
          </Button>
        </form>

          <Divider />

          <SocialButton onClick={() => {}}>
            Sign in with Google
          </SocialButton>

        <p className="text-center text-xs text-[#64748B] mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline">
            Create Account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
};

export default LoginPage;
