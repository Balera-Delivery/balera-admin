import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

export const StatusDonutChart = ({ data }) => {
  return (
    <div className="w-full h-72 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '0.75rem', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
              border: '1px solid #E2E8F0',
              fontSize: '12px',
              fontWeight: 600
            }} 
          />
          <Pie
            data={data}
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
