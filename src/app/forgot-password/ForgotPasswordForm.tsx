'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function ForgotPasswordForm() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordValue, setPasswordValue] = useState('');
	const router = useRouter();

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		
		const form = e.currentTarget as HTMLFormElement & {
			elements: any;
		};
		const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase();
		const newPassword = (form.elements.namedItem('password') as HTMLInputElement).value;
		const confirmPassword = (form.elements.namedItem('confirmPassword') as HTMLInputElement).value;

		if (!email || !newPassword || !confirmPassword) {
			setError('All fields are required');
			setLoading(false);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match');
			setLoading(false);
			return;
		}

		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters');
			setLoading(false);
			return;
		}

		try {
			const res = await fetch('/api/auth/reset-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, password: newPassword }),
			});

			const data = await res.json();

			if (!res.ok) {
				setError(data.error || 'Failed to reset password');
				setLoading(false);
				return;
			}

			setSuccess(true);
			setTimeout(() => {
				router.push('/signin');
			}, 2000);
		} catch (err) {
			setError('An error occurred. Please try again.');
			setLoading(false);
		}
	}

	return (
		<div className="h-screen w-screen flex border-2 border-[#3D4756] overflow-hidden" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			{/* Left Panel - Form */}
			<div className="w-[50%] bg-white flex flex-col justify-center py-16 relative">
				{/* Heading */}
				<div className="mb-12 mt-16">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-snug text-center" style={{ color: '#3D4756' }}>
						Reset Password
					</h1>
					<p className="text-center mt-4 text-sm" style={{ color: '#6B7280' }}>
						Enter your email and new password
					</p>
				</div>

				{/* Form */}
				<form onSubmit={onSubmit} className="space-y-6 flex-1 flex flex-col ml-16 mr-16">
					<div className="space-y-6">
						<label className="block">
							<div className="text-sm mb-2" style={{ color: '#3D4756' }}>Email</div>
							<input 
								name="email" 
								type="email" 
								required 
								className="w-full border-0 border-l-4 pl-3 py-3 font-medium focus:outline-none transition-colors bg-transparent"
								style={{ borderColor: '#E4BB97', color: '#3D4756' }}
								onFocus={(e) => e.target.style.borderColor = '#584b53'}
								onBlur={(e) => e.target.style.borderColor = e.target.value ? '#584b53' : '#E4BB97'}
								onChange={(e) => e.target.style.borderColor = e.target.value ? '#584b53' : '#E4BB97'}
							/>
						</label>
						<label className="block">
							<div className="text-sm mb-2" style={{ color: '#3D4756' }}>New Password</div>
							<div className="relative">
								<input 
									name="password" 
									type={showPassword ? "text" : "password"}
									required 
									value={passwordValue}
									minLength={6}
									className="w-full border-0 border-l-4 pl-3 pr-10 py-3 font-medium focus:outline-none transition-colors bg-transparent"
									style={{ borderColor: '#E4BB97', color: '#3D4756' }}
									onFocus={(e) => e.target.style.borderColor = '#584b53'}
									onBlur={(e) => e.target.style.borderColor = e.target.value ? '#584b53' : '#E4BB97'}
									onChange={(e) => {
										setPasswordValue(e.target.value);
										e.target.style.borderColor = e.target.value ? '#584b53' : '#E4BB97';
									}}
								/>
								{passwordValue && (
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 focus:outline-none"
										style={{ color: '#3D4756' }}
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
											</svg>
										) : (
											<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
											</svg>
										)}
									</button>
								)}
							</div>
						</label>
						<label className="block">
							<div className="text-sm mb-2" style={{ color: '#3D4756' }}>Confirm Password</div>
							<input 
								name="confirmPassword" 
								type="password"
								required 
								minLength={6}
								className="w-full border-0 border-l-4 pl-3 py-3 font-medium focus:outline-none transition-colors bg-transparent"
								style={{ borderColor: '#E4BB97', color: '#3D4756' }}
								onFocus={(e) => e.target.style.borderColor = '#584b53'}
								onBlur={(e) => e.target.style.borderColor = e.target.value ? '#584b53' : '#E4BB97'}
								onChange={(e) => e.target.style.borderColor = e.target.value ? '#584b53' : '#E4BB97'}
							/>
						</label>
					</div>

					{error && <div className="text-sm text-red-600">{error}</div>}
					{success && (
						<div className="text-sm text-green-600">
							Password reset successfully! Redirecting to sign in...
						</div>
					)}

					{/* Buttons */}
					<div className="flex gap-4 pt-4">
						<button 
							type="submit"
							disabled={loading || success} 
							className="flex-1 text-white px-6 py-3 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
							style={{ backgroundColor: '#4A5568' }}
						>
							{loading ? 'Resetting…' : success ? 'Success!' : 'Reset Password'}
						</button>
						<Link
							href="/signin"
							className="flex-1 bg-white border-2 px-6 py-3 rounded-lg font-semibold text-base hover:bg-gray-50 transition-colors duration-200 text-center shadow-sm"
							style={{ borderColor: '#6B7280', color: '#6B7280' }}
						>
							Back to Sign In
						</Link>
					</div>
				</form>
			</div>

			{/* Right Panel - Abstract Background Image */}
			<div className="w-[50%] relative overflow-hidden">
				<Image
					src="/signin-background.jpg"
					alt="Abstract gradient background"
					fill
					className="object-cover"
					priority
				/>
			</div>
		</div>
	);
}

