"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import SubjectsDisplay from "./SubjectsDisplay";
import StatusIndicator from "./StatusIndicator";

type StudentItem = {
	id: string;
	firstName: string;
	lastName: string;
	email: string | null;
	phone: string | null;
	subjects: string | null;
	hourlyRateCents: number;
	year?: number | null;
	isArchived: boolean;
	updatedAt?: string | Date;
};

type Filter = {
    id: string;
    field: 'year' | 'subjects' | 'isArchived';
    condition: 'is' | 'isNot' | 'contains' | 'doesNotContain' | 'isGreaterThan' | 'isLessThan';
    value: any;
};

const StudentAvatar = ({ student }: { student: StudentItem }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const initial = student.firstName ? student.firstName.charAt(0).toUpperCase() : '?';
    const colors = ['bg-blue-200', 'bg-green-200', 'bg-yellow-200', 'bg-purple-200', 'bg-red-200'];
    const color = colors[String(student.id).charCodeAt(0) % colors.length];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setShowMenu(!showMenu)}
                className={`w-8 h-8 rounded-full ${color} flex items-center justify-center font-bold text-gray-700 hover:scale-105 transition-transform cursor-pointer`}
            >
                {initial}
            </button>
            
            {showMenu && (
                <div className="absolute top-10 left-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[9999] min-w-[120px]">
                    <Link
                        href={`/students/${student.id}/edit`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowMenu(false)}
                    >
                        Edit
                    </Link>
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => {
                            // Archive functionality would go here
                            setShowMenu(false);
                        }}
                    >
                        Archive
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        onClick={() => {
                            // Delete functionality would go here
                            setShowMenu(false);
                        }}
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

function formatCurrencyFromCents(valueInCents: number): string {
	const dollars = (valueInCents / 100).toFixed(2);
	return `$${dollars}`;
}

export default function StudentsClient({ students, archivedStudents }: { students: StudentItem[], archivedStudents: StudentItem[] }) {
	const allStudents = useMemo(() => [...students, ...archivedStudents], [students, archivedStudents]);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);

    const handleSort = (field: string) => {
        if (sortField !== field) {
            // First click: set new field and ascending
            setSortField(field);
            setSortDirection('asc');
        } else if (sortDirection === 'asc') {
            // Second click: change to descending
            setSortDirection('desc');
        } else {
            // Third click: remove sort
            setSortField(null);
            setSortDirection(null);
        }
    };

    const filteredStudents = useMemo(() => {
        let result = allStudents;

        // Apply filters
        if (filters.length > 0) {
            result = allStudents.filter(student => {
                return filters.every(filter => {
                    const { field, condition, value } = filter;
                    const studentValue = student[field as keyof StudentItem];

                    switch (condition) {
                        case 'is':
                            return studentValue == value;
                        case 'isNot':
                            return studentValue != value;
                        case 'contains':
                            return typeof studentValue === 'string' && studentValue.toLowerCase().includes(value.toLowerCase());
                        case 'doesNotContain':
                            return typeof studentValue === 'string' && !studentValue.toLowerCase().includes(value.toLowerCase());
                        case 'isGreaterThan':
                            return typeof studentValue === 'number' && studentValue > value;
                        case 'isLessThan':
                            return typeof studentValue === 'number' && studentValue < value;
                        default:
                            return true;
                    }
                });
            });
        }

        // Apply sorting
        if (sortField && sortDirection) {
            result = [...result].sort((a, b) => {
                let aValue: any;
                let bValue: any;

                switch (sortField) {
                    case 'record':
                        aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                        bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                        break;
                    case 'subjects':
                        aValue = (a.subjects || '').toLowerCase();
                        bValue = (b.subjects || '').toLowerCase();
                        break;
                    case 'year':
                        aValue = a.year ?? -1;
                        bValue = b.year ?? -1;
                        break;
                    case 'hourlyRate':
                        aValue = a.hourlyRateCents;
                        bValue = b.hourlyRateCents;
                        break;
                    case 'status':
                        aValue = a.isArchived ? 1 : 0;
                        bValue = b.isArchived ? 1 : 0;
                        break;
                    default:
                        return 0;
                }

                if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return result;
    }, [allStudents, filters, sortField, sortDirection]);

	return (
		<div className="space-y-6 pt-8 font-sans" style={{ fontFamily: "'Work Sans', sans-serif", backgroundColor: '#EFFAFF' }}>
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-semibold text-[#3D4756]">Students</h2>
				<div className="flex items-center gap-2">
					<button className="px-4 py-2 bg-white rounded-md shadow-sm border border-gray-200 text-sm font-medium hover:bg-gray-50">
						Add Filter
					</button>
					<Link
						className="rounded-md bg-[#3D4756] text-white p-2 font-semibold text-base hover:bg-[#2A3441] transition-colors duration-200"
						href="/students/new"
						title="Add Student"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
					</Link>
				</div>
			</div>

            {isFilterOpen && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-2">
                        {/* Form to add a new filter */}
                    </div>
                </div>
            )}

            {filters.length > 0 && (
                <div className="p-4 flex items-center gap-2">
                    {filters.map(filter => (
                        <div key={filter.id} className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-1 text-xs">
                            <span>{filter.field} {filter.condition} {filter.value.toString()}</span>
                            <button onClick={() => setFilters(filters.filter(f => f.id !== filter.id))} className="text-gray-500 hover:text-gray-800">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}

			<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
				<table className="w-full text-left text-sm">
					<thead className="bg-[#3D4756] border-b border-gray-200">
						<tr>
							<th 
								className="px-4 py-3 font-medium text-white cursor-pointer hover:bg-[#4A5568] transition-colors select-none"
								onClick={() => handleSort('record')}
							>
								<div className="flex items-center gap-2">
									<span>Name</span>
									<span className="text-xs w-3 inline-block text-center">
										{sortField === 'record' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
							</th>
							<th 
								className="px-4 py-3 font-medium text-white cursor-pointer hover:bg-[#4A5568] transition-colors select-none"
								onClick={() => handleSort('subjects')}
							>
								<div className="flex items-center gap-2">
									<span>Subjects</span>
									<span className="text-xs w-3 inline-block text-center">
										{sortField === 'subjects' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
							</th>
							<th 
								className="px-4 py-3 font-medium text-white cursor-pointer hover:bg-[#4A5568] transition-colors select-none"
								onClick={() => handleSort('year')}
							>
								<div className="flex items-center gap-2">
									<span>Year Level</span>
									<span className="text-xs w-3 inline-block text-center">
										{sortField === 'year' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
							</th>
							<th 
								className="px-4 py-3 font-medium text-white cursor-pointer hover:bg-[#4A5568] transition-colors select-none"
								onClick={() => handleSort('hourlyRate')}
							>
								<div className="flex items-center gap-2">
									<span>Hourly Rate</span>
									<span className="text-xs w-3 inline-block text-center">
										{sortField === 'hourlyRate' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
							</th>
							<th 
								className="px-4 py-3 font-medium text-white cursor-pointer hover:bg-[#4A5568] transition-colors select-none"
								onClick={() => handleSort('status')}
							>
								<div className="flex items-center gap-2">
									<span>Status</span>
									<span className="text-xs w-3 inline-block text-center">
										{sortField === 'status' ? (sortDirection === 'asc' ? '↑' : '↓') : '\u00A0'}
									</span>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						{filteredStudents.map((s) => (
							<tr key={s.id} className="border-t border-gray-200 hover:bg-gray-50">
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<StudentAvatar student={s} />
										<Link className="font-medium text-gray-800 hover:underline" href={`/students/${s.id}`}>
											{s.firstName} {s.lastName}
										</Link>
									</div>
								</td>
								<td className="px-4 py-3">
									<SubjectsDisplay subjects={s.subjects || ""} />
								</td>
								<td className="px-4 py-3 text-sm text-gray-900">
									{s.year || '—'}
								</td>
								<td className="px-4 py-3">{formatCurrencyFromCents(s.hourlyRateCents)}</td>
								<td className="px-4 py-3">
                                    <StatusIndicator isActive={!s.isArchived} />
                                </td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}


