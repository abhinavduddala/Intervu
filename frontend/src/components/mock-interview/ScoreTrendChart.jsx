import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const ScoreTrendChart = ({ trend }) => {
  if (!trend?.length) {
    return <p className="text-[12px] text-[#64748B] py-10 text-center">Complete an interview to see your score trend.</p>;
  }
  const data = trend.map((t, i) => ({
    name: `#${i + 1}`,
    score: t.score,
    label: [t.companyName, new Date(t.completedAt).toLocaleDateString()].filter(Boolean).join(' · '),
  }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
            formatter={(value) => [`${value}/100`, 'Score']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
          />
          <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreTrendChart;
