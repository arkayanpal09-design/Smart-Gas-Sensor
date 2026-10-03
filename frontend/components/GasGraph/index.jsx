import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { GAS_THRESHOLDS } from '../../utils/thresholds';

const GasGraph = ({ data, currentValue }) => {
  // Format data for Recharts (keep last 30-40 elements)
  const chartData = useMemo(() => {
    return data.map(item => {
      const date = new Date(item.timestamp);
      // Format as 'HH:MM:SS'
      const timeStr = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      return {
        time: timeStr,
        gas: item.gas,
        rawTime: date.getTime()
      };
    });
  }, [data]);

  const maxVal = Math.max(...data.map(d => d.gas), 500);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          border: '1px solid var(--border-color)',
          padding: '8px 12px',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</p>
          <p style={{ margin: '4px 0 0 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            Gas: <span style={{ color: 'var(--color-accent)' }}>{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: 'var(--text-secondary)' }}>Live Gas Concentration Trend</h3>
        <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)' }}>
            Latest: <span style={{ color: 'var(--color-accent)', fontWeight: 'bold' }}>{currentValue}</span>
          </div>
          <div style={{ color: 'var(--text-muted)' }}>
            Recent High: <span style={{ color: 'var(--color-warning)', fontWeight: 'bold' }}>{Math.round(maxVal)}</span>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, minHeight: '200px' }}>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="var(--text-muted)" 
                fontSize={11} 
                tickMargin={10} 
                tick={{fill: 'var(--text-muted)'}}
                minTickGap={30}
              />
              <YAxis 
                stroke="var(--text-muted)" 
                fontSize={11} 
                tick={{fill: 'var(--text-muted)'}}
                domain={[0, Math.max(1000, maxVal+100)]}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <ReferenceLine y={GAS_THRESHOLDS.SAFE.max} stroke="var(--color-warning)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <ReferenceLine y={GAS_THRESHOLDS.WARNING.max} stroke="var(--color-danger)" strokeDasharray="3 3" strokeOpacity={0.5} />
              
              <Line 
                type="monotone" 
                dataKey="gas" 
                stroke="var(--color-accent)" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: 'var(--color-accent)', stroke: 'var(--bg-primary)' }}
                isAnimationActive={false} // Disable animation for smoother live data effect without springing
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
            Waiting for sensor data...
          </div>
        )}
      </div>
    </div>
  );
};

export default GasGraph;
