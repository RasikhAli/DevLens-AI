"use client";

import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface SkillRadarItem {
  dimension: string;
  score: number;
  fullMark: number;
}

export function SkillRadarChart({
  data,
  candidateName = "Candidate",
}: {
  data?: SkillRadarItem[];
  candidateName?: string;
}) {
  const defaultData: SkillRadarItem[] = [
    { dimension: "Languages", score: 85, fullMark: 100 },
    { dimension: "Frameworks", score: 90, fullMark: 100 },
    { dimension: "Databases", score: 80, fullMark: 100 },
    { dimension: "Testing & CI", score: 75, fullMark: 100 },
    { dimension: "Architecture", score: 88, fullMark: 100 },
    { dimension: "Cloud & DevOps", score: 70, fullMark: 100 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div className="w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="dimension"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          />
          <Radar
            name={candidateName}
            dataKey="score"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
