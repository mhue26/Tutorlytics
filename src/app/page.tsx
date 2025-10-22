import Image from "next/image";

import { authOptions } from "@/utils/auth";
import { getServerSession } from "next-auth";
import AnimatedText from "./AnimatedText";

export const metadata = {
	title: "TutorTools — Modern Platform for Private Tutors",
	description: "Manage your scheduling, billing, and students — all in one place.",
};

export default async function Home() {
	const session = await getServerSession(authOptions);
	return (
		<div className="font-sans" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<section className="min-h-screen flex flex-col items-center justify-center" style={{ backgroundColor: '#D6E3F8', width: '100vw', marginLeft: 'calc(-50vw + 50%)', marginRight: 'calc(-50vw + 50%)', marginTop: '-5rem' }}>
				<div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4 items-center mb-12">
					<div className="px-24 lg:px-32">
						<AnimatedText 
							text="On a mission to student-first teaching."
							className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-snug"
							delay={300}
						/>
					</div>
					<div className="relative px-8 lg:px-16" data-fade>
						<div className="aspect-[16/10] rounded-xl border bg-white shadow-sm" />
						<div className="absolute -bottom-4 right-4 w-32 aspect-[3/2] rounded-xl border bg-white shadow-sm hidden sm:block" />
						<div className="absolute -top-4 left-4 w-24 aspect-[3/2] rounded-xl border bg-white shadow-sm hidden sm:block" />
					</div>
				</div>
			</section>

			<section id="features" className="mx-auto max-w-7xl px-4 py-16 lg:py-24 space-y-16">
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
							<div className="mt-6 rounded-xl border bg-white aspect-[16/10]" />
							<figure className="mt-4 border-l-4 border-gray-200 pl-4 text-sm text-gray-600">
								<blockquote>“I saved hours every week and grew my studio.”</blockquote>
								<figcaption className="mt-2 font-medium">Jane Doe, Music Studio Owner</figcaption>
							</figure>
						</div>
						<div data-fade>
							<div className="rounded-xl border bg-white shadow-sm aspect-[4/3]" />
						</div>
					</div>
				))}
			</section>


		</div>
	);
}
