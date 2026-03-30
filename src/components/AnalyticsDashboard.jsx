import { useState, useEffect } from 'react';
import { FiClock, FiDollarSign, FiWind, FiTrendingUp } from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import './AnalyticsDashboard.css';

const weeklyData = [
  { day: 'Mon', timeSaved: 22, moneySaved: 45, co2Saved: 1.2 },
  { day: 'Tue', timeSaved: 18, moneySaved: 30, co2Saved: 0.9 },
  { day: 'Wed', timeSaved: 25, moneySaved: 55, co2Saved: 1.5 },
  { day: 'Thu', timeSaved: 15, moneySaved: 25, co2Saved: 0.7 },
  { day: 'Fri', timeSaved: 30, moneySaved: 60, co2Saved: 1.8 },
  { day: 'Sat', timeSaved: 10, moneySaved: 20, co2Saved: 0.5 },
  { day: 'Sun', timeSaved: 5, moneySaved: 10, co2Saved: 0.3 },
];

const totalTime = weeklyData.reduce((s, d) => s + d.timeSaved, 0);
const totalMoney = weeklyData.reduce((s, d) => s + d.moneySaved, 0);
const totalCO2 = weeklyData.reduce((s, d) => s + d.co2Saved, 0).toFixed(1);

export default function AnalyticsDashboard() {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    {
      type: 'time',
      icon: <FiClock />,
      value: `${totalTime} min`,
      label: 'Weekly Commute Time Saved',
      progress: 72,
      change: '+12% vs last week',
    },
    {
      type: 'money',
      icon: <FiDollarSign />,
      value: `₹${totalMoney}`,
      label: 'Money Saved This Week',
      progress: 65,
      change: '+8% vs last week',
    },
    {
      type: 'carbon',
      icon: <FiWind />,
      value: `${totalCO2} kg`,
      label: 'CO₂ Emissions Reduced',
      progress: 58,
      change: '+15% vs last week',
    },
  ];

  return (
    <section className="analytics-section container" id="analytics">
      <h2 className="section-title">📊 Commute Analytics</h2>
      <p className="section-subtitle">Track your savings and environmental impact</p>

      <div className="analytics-grid">
        {stats.map((stat, i) => (
          <div
            className={`analytics-card ${stat.type}`}
            key={stat.type}
            style={{ animationDelay: `${i * 0.1}s` }}
            id={`analytics-${stat.type}`}
          >
            <div className="analytics-icon">{stat.icon}</div>
            <div className="analytics-value">{stat.value}</div>
            <div className="analytics-label">{stat.label}</div>
            <div className="analytics-progress-wrapper">
              <div
                className="analytics-progress-bar"
                style={{ width: animated ? `${stat.progress}%` : '0%' }}
              ></div>
            </div>
            <div className="analytics-change">
              <FiTrendingUp size={12} /> {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="chart-container">
        <div className="chart-header">
          <div className="chart-title">Weekly Savings Overview</div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: '#6366f1' }}></div>
              Time (min)
            </div>
            <div className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: '#10b981' }}></div>
              Money (₹)
            </div>
            <div className="chart-legend-item">
              <div className="chart-legend-dot" style={{ background: '#f59e0b' }}></div>
              CO₂ (kg)
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={weeklyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="day"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-color)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                fontSize: '0.8rem',
                boxShadow: 'var(--shadow-md)',
              }}
            />
            <Bar dataKey="timeSaved" fill="#6366f1" radius={[4, 4, 0, 0]} name="Time Saved (min)" />
            <Bar dataKey="moneySaved" fill="#10b981" radius={[4, 4, 0, 0]} name="Money Saved (₹)" />
            <Bar dataKey="co2Saved" fill="#f59e0b" radius={[4, 4, 0, 0]} name="CO₂ Saved (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
