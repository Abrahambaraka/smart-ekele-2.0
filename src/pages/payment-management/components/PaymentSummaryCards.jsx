import React, { useMemo } from 'react';
import Icon from '../../../components/AppIcon';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

const PaymentSummaryCards = ({ payments = [], loading = false }) => {
  const summaryData = useMemo(() => {
    if (!payments || payments?.length === 0) {
      return [
        {
          id: 'collected',
          title: 'Total Collecté',
          amount: '0',
          currency: 'FCFA',
          change: '0%',
          changeType: 'neutral',
          icon: 'TrendingUp',
          description: 'Ce mois-ci'
        },
        {
          id: 'outstanding',
          title: 'Montant Dû',
          amount: '0',
          currency: 'FCFA',
          change: '0%',
          changeType: 'neutral',
          icon: 'Clock',
          description: 'En attente'
        },
        {
          id: 'overdue',
          title: 'Paiements en Retard',
          amount: '0',
          currency: 'FCFA',
          change: '0%',
          changeType: 'neutral',
          icon: 'AlertTriangle',
          description: 'À traiter'
        },
        {
          id: 'monthly',
          title: 'Revenus Mensuels',
          amount: '0',
          currency: 'FCFA',
          change: '0%',
          changeType: 'neutral',
          icon: 'BarChart3',
          description: new Date()?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
        }
      ];
    }

    // Calculate metrics from real payment data
    const totalAmount = payments
      ?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

    const paidAmount = payments
      ?.filter(p => p?.status === 'paid')
      ?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

    const paidCount = payments
      ?.filter(p => p?.status === 'paid')
      ?.length;

    const overdueAmount = payments
      ?.filter(p => p?.status === 'overdue')
      ?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

    const overdueCount = payments
      ?.filter(p => p?.status === 'overdue')
      ?.length;

    const cashAmount = payments
      ?.filter(p => p?.payment_method === 'cash')
      ?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

    const currentMonth = new Date()?.getMonth();
    const currentYear = new Date()?.getFullYear();
    const monthlyRevenue = payments
      ?.filter(p => {
        const paymentDate = p?.paid_date || p?.created_at;
        if (!paymentDate) return false;
        const date = new Date(paymentDate);
        return date?.getMonth() === currentMonth && date?.getFullYear() === currentYear;
      })
      ?.reduce((sum, p) => sum + (parseFloat(p?.amount) || 0), 0);

    const cards = [
      {
        id: 'total',
        title: "Total des Paiements",
        amount: formatCurrency(totalAmount),
        currency: 'FCFA',
        change: "+12.5%",
        changeType: "positive",
        icon: "TrendingUp",
        color: "primary"
      },
      {
        id: 'paid',
        title: "Paiements Reçus",
        amount: formatCurrency(paidAmount),
        currency: 'FCFA',
        change: `${paidCount} paiements`,
        changeType: "positive",
        icon: "CheckCircle",
        color: "success"
      },
      {
        id: 'overdue',
        title: "Paiements en Retard",
        amount: formatCurrency(overdueAmount),
        currency: 'FCFA',
        change: `${overdueCount} en attente`,
        changeType: "negative",
        icon: "AlertTriangle",
        color: "error"
      },
      {
        id: 'cash',
        title: "Paiements Espèces",
        amount: formatCurrency(cashAmount),
        currency: 'FCFA',
        change: `${Math.round((cashAmount / totalAmount) * 100) || 0}% du total`,
        changeType: cashAmount > 0 ? "positive" : "neutral",
        icon: "Banknote",
        color: "success",
        description: "Paiements en liquide"
      }
    ];

    return cards;
  }, [payments]);

  const getChangeColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-error';
      case 'warning': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'positive': return 'text-success bg-success/10';
      case 'negative': return 'text-error bg-error/10';
      case 'warning': return 'text-warning bg-warning/10';
      default: return 'text-primary bg-primary/10';
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 })?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6">
            <div className="animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-muted rounded-lg"></div>
                <div className="w-12 h-4 bg-muted rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="w-24 h-4 bg-muted rounded"></div>
                <div className="w-20 h-8 bg-muted rounded"></div>
                <div className="w-16 h-3 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {summaryData?.map((item) => (
        <div key={item?.id} className="bg-card border border-border rounded-lg p-6 hover-lift transition-smooth">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getIconColor(item?.changeType)}`}>
              <Icon name={item?.icon} size={24} />
            </div>
            <div className={`text-sm font-medium ${getChangeColor(item?.changeType)}`}>
              {item?.change}
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">{item?.title}</h3>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-bold text-foreground">
                {item?.amount}
              </span>
              <span className="text-lg font-semibold text-muted-foreground">
                {item?.currency}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{item?.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaymentSummaryCards;