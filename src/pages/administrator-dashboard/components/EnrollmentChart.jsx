import React from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';

const EnrollmentChart = () => {
  const enrollmentData = [
    { month: 'Jan', students: 245, newEnrollments: 12, target: 250 },
    { month: 'Fév', students: 258, newEnrollments: 18, target: 260 },
    { month: 'Mar', students: 275, newEnrollments: 22, target: 270 },
    { month: 'Avr', students: 289, newEnrollments: 19, target: 285 },
    { month: 'Mai', students: 302, newEnrollments: 25, target: 300 },
    { month: 'Jun', students: 318, newEnrollments: 20, target: 315 },
    { month: 'Jul', students: 325, newEnrollments: 15, target: 320 },
    { month: 'Aoû', students: 340, newEnrollments: 28, target: 335 },
    { month: 'Sep', students: 365, newEnrollments: 35, target: 360 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 elevation-2">
          <p className="text-sm font-medium text-popover-foreground mb-2">{`${label} 2024`}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-popover-foreground">{entry?.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Évolution des Inscriptions</h3>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-sm text-muted-foreground">Étudiants totaux</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-accent rounded-full"></div>
            <span className="text-sm text-muted-foreground">Objectif</span>
          </div>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={enrollmentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="studentsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="rgb(37, 99, 235)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="rgb(37, 99, 235)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="students"
              stroke="rgb(37, 99, 235)"
              strokeWidth={2}
              fill="url(#studentsGradient)"
              name="Étudiants"
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="rgb(5, 150, 105)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Objectif"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-3 bg-muted/50 rounded-lg">
          <div className="text-lg font-bold text-foreground">365</div>
          <div className="text-sm text-muted-foreground">Étudiants actuels</div>
        </div>
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-lg font-bold text-success">+35</div>
          <div className="text-sm text-muted-foreground">Ce mois</div>
        </div>
        <div className="text-center p-3 bg-primary/10 rounded-lg">
          <div className="text-lg font-bold text-primary">101%</div>
          <div className="text-sm text-muted-foreground">Objectif atteint</div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentChart;