import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ReportViewer = ({ selectedReport, onExport, onClose }) => {
  const [viewMode, setViewMode] = useState('chart');

  if (!selectedReport) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Sélectionnez un rapport
        </h3>
        <p className="text-muted-foreground">
          Choisissez une catégorie de rapport pour afficher les données
        </p>
      </div>
    );
  }

  const chartColors = ['#2563EB', '#059669', '#F59E0B', '#EF4444', '#8B5CF6'];

  const renderChart = () => {
    const { chartType, data } = selectedReport;

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartColors?.[index % chartColors?.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      
      default:
        return <div className="text-center text-muted-foreground">Type de graphique non supporté</div>;
    }
  };

  const renderTable = () => {
    const { tableData } = selectedReport;
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              {tableData?.headers?.map((header, index) => (
                <th key={index} className="text-left p-3 font-semibold text-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData?.rows?.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border hover:bg-muted/50">
                {row?.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-3 text-muted-foreground">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{selectedReport?.title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{selectedReport?.description}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1.5 text-sm rounded transition-micro ${
                viewMode === 'chart' ?'bg-card text-foreground elevation-1' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart3" size={16} className="mr-1.5" />
              Graphique
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded transition-micro ${
                viewMode === 'table' ?'bg-card text-foreground elevation-1' :'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="Table" size={16} className="mr-1.5" />
              Tableau
            </button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            onClick={() => onExport(selectedReport)}
          >
            Exporter
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
          />
        </div>
      </div>
      {/* Content */}
      <div className="p-6">
        {viewMode === 'chart' ? renderChart() : renderTable()}
      </div>
      {/* Footer */}
      <div className="px-6 py-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Généré le {selectedReport?.generatedDate} • {selectedReport?.dataPoints} points de données
          </div>
          <div className="flex items-center space-x-4">
            <span>Dernière mise à jour: {selectedReport?.lastUpdated}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Données à jour</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewer;