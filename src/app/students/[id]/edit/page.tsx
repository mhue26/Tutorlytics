import { notFound, redirect } from "next/navigation";
import { requireOrgContext } from "@/utils/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ParentInformationClient from "./ParentInformationClient";
import SubjectsMultiSelect from "../../SubjectsMultiSelect";
import EditStudentClient from "./EditStudentClient";
import EditStudentTabs from "./EditStudentTabs";
import ClassSelector from "../../ClassSelector";
import StudentDiscountsClient from "./StudentDiscountsClient";

const INPUT = "mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm focus:border-[#3D4756] focus:ring-1 focus:ring-[#3D4756] focus:outline-none";
const LABEL = "block text-sm font-medium text-gray-700";
const SELECT = "mt-1.5 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm shadow-sm bg-white focus:border-[#3D4756] focus:ring-1 focus:ring-[#3D4756] focus:outline-none";

async function updateStudent(id: number, formData: FormData) {
	"use server";
	await requireOrgContext();
	
	const fullName = String(formData.get("fullName") || "").trim();
	const nameParts = fullName.split(" ");
	const firstName = nameParts[0] || "";
	const lastName = nameParts.slice(1).join(" ") || "";
	const emailValue = String(formData.get("email") || "").trim();
	const email = emailValue || undefined;
	// Process multiple alternative contacts
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
	const studentPhone = contacts.length > 0 ? contacts.join(" | ") : null;
	const subjects = String(formData.get("subjects") || "").trim();
	const schoolSubjects = String(formData.get("schoolSubjects") || "").trim() || null;
	const year = Number(String(formData.get("year") || "0")) || null;
	const school = String(formData.get("school") || "").trim() || null;
	const hourlyRate = Number(String(formData.get("hourlyRate") || "0"));
	const classId = Number(String(formData.get("classId") || "0")) || null;
	
	// Handle meeting location based on type
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
	const studentSince = String(formData.get("studentSince") || "");
	
	// Parent information (multiple parents, stored with " || " delimiter)
	const PARENT_DELIMITER = " || ";
	const parentCount = Math.max(1, Number(formData.get("parentCount") || 1));
	const parentNames: string[] = [];
	const parentRelationships: string[] = [];
	const parentPhones: string[] = [];
	for (let i = 0; i < parentCount; i++) {
		const rel = String(formData.get(`parentRelationship_${i}`) || "").trim();
		const relOther = String(formData.get(`parentRelationshipOther_${i}`) || "").trim();
		const finalRel = rel === "Other" && relOther ? relOther : rel;
		parentRelationships.push(finalRel || "");
		const name = rel === "N/A" ? "" : String(formData.get(`parentName_${i}`) || "").trim();
		parentNames.push(name);
		const method = String(formData.get(`parentContactMethod_${i}`) || "").trim();
		const details = String(formData.get(`parentContactDetails_${i}`) || "").trim();
		const parentContactEntries: string[] = [];
		if (method && details) parentContactEntries.push(`${method}: ${details}`);
		let j = 0;
		while (formData.get(`alternativeContactMethod-${i}-${j}`) !== null) {
			const m = String(formData.get(`alternativeContactMethod-${i}-${j}`) || "").trim();
			const d = String(formData.get(`alternativeContactDetails-${i}-${j}`) || "").trim();
			if (m && d) parentContactEntries.push(`${m}: ${d}`);
			j++;
		}
		parentPhones.push(parentContactEntries.join(" | "));
	}
	const parentName = parentNames.length > 0 ? parentNames.join(PARENT_DELIMITER) : null;
	const finalRelationship = parentRelationships.length > 0 ? parentRelationships.join(PARENT_DELIMITER) : null;
	const parentContact = parentPhones.length > 0 ? parentPhones.join(PARENT_DELIMITER) : null;
	
	
	try {
		await prisma.student.update({
			where: { id },
			data: {
				firstName,
				lastName,
				email,
				phone: studentPhone,
				subjects,
				schoolSubjects,
				year,
				school,
				hourlyRateCents: Math.round(hourlyRate * 100),
				meetingLocation,
				createdAt: new Date(studentSince),
				parentName,
				parentEmail: finalRelationship,
				parentPhone: parentContact,
				notes: notes,
				classId,
			},
		});
		
		redirect(`/students/${id}`);
	} catch (error) {
		console.error("Error updating student:", error);
		throw error;
	}
}

export default async function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
	const ctx = await requireOrgContext();

	const { id } = await params;
	const studentId = parseInt(id);

	if (isNaN(studentId)) {
		notFound();
	}

	const [student, billingSettings] = await Promise.all([
		prisma.student.findUnique({
			where: { id: studentId },
			include: {
				discounts: { select: { discountId: true } },
			},
		}),
		prisma.billingSettings.findUnique({
			where: { organisationId: ctx.organisationId },
			include: { discounts: { orderBy: { createdAt: "asc" } } },
		}),
	]);

	if (!student) {
		notFound();
	}

	const canEditBilling = ctx.role === "OWNER" || ctx.role === "ADMIN";
	const orgDiscounts = billingSettings?.discounts ?? [];
	const assignedDiscountIds = student.discounts.map((d) => d.discountId);

	// Parse contact information
	const contactInfos: { method: string; details: string }[] = [];
	if (student.phone) {
		const contacts = student.phone.split(" | ");
		contacts.forEach((contact) => {
			const [method, ...details] = contact.split(": ");
			if (method && details.length > 0) {
				contactInfos.push({
					method: method.trim(),
					details: details.join(": ").trim()
				});
			}
		});
	}

	// Ensure we have at least one contact field
	if (contactInfos.length === 0) {
		contactInfos.push({ method: "", details: "" });
	}

	// Parse multiple parents (stored with " || " delimiter)
	const PARENT_DELIMITER = " || ";
	const parentNames = (student.parentName || "").split(PARENT_DELIMITER).map((s) => s.trim());
	const parentRelationships = (student.parentEmail || "").split(PARENT_DELIMITER).map((s) => s.trim());
	const parentPhoneStrings = (student.parentPhone || "").split(PARENT_DELIMITER).map((s) => s.trim());
	const nParents = Math.max(1, parentNames.length, parentRelationships.length, parentPhoneStrings.length);
	const initialParents: {
		relationship: string;
		relationshipOther: string;
		name: string;
		preferredContact: { method: string; details: string };
		alternativeContacts: { method: string; details: string }[];
	}[] = [];
	for (let i = 0; i < nParents; i++) {
		const name = parentNames[i] ?? "";
		const rel = parentRelationships[i] ?? "";
		const isOther = rel && !["Mother", "Father", "N/A"].includes(rel);
		const phoneStr = parentPhoneStrings[i] ?? "";
		const contactEntries: { method: string; details: string }[] = [];
		if (phoneStr) {
			phoneStr.split(" | ").forEach((entry) => {
				const [method, ...details] = entry.split(": ");
				if (method && details.length > 0) {
					contactEntries.push({
						method: method.trim(),
						details: details.join(": ").trim()
					});
				}
			});
		}
		const preferred = contactEntries[0] ?? { method: "", details: "" };
		const alternative = contactEntries.slice(1);
		initialParents.push({
			relationship: isOther ? "Other" : rel,
			relationshipOther: isOther ? rel : "",
			name,
			preferredContact: preferred,
			alternativeContacts: alternative
		});
	}

	const classes = await prisma.class.findMany({
		where: { organisationId: ctx.organisationId },
		orderBy: { name: "asc" },
	});

	const updateStudentAction = updateStudent.bind(null, studentId);

	return (
		<div className="pt-8 pb-16" style={{ fontFamily: "'Work Sans', sans-serif" }}>
			<div className="px-4">

				{/* Page header */}
				<div className="mb-8">
					<Link
						href={`/students/${id}`}
						className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
					>
						← Back to student
					</Link>
					<h1 className="mt-1 text-2xl font-semibold text-[#3D4756]">Edit Student</h1>
				</div>

				<form id="edit-student-form" action={updateStudentAction}>
					<div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
						<EditStudentTabs labels={["Personal", "Parent", "Academic", "Lesson", "Billing"]}>
							{/* ── Tab 1: Personal ───────────────────────────────────────── */}
							<div className="p-8">
								<h2 className="text-base font-semibold text-gray-900">Personal information</h2>

								{/* Name */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Name</p>
									<input
										name="fullName"
										required
										defaultValue={`${student.firstName} ${student.lastName}`}
										className={INPUT}
										placeholder="First Last"
									/>
								</div>

								{/* Email */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Email address</p>
									<input
										type="email"
										name="email"
										defaultValue={student.email || ""}
										className={INPUT}
										placeholder="name@example.com"
									/>
								</div>

								{/* Alternative contacts */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Alternative contact</p>
									<div className="space-y-3" id="alternative-contacts">
										{contactInfos.map((contact, index) => (
											<div key={index + 1} className="flex gap-2">
												<select
													name={`contactMethod${index + 1}`}
													defaultValue={contact.method}
													className={`${SELECT} flex-1`}
												>
													<option value="">Select method</option>
													<option value="Phone">Phone</option>
													<option value="WhatsApp">WhatsApp</option>
													<option value="Instagram">Instagram</option>
													<option value="WeChat">WeChat</option>
												</select>
												<input
													name={`contactDetails${index + 1}`}
													defaultValue={contact.details}
													placeholder="Enter contact details"
													className={`${INPUT} mt-0 flex-1`}
												/>
												{index > 0 && (
													<button
														type="button"
														className="text-gray-400 hover:text-red-500 transition-colors p-2 self-center"
														onClick={() => {
															const element = (document.querySelector(`[name="contactMethod${index + 1}"]`) as HTMLElement)?.closest('.flex') as HTMLElement;
															element?.remove();
														}}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
														</svg>
													</button>
												)}
											</div>
										))}
										<button
											type="button"
											className="mt-1 text-sm font-medium text-[#3D4756] hover:text-[#2A3441] transition-colors add-contact-btn"
										>
											+ Add another contact
										</button>
									</div>
								</div>
							</div>

							{/* ── Tab 2: Parent ─────────────────────────────────────────── */}
							<div className="p-8">
								<ParentInformationClient initialParents={initialParents} />
							</div>

							{/* ── Tab 3: Academic ───────────────────────────────────────── */}
							<div className="p-8">
								<h2 className="text-base font-semibold text-gray-900">Academic information</h2>

								{/* School subjects */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>School subjects</p>
									<SubjectsMultiSelect name="schoolSubjects" defaultValue={student.schoolSubjects || ""} />
								</div>

								{/* School & Year */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<div>
										<p className={LABEL}>School &amp; year level</p>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<input
											name="school"
											type="text"
											defaultValue={student.school || ""}
											placeholder="School name"
											className={INPUT}
										/>
										<select name="year" defaultValue={student.year ?? ""} className={SELECT}>
											<option value="">Year level</option>
											{Array.from({ length: 12 }, (_, i) => i + 1).map((year) => (
												<option key={year} value={year}>
													Year {year}
												</option>
											))}
										</select>
									</div>
								</div>

								{/* Student since */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Student since</p>
									<input
										name="studentSince"
										type="date"
										defaultValue={new Date(student.createdAt).toISOString().split("T")[0]}
										className={INPUT}
									/>
								</div>

								{/* Class */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Class</p>
									<ClassSelector classes={classes} selectedClassId={student.classId} />
								</div>
							</div>

							{/* ── Tab 4: Lesson ─────────────────────────────────────────── */}
							<div className="p-8">
								<h2 className="text-base font-semibold text-gray-900">Lesson information</h2>

								{/* Lesson subjects */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Lesson subjects</p>
									<SubjectsMultiSelect name="subjects" defaultValue={student.subjects || ""} />
								</div>

								{/* Hourly rate */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Hourly rate</p>
									<div className="relative">
										<span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-sm">$</span>
										<input
											name="hourlyRate"
											type="number"
											step="0.01"
											min="0"
											defaultValue={student.hourlyRateCents / 100}
											className={`${INPUT} pl-7 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
											placeholder="0.00"
										/>
									</div>
								</div>

								{/* Mode */}
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Lesson mode</p>
									<div className="space-y-3">
										<select
											name="meetingLocationType"
											defaultValue={
												student.meetingLocation === "Online"
													? "Online"
													: student.meetingLocation
													? "In-Person"
													: ""
											}
											className={SELECT}
											id="locationTypeSelect"
										>
											<option value="">Select mode</option>
											<option value="In-Person">In-Person</option>
											<option value="Online">Online</option>
										</select>

										<div id="locationDetails" style={{ display: "none" }}>
											<input
												id="location-input"
												name="meetingLocationDetails"
												type="text"
												defaultValue=""
												placeholder="Enter address or location"
												className={INPUT}
											/>
										</div>

										<div id="platformDetails" style={{ display: "none" }}>
											<select
												name="meetingPlatform"
												defaultValue=""
												className={SELECT}
											>
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

							{/* ── Tab 5: Billing ─────────────────────────────────────────── */}
							<div className="p-8">
								<h2 className="text-base font-semibold text-gray-900">Billing &amp; discounts</h2>
								<div className="border-t border-gray-200 mt-6 pt-6 grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-start">
									<p className={LABEL}>Discounts</p>
									<StudentDiscountsClient
										studentId={studentId}
										orgDiscounts={orgDiscounts.map((d) => ({
											id: d.id,
											name: d.name,
											type: d.type,
											value: d.value,
										}))}
										assignedDiscountIds={assignedDiscountIds}
										canEdit={canEditBilling}
									/>
								</div>
							</div>
						</EditStudentTabs>
					</div>

					{/* Bottom action strip */}
					<div className="mt-6 flex justify-end gap-3">
						<Link
							href={`/students/${id}`}
							className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
						>
							Cancel
						</Link>
						<button
							type="submit"
							className="inline-flex items-center rounded-lg bg-[#3D4756] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#2A3441] transition-colors"
						>
							Save changes
						</button>
					</div>
				</form>

				{/* Client component for location toggles and Google Places */}
				<EditStudentClient meetingLocation={student.meetingLocation} />
			</div>
		</div>
	);
}
