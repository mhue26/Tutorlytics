import React from 'react';

interface YearLevelStarsProps {
  yearLevel: number | null | undefined;
  maxStars?: number;
}

const YearLevelStars: React.FC<YearLevelStarsProps> = ({ yearLevel, maxStars = 12 }) => {
  if (yearLevel === null || yearLevel === undefined) {
    return <span className="text-gray-400">—</span>;
  }

  const filledStars = Math.min(Math.max(yearLevel, 0), maxStars);
  const emptyStars = maxStars - filledStars;

  return (
    <div className="flex items-center">
      {[...Array(filledStars)].map((_, i) => (
        <svg key={`filled-${i}`} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
};

export default YearLevelStars;
