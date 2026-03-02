"use client";

interface DonutSegment {
	label: string;
	value: number;
	color: string;
	subLabel?: string;
}

interface DonutChartProps {
	segments: DonutSegment[];
	total: number;
	centerLabel?: string;
}

export default function DonutChart({ segments, total, centerLabel = "Total" }: DonutChartProps) {
	const size = 160;
	const strokeWidth = 22;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;
	const cx = size / 2;
	const cy = size / 2;

	let cumulativePercent = 0;
	const arcs = segments.map((seg) => {
		const percent = total > 0 ? seg.value / total : 0;
		const dashArray = `${circumference * percent} ${circumference * (1 - percent)}`;
		const rotation = -90 + cumulativePercent * 360;
		cumulativePercent += percent;
		return { ...seg, dashArray, rotation };
	});

	return (
		<div className="flex flex-col items-center gap-4">
			<div className="relative" style={{ width: size, height: size }}>
				<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
					<circle
						cx={cx}
						cy={cy}
						r={radius}
						fill="none"
						stroke="#f3f4f6"
						strokeWidth={strokeWidth}
					/>
					{arcs.map((arc, i) => (
						<circle
							key={i}
							cx={cx}
							cy={cy}
							r={radius}
							fill="none"
							stroke={arc.color}
							strokeWidth={strokeWidth}
							strokeDasharray={arc.dashArray}
							strokeDashoffset={0}
							strokeLinecap="round"
							transform={`rotate(${arc.rotation} ${cx} ${cy})`}
							className="transition-all duration-700 ease-out"
						/>
					))}
				</svg>
				<div className="absolute inset-0 flex flex-col items-center justify-center">
					<span className="text-xs text-gray-400 font-medium">{centerLabel}</span>
					<span className="text-3xl font-bold text-gray-900">{total}</span>
				</div>
			</div>
			<div className="flex items-center gap-6">
				{segments.map((seg, i) => (
					<div key={i} className="flex items-center gap-2">
						<span
							className="h-3 w-3 rounded-full"
							style={{ backgroundColor: seg.color }}
						/>
						<div>
							<span className="text-sm font-semibold text-gray-800">
								{seg.value} {seg.label}
							</span>
							{seg.subLabel && (
								<p className="text-xs text-gray-500">{seg.subLabel}</p>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
