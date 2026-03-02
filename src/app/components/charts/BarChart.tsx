"use client";

import InteractiveTimeSeriesChart from "./InteractiveTimeSeriesChart";

interface BarChartPoint {
	label: string;
	value: number;
}

interface BarChartProps {
	data: BarChartPoint[];
	color?: string;
	highlightColor?: string;
	yAxisLabel?: string;
	valueSuffix?: string;
	metricLabel?: string;
	height?: number;
}

export default function BarChart({
	data,
	color = "#10b981",
	highlightColor = "#f59e0b",
	yAxisLabel = "Value",
	valueSuffix = "",
	metricLabel = "Value",
	height = 120,
}: BarChartProps) {
	return (
		<InteractiveTimeSeriesChart
			data={data}
			mode="bar"
			yAxisLabel={yAxisLabel}
			valueSuffix={valueSuffix}
			metricLabel={metricLabel}
			color={highlightColor || color}
			height={height}
			hideYTickLabels
			hideHorizontalGridLines
			hideYAxisName
		/>
	);
}
