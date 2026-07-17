import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import AuthCard from '../components/AuthCard';
import Input from '../components/Input';
import Button from '../components/Button';
import ErrorBanner from '../components/ErrorBanner';
import { CheckCircle2, ArrowLeft } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    // Simulate real backend validation latency
    setTimeout(() => {
      setSubmittedEmail(data.email);
      setIsSuccess(true);
      setLoading(false);
    }, 1000);
  };

  return (
    <AuthLayout>
      <AuthCard>
        {!isSuccess ? (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0F172A]">Reset Password</h2>
              <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="name@company.com"
                error={errors.email}
                {...register('email')}
              />

              <Button type="submit" loading={loading}>
                Reset Password
              </Button>
            </form>

            <div className="mt-6 flex items-center justify-center">
              <Link 
                to="/login" 
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#22C55E] mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Check Your Email</h2>
            <p className="text-xs text-[#64748B] mt-2.5 leading-relaxed max-w-xs">
              We have sent a password reset link to <strong className="text-[#0F172A]">{submittedEmail}</strong>. Please check your inbox.
            </p>
            
            <div className="w-full mt-6 border-t border-[#E2E8F0] pt-6 flex flex-col gap-4">
              <Button variant="secondary" onClick={() => setIsSuccess(false)}>
                Resend Email
              </Button>
              <Link 
                to="/login" 
                className="text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
