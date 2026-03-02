"use client";

import InteractiveTimeSeriesChart from "./InteractiveTimeSeriesChart";

interface LineChartPoint {
	label: string;
	value: number;
}

interface LineChartProps {
	data: LineChartPoint[];
	lineColor?: string;
	fillColor?: string;
	height?: number;
}

export default function LineChart({
	data,
	lineColor = "#f59e0b",
	fillColor = "rgba(245,158,11,0.12)",
	height = 160,
}: LineChartProps) {
	return (
		<InteractiveTimeSeriesChart
			data={data}
			mode="lineArea"
			yAxisLabel="Hours"
			valueSuffix=" hrs"
			metricLabel="Lesson hours"
			color={lineColor}
			areaColor={fillColor}
			height={height}
			hideYTickLabels
			hideHorizontalGridLines
		/>
	);
}
