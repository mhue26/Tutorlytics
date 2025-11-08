import Image from "next/image";

import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import AnimatedText from "./AnimatedText";

export const metadata = {
	title: "Tutorlytics — Modern Platform for Private Tutors",
	description: "Manage your scheduling, billing, and students — all in one place.",
};

export default async function Home() {
	const session = await getServerSession(authOptions);
	return (
		<div className="font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<section className="min-h-screen flex flex-col items-start justify-center" style={{ backgroundColor: '#D6E3F8', width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', marginTop: '-5rem' }}>
				<div 
					className="absolute top-0 right-0 w-1/2 h-full bg-white hidden lg:block"
					style={{ clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)' }}
				></div>
				<div className="relative z-10 w-full">
					<div className="px-48">
						<div className="w-20 h-2 bg-white rounded-full mb-4"></div>
						<AnimatedText 
							text="Students First"
							className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-snug text-left text-[#3D4756]"
							delay={500}
						/>
						<button className="mt-8 bg-[#3D4756] text-white px-6 py-3 rounded-lg font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200">
							Get Started
						</button>
					</div>
				</div>
			</section>

			<section id="features" className="bg-white py-16 lg:py-24" style={{ width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)' }}>
				<div className="mx-auto max-w-7xl px-4 space-y-16">
				{[
					{ title: "Lesson Scheduling", points: [
						"Drag-and-drop calendar with conflicts prevention",
						"Automated reminders via email/SMS",
						"Recurring lessons and availability blocks",
						"Sync with Google/Apple calendars",
					]},
					{ title: "Student & Contact Management", points: [
						"Unified profiles with notes and tags",
						"Parent/guardian relationships",
						"Quick filters and saved segments",
						"Import/export CSV",
					]},
					{ title: "Invoicing & Payments", points: [
						"Auto-generate invoices from lessons",
						"Online payments with Stripe",
						"Payment plans and dunning",
						"Export to bookkeeping",
					]},
					{ title: "Website Builder / Student Portal", points: [
						"Customizable pages and branding",
						"Student portal for schedules and payments",
						"Forms and lead capture",
						"SEO-friendly templates",
					]},
					{ title: "Workflow Automation / Self-Booking", points: [
						"Self-service booking links",
						"Lesson confirmation flows",
						"Zapier and webhooks",
						"Templates and reusable workflows",
					]},
				].map((m, i) => (
					<div key={m.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'lg:[&>div:first-child]:order-last' : ''}`}>
						<div data-fade>
							<h3 className="text-2xl font-semibold">{m.title}</h3>
							<ul className="mt-4 space-y-2 text-gray-700 list-disc list-inside">
								{m.points.map((p) => (<li key={p}>{p}</li>))}
							</ul>
							<figure className="mt-6 border-l-4 border-gray-200 pl-4 text-sm text-gray-600">
								<blockquote>"I saved hours every week and grew my studio."</blockquote>
								<figcaption className="mt-2 font-medium">Jane Doe, Music Studio Owner</figcaption>
							</figure>
						</div>
					</div>
				))}
				</div>
			</section>


		</div>
	);
}
