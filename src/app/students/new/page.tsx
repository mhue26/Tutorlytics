import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireOrgContext } from "@/utils/auth";
import SubjectsMultiSelect from "../SubjectsMultiSelect";
import ParentInformationClient from "./ParentInformationClient";
import Link from "next/link";

async function createStudent(formData: FormData) {
	"use server";
	const ctx = await requireOrgContext();

	const firstName = String(formData.get("firstName") || "").trim();
	const lastName = String(formData.get("lastName") || "").trim();
	const emailValue = String(formData.get("email") || "").trim();
	const email = emailValue || undefined;

	const contacts = [];
	let contactIndex = 1;
	while (formData.get(`contactMethod${contactIndex}`)) {
		const method = String(formData.get(`contactMethod${contactIndex}`) || "").trim();
		const details = String(formData.get(`contactDetails${contactIndex}`) || "").trim();
		if (method && details) {
			contacts.push(`${method}: ${details}`);
		}
		contactIndex++;
	}
	const phone = contacts.length > 0 ? contacts.join(" | ") : null;

	const subjects = String(formData.get("subjects") || "").trim();
	const schoolSubjects = String(formData.get("schoolSubjects") || "").trim() || null;
	const year = Number(String(formData.get("year") || "0")) || null;
	const school = String(formData.get("school") || "").trim() || null;
	const hourlyRateRaw = String(formData.get("hourlyRate") || "").trim();
	let hourlyRateCents = 0;
	if (!hourlyRateRaw) {
		const prefs = await prisma.organisationPreferences.findUnique({
			where: { organisationId: ctx.organisationId },
			select: { defaultStudentRateCents: true },
		});
		hourlyRateCents = prefs?.defaultStudentRateCents ?? 0;
	} else {
		const hourlyRate = Number(hourlyRateRaw);
		hourlyRateCents =
			Number.isNaN(hourlyRate) || hourlyRate < 0 ? 0 : Math.round(hourlyRate * 100);
	}

	const meetingLocationType = String(formData.get("meetingLocationType") || "").trim();
	const meetingLocationDetails = String(formData.get("meetingLocationDetails") || "").trim();
	const meetingPlatform = String(formData.get("meetingPlatform") || "").trim();

	let meetingLocation = null;
	if (meetingLocationType === "In-Person" && meetingLocationDetails) {
		meetingLocation = meetingLocationDetails;
	} else if (meetingLocationType === "Online" && meetingPlatform) {
		meetingLocation = meetingPlatform;
	}

	const notes = String(formData.get("notes") || "").trim() || null;

	const parentRelationship = String(formData.get("parentRelationship") || "").trim() || null;
	const parentRelationshipOther = String(formData.get("parentRelationshipOther") || "").trim();
	const finalRelationship = parentRelationship === "Other" && parentRelationshipOther
		? parentRelationshipOther
		: parentRelationship;
	const parentName = parentRelationship === "N/A" ? null : String(formData.get("parentName") || "").trim() || null;
	const parentContactMethod = String(formData.get("parentContactMethod") || "").trim();
	const parentContactDetails = String(formData.get("parentContactDetails") || "").trim();
	const parentContact = (parentContactMethod && parentContactDetails) ? `${parentContactMethod}: ${parentContactDetails}` : null;

	await prisma.student.create({
		data: {
			firstName,
			lastName,
			email,
			phone,
			subjects,
			schoolSubjects,
			year,
			school,
			hourlyRateCents,
			meetingLocation,
			notes,
			parentName,
			parentEmail: finalRelationship,
			parentPhone: parentContact,
			organisationId: ctx.organisationId,
		},
	});

	redirect("/students");
}

export default function NewStudentPage() {
	return (
		<div className="space-y-6 pt-8">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold">Add Student</h2>
				<Link href="/students" className="text-sm text-gray-600 hover:underline">← Back to students</Link>
			</div>

			<form action={createStudent} className="space-y-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-white p-6 rounded-2xl shadow-sm">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
						<div className="space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<label className="block">
									<div className="text-sm text-gray-700">First name</div>
									<input name="firstName" required className="mt-1 w-full border rounded-md px-3 py-2" />
								</label>
								<label className="block">
									<div className="text-sm text-gray-700">Last name</div>
									<input name="lastName" className="mt-1 w-full border rounded-md px-3 py-2" />
								</label>
							</div>
							<label className="block">
								<div className="text-sm text-gray-700">Email</div>
								<input type="email" name="email" className="mt-1 w-full border rounded-md px-3 py-2" />
							</label>
							<div>
								<div className="text-sm text-gray-700 mb-3">Alternative Contact</div>
								<div className="space-y-3" id="alternative-contacts">
									<div className="flex gap-2">
										<select name="contactMethod1" className="flex-1 border rounded-md px-3 py-2">
											<option value="">Select method</option>
											<option value="Phone">Phone</option>
											<option value="WhatsApp">WhatsApp</option>
											<option value="Instagram">Instagram</option>
											<option value="WeChat">WeChat</option>
										</select>
										<input name="contactDetails1" placeholder="Enter contact details" className="flex-1 border rounded-md px-3 py-2" />
									</div>
								</div>
							</div>
						</div>
					</div>

					<ParentInformationClient />

					<div className="bg-white p-6 rounded-2xl shadow-sm">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Academic Information</h3>
						<div className="space-y-4">
							<label className="block">
								<div className="text-sm text-gray-700">School Subjects</div>
								<SubjectsMultiSelect name="schoolSubjects" />
							</label>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<label className="block sm:col-span-2">
									<div className="text-sm text-gray-700">School</div>
									<input name="school" type="text" placeholder="Enter school name" className="mt-1 w-full border rounded-md px-3 py-2" />
								</label>
								<label className="block">
									<div className="text-sm text-gray-700">Year</div>
									<select name="year" className="mt-1 w-full border rounded-md px-3 py-2">
										<option value="">Select year</option>
										{Array.from({ length: 12 }, (_, i) => i + 1).map(year => (
											<option key={year} value={year}>Year {year}</option>
										))}
									</select>
								</label>
							</div>
						</div>
					</div>

					<div className="bg-white p-6 rounded-2xl shadow-sm">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Lesson Information</h3>
						<div className="space-y-4">
							<label className="block">
								<div className="text-sm text-gray-700">Subjects</div>
								<SubjectsMultiSelect name="subjects" />
							</label>
							<label className="block">
								<div className="text-sm text-gray-700">Hourly rate</div>
								<input name="hourlyRate" type="number" step="0.01" min="0" className="mt-1 w-full border rounded-md px-3 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
							</label>
							<div className="block">
								<div className="text-sm text-gray-700">Mode</div>
								<select name="meetingLocationType" className="mt-1 w-full border rounded-md px-3 py-2" id="locationTypeSelect">
									<option value="">Select location type</option>
									<option value="In-Person">In-Person</option>
									<option value="Online">Online</option>
								</select>
							</div>
							<div id="locationDetails" className="block" style={{display: "none"}}>
								<div className="text-sm text-gray-700">Location</div>
								<input id="location-input" name="meetingLocationDetails" type="text" className="mt-1 w-full border rounded-md px-3 py-2" />
							</div>
							<div id="platformDetails" className="block" style={{display: "none"}}>
								<div className="text-sm text-gray-700">Platform</div>
								<select name="meetingPlatform" className="mt-1 w-full border rounded-md px-3 py-2">
									<option value="">Select platform</option>
									<option value="Zoom">Zoom</option>
									<option value="Google Meet">Google Meet</option>
									<option value="Microsoft Teams">Microsoft Teams</option>
									<option value="Webex">Webex</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 pt-4">
					<button type="submit" className="inline-flex items-center px-6 py-3 bg-[#3D4756] text-white rounded-2xl font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200">Save</button>
					<Link href="/students" className="text-sm text-gray-600 hover:underline">Cancel</Link>
				</div>
			</form>
		</div>
	);
}
