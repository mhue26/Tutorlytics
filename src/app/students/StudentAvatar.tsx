"use client";

import Link from "next/link";

const AVATAR_COLORS = [
  "#5B7C99", // slate blue
  "#6B8E6B", // sage
  "#9B7EBD", // lavender
  "#C17F59", // terracotta
  "#4A90A4", // teal
  "#B8860B", // dark goldenrod
  "#7B68A6", // muted purple
  "#2E7D62", // forest
  "#A0522D", // sienna
  "#5C6BC0", // indigo
  "#00897B", // teal green
  "#6D4C41", // brown
];

function getInitials(firstName: string, lastName: string): string {
  const first = (firstName?.trim() || "").charAt(0).toUpperCase();
  const last = (lastName?.trim() || "").charAt(0).toUpperCase();
  if (first && last) return `${first}${last}`;
  if (first) return first;
  if (last) return last;
  return "?";
}

function getBackgroundColor(studentId: number): string {
  const index = Math.abs(studentId) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

type StudentAvatarProps = {
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  studentId: number;
  /** When false, renders the avatar without a link (e.g. in dropdowns) */
  link?: boolean;
  /** Avatar size in px; default 40 */
  size?: number;
};

const DEFAULT_SIZE = 40;

export default function StudentAvatar({
  firstName,
  lastName,
  imageUrl,
  studentId,
  link = true,
  size = DEFAULT_SIZE,
}: StudentAvatarProps) {
  const initials = getInitials(firstName, lastName);
  const backgroundColor = getBackgroundColor(studentId);

  const circle = (
    <span
      className="flex items-center justify-center rounded-full text-sm font-semibold text-white shrink-0"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        fontSize: size <= 24 ? "0.6rem" : "0.875rem",
        backgroundColor: imageUrl ? undefined : backgroundColor,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}
    </span>
  );

  if (link) {
    return (
      <Link
        href={`/students/${studentId}`}
        className="inline-flex shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3D4756] focus:ring-offset-2"
        aria-label="View student profile"
      >
        {circle}
      </Link>
    );
  }

  return <span className="inline-flex shrink-0">{circle}</span>;
}
