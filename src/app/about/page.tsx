export default function AboutPage() {
	return (
		<div className="w-full space-y-0" style={{ backgroundColor: '#EFFAFF', width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', marginTop: '-5.5rem' }}>
			{/* About Us Section - Text Left, Image Right */}
			<div className="pt-24 pb-16 px-8 md:px-16">
				<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
					<div>
						<h2 className="text-5xl font-bold text-gray-900 mb-6">About Us</h2>
						<p className="text-lg text-gray-700 leading-relaxed">
							Tutorlytics's company and culture are a lot like our product. They're crafted, not cobbled, for a delightful experience.
						</p>
					</div>
					<div>
						<div className="rounded-2xl shadow-sm overflow-hidden bg-gray-200 aspect-[16/9] flex items-center justify-center">
							{/* Placeholder for image - replace with actual image */}
							<span className="text-gray-400">Image placeholder</span>
						</div>
					</div>
				</div>
			</div>

			{/* Our Mission Section - Image Left, Text Right */}
			<div className="py-16 px-8 md:px-16 bg-white">
				<div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
					<div className="order-2 md:order-1">
						<div className="rounded-2xl shadow-sm overflow-hidden bg-gray-200 aspect-[16/9] flex items-center justify-center">
							{/* Placeholder for image - replace with actual image */}
							<span className="text-gray-400">Image placeholder</span>
						</div>
					</div>
					<div className="order-1 md:order-2">
						<h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission: Helping Millions of Tutors Grow Better</h2>
						<p className="text-lg text-gray-700 leading-relaxed">
							We believe not just in growing bigger, but in growing better. And growing better means aligning the success of your own business with the success of your students. Win-win!
						</p>
					</div>
				</div>
			</div>

			{/* CTA Section */}
			<div className="py-16 px-8 md:px-16 text-center bg-white" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
				<div className="max-w-7xl mx-auto">
					<h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to Transform Your Tutoring Business?</h2>
					<p className="text-gray-700 mb-6">
						Join thousands of tutors who are already using Tutorlytics to grow their businesses.
					</p>
					<div className="flex justify-center">
						<a href="/signup" className="rounded bg-[#3D4756] text-white px-6 py-3 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200">
							Join Today
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
