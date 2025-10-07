import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const PaymentStatusChart = () => {
  const paymentData = [
    { name: 'Payé', value: 285, color: '#10b981', percentage: 78 },
    { name: 'En retard', value: 45, color: '#f59e0b', percentage: 12 },
    { name: 'En attente', value: 25, color: '#6b7280', percentage: 7 },
    { name: 'Annulé', value: 10, color: '#ef4444', percentage: 3 }
  ];

  const totalPayments = paymentData?.reduce((sum, item) => sum + item?.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 elevation-2">
          <p className="text-sm font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">
            {data?.value} paiements ({data?.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry?.color }}
            />
            <span className="text-sm text-muted-foreground">{entry?.value}</span>
            <span className="text-sm font-medium text-foreground">
              {paymentData?.find(item => item?.name === entry?.value)?.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="PieChart" size={18} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Statut des Paiements</h3>
        </div>
        <div className="text-sm text-muted-foreground">
          Total: {totalPayments} paiements
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={paymentData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {paymentData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry?.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-success/10 rounded-lg">
          <div className="text-lg font-bold text-success">128,250€</div>
          <div className="text-sm text-muted-foreground">Revenus ce mois</div>
        </div>
        <div className="text-center p-3 bg-warning/10 rounded-lg">
          <div className="text-lg font-bold text-warning">18,750€</div>
          <div className="text-sm text-muted-foreground">En attente</div>
        </div>
      </div>
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Taux de recouvrement</span>
          <span className="font-medium text-foreground">87.2%</span>
        </div>
        <div className="mt-2 w-full bg-border rounded-full h-2">
          <div 
            className="bg-success h-2 rounded-full transition-all duration-500" 
            style={{ width: '87.2%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusChart;