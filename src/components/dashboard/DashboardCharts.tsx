import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types for chart component props
interface ChartComponentProps {
  type: 'pie' | 'line' | 'bar';
  data: any[];
  dataKey?: string;
  colors: string[];
  layout?: 'horizontal' | 'vertical';
}

// Custom tooltip for all charts
const CustomTooltip = ({ active, payload, label, valuePrefix = '$' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-md">
        <p className="text-white text-sm font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-${index}`} style={{ color: entry.color || entry.fill }} className="text-sm">
            {entry.name}: {valuePrefix}{Number(entry.value).toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Legend formatter for better legend display
const CustomLegendFormatter = (value: string) => {
  return <span className="text-slate-300 text-sm">{value}</span>;
};

const DashboardCharts = ({ type, data, dataKey = 'value', colors, layout = 'horizontal' }: ChartComponentProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-800/30 rounded-lg">
        <p className="text-slate-400">No data available</p>
      </div>
    );
  }

  // Render appropriate chart based on type
  switch (type) {
    case 'pie':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey={dataKey}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color || colors[index % colors.length]} 
                  stroke="rgba(255,255,255,0.1)"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              verticalAlign="middle" 
              align="right"
              formatter={CustomLegendFormatter}
            />
          </PieChart>
        </ResponsiveContainer>
      );
    
    case 'line':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              stroke="rgba(255,255,255,0.2)"
            />
            <YAxis 
              tick={{ fill: 'rgba(255,255,255,0.7)' }}
              stroke="rgba(255,255,255,0.2)"
              tickFormatter={(value) => `$${Math.round(value / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              name={dataKey.charAt(0).toUpperCase() + dataKey.slice(1)}
              stroke={colors[0]} 
              strokeWidth={2}
              dot={{ fill: colors[0], r: 1 }}
              activeDot={{ r: 6, fill: colors[0], stroke: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    
    case 'bar':
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={layout}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            {layout === 'vertical' ? (
              <>
                <XAxis 
                  type="number"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  stroke="rgba(255,255,255,0.2)"
                  tickFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  stroke="rgba(255,255,255,0.2)"
                />
              </>
            ) : (
              <>
                <XAxis 
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  stroke="rgba(255,255,255,0.2)"
                />
                <YAxis 
                  tick={{ fill: 'rgba(255,255,255,0.7)' }}
                  stroke="rgba(255,255,255,0.2)"
                  tickFormatter={(value) => `$${Math.round(value).toLocaleString()}`}
                />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey={dataKey} 
              fill={colors[0]} 
              radius={[0, 4, 4, 0]} 
              name={data[0]?.name || dataKey}
            />
          </BarChart>
        </ResponsiveContainer>
      );
    
    default:
      return (
        <div className="h-full w-full flex items-center justify-center bg-slate-800/30 rounded-lg">
          <p className="text-slate-400">Invalid chart type</p>
        </div>
      );
  }
};

export default DashboardCharts; 