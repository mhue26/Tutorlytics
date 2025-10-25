import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";

export default async function BillingPage() {
	const session = await getServerSession(authOptions);
	
	if (!session?.user) {
		return (
			<div className="space-y-2">
				<div className="text-sm text-gray-600">You must sign in to view invoicing information.</div>
				<a href="/signin" className="text-blue-600 hover:underline">Sign in</a>
			</div>
		);
	}

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div>
				<h1 className="text-2xl font-semibold">Invoicing</h1>
			</div>

			{/* Main Content Grid */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Left Column - Quick Actions */}
				<div className="space-y-4 flex flex-col">
					<button className="flex-1 rounded-lg bg-blue-600/80 text-white p-4 hover:bg-blue-700/80 text-left transition-colors">
						<div className="flex items-center mb-2">
							<svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
							<h2 className="font-medium text-white">Create Invoice</h2>
						</div>
					</button>
					<button className="flex-1 rounded-lg bg-green-600/80 text-white p-4 hover:bg-green-700/80 text-left transition-colors">
						<div className="flex items-center mb-2">
							<svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							<h2 className="font-medium text-white">View Invoices</h2>
						</div>
					</button>
					<button className="flex-1 rounded-lg bg-purple-600/80 text-white p-4 hover:bg-purple-700/80 text-left transition-colors">
						<div className="flex items-center mb-2">
							<svg className="w-5 h-5 text-white mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
							<h2 className="font-medium text-white">Payment Tracking</h2>
						</div>
					</button>
				</div>

				{/* Right Column - Recent Invoices */}
				<div className="bg-white rounded-lg border p-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-medium">Recent Invoices</h2>
					<button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
				</div>
				<div className="text-center py-8">
					<div className="text-gray-400 mb-4">
						<svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
						</svg>
					</div>
					<h3 className="text-lg font-medium mb-4" style={{ color: '#A1ACBD' }}>No invoices yet</h3>
					<div className="mt-4">
						<button className="inline-flex items-center px-6 py-3 bg-[#3D4756] text-white rounded-lg font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200">
							Create Invoice
						</button>
					</div>
				</div>
				</div>
			</div>

			{/* Invoice Templates */}
			<div className="bg-white rounded-lg border p-6">
				<h2 className="text-lg font-medium mb-4">Invoice Templates</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="border rounded-lg p-4">
						<h3 className="font-medium text-gray-900 mb-2">Single Lesson</h3>
						<p className="text-sm text-gray-600 mb-3">Perfect for one-time lessons or make-up sessions.</p>
						<button className="text-sm text-blue-600 hover:text-blue-700">Use Template</button>
					</div>
					<div className="border rounded-lg p-4">
						<h3 className="font-medium text-gray-900 mb-2">Monthly Package</h3>
						<p className="text-sm text-gray-600 mb-3">Ideal for regular weekly or monthly lesson packages.</p>
						<button className="text-sm text-blue-600 hover:text-blue-700">Use Template</button>
					</div>
				</div>
			</div>

		</div>
	);
}
