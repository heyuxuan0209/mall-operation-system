import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from 'recharts';

interface HealthMetrics {
  collection: number;
  operational: number;
  siteQuality: number;
  customerReview: number;
  riskResistance?: number;
}

interface HealthRadarProps {
  metrics: HealthMetrics;
  compareMetrics?: HealthMetrics;
  primaryLabel?: string;
  compareLabel?: string;
}

const HealthRadar: React.FC<HealthRadarProps> = ({
  metrics,
  compareMetrics,
  primaryLabel = '当前/帮扶前',
  compareLabel = '对比/帮扶后'
}) => {
  const data = [
    {
      subject: '收缴健康度',
      A: metrics.collection,
      B: compareMetrics?.collection || 0,
      fullMark: 100
    },
    {
      subject: '经营健康度',
      A: metrics.operational,
      B: compareMetrics?.operational || 0,
      fullMark: 100
    },
    {
      subject: '现场品质',
      A: metrics.siteQuality,
      B: compareMetrics?.siteQuality || 0,
      fullMark: 100
    },
    {
      subject: '顾客口碑',
      A: metrics.customerReview,
      B: compareMetrics?.customerReview || 0,
      fullMark: 100
    },
    {
      subject: '抗风险能力',
      A: metrics.riskResistance || 0,
      B: compareMetrics?.riskResistance || 0,
      fullMark: 100
    },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />

        <Radar
          name={primaryLabel}
          dataKey="A"
          stroke="#94a3b8"
          strokeWidth={2}
          fill="#94a3b8"
          fillOpacity={0.3}
        />

        {compareMetrics && (
          <Radar
            name={compareLabel}
            dataKey="B"
            stroke="#22c55e"
            strokeWidth={3}
            fill="#22c55e"
            fillOpacity={0.4}
          />
        )}

        <Legend wrapperStyle={{ paddingTop: '10px' }}/>
        <Tooltip />
      </RadarChart>
    </ResponsiveContainer>
  );
};

export default HealthRadar;
