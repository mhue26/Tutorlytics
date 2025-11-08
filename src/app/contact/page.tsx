import ContactForm from './ContactForm';

export default function ContactPage() {
	return (
		<div className="pt-8">
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Contact</h1>
			</div>
			
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="w-full">
					<ContactForm />
				</div>
				
				<div className="w-full bg-white rounded-2xl shadow-sm p-6">
					<h2 className="text-lg font-semibold text-gray-900 mb-4">Other Ways to Reach Us</h2>
					<div className="space-y-3 text-sm text-gray-600">
						<div>
							<strong>Email:</strong> support@tutortools.com
						</div>
						<div>
							<strong>Response Time:</strong> We typically respond within 24 hours
						</div>
						<div>
							<strong>Business Hours:</strong> Monday - Friday, 9 AM - 6 PM EST
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
