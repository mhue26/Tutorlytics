'use client';

import { useState, FormEvent, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function SignInForm() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [passwordValue, setPasswordValue] = useState('');
	const router = useRouter();
	const searchParams = useSearchParams();

	// Check for error from NextAuth redirect
	useEffect(() => {
		const errorParam = searchParams.get('error');
		if (errorParam === 'CredentialsSignin') {
			setError('Invalid email or password');
		}
	}, [searchParams]);

	async function onSubmit(e: FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		const form = e.currentTarget as HTMLFormElement & {
			elements: any;
		};
		const email = (form.elements.namedItem('email') as HTMLInputElement).value;
		const password = (form.elements.namedItem('password') as HTMLInputElement).value;
		const res = await signIn('credentials', {
			redirect: false,
			email,
			password,
		});
		if (res?.error) {
			setError('Invalid email or password');
			setLoading(false);
		} else if (res?.ok) {
			router.push('/students');
		}
	}

	return (
		<div className="h-screen w-screen flex border-2 border-[#3D4756] overflow-hidden" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			{/* Left Panel - Form */}
			<div className="w-[50%] bg-white flex flex-col justify-center py-16 relative">
				{/* Heading */}
				<div className="mb-12 mt-16">
					<h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-snug text-center" style={{ color: '#3D4756' }}>
						Welcome
					</h1>
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
							<div className="text-sm mb-2" style={{ color: '#3D4756' }}>Password</div>
							<div className="relative">
								<input 
									name="password" 
									type={showPassword ? "text" : "password"}
									required 
									value={passwordValue}
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
					</div>

					{/* Remember me and Forgot password */}
					<div className="flex items-center justify-between">
						<label className="flex items-center cursor-pointer">
							<input
								type="checkbox"
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
								className="w-4 h-4 border rounded focus:ring-[#3D4756] appearance-none cursor-pointer"
								style={{
									borderColor: '#584b53',
									...(rememberMe ? { 
										backgroundColor: '#FEF5eF', 
										backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3E%3Cpath fill=\'%23584b53\' d=\'M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z\'/%3E%3C/svg%3E")',
										backgroundSize: 'contain',
										backgroundRepeat: 'no-repeat',
										backgroundPosition: 'center'
									} : {})
								}}
							/>
							<span className="ml-2 text-sm" style={{ color: '#3D4756' }}>Remember me</span>
						</label>
						<Link href="#" className="text-sm transition-colors" style={{ color: '#3D4756' }}>
							Forget password?
						</Link>
					</div>

					{error && <div className="text-sm text-red-600">{error}</div>}

					{/* Buttons */}
					<div className="flex gap-4 pt-4">
						<button 
							type="submit"
							disabled={loading} 
							className="flex-1 text-white px-6 py-3 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
							style={{ backgroundColor: '#4A5568' }}
						>
							{loading ? 'Signing in…' : 'Login'}
						</button>
						<Link
							href="/signup"
							className="flex-1 bg-white border-2 px-6 py-3 rounded-lg font-semibold text-base hover:bg-gray-50 transition-colors duration-200 text-center shadow-sm"
							style={{ borderColor: '#6B7280', color: '#6B7280' }}
						>
							Sign up
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


