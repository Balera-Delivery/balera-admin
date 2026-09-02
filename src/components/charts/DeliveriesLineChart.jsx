import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const DeliveriesLineChart = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1B59F8" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#1B59F8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
          <XAxis 
            dataKey="day" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 12 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fill: '#94A3B8', fontSize: 12 }} 
          />
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
          <Area 
            type="monotone" 
            dataKey="deliveries" 
            stroke="#1B59F8" 
            strokeWidth={3} 
            fillOpacity={1} 
            fill="url(#deliveryGradient)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
