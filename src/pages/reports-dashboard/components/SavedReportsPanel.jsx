import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SavedReportsPanel = ({ onLoadReport, onDeleteReport }) => {
  const [savedReports] = useState([
    {
      id: 'saved_1',
      name: 'Rapport Mensuel Septembre',
      description: 'Performance académique et présence',
      category: 'academic',
      createdDate: '12/09/2025',
      lastAccessed: '14/09/2025',
      size: '2.3 MB',
      format: 'pdf',
      isShared: true,
      sharedWith: ['marie.dubois@smartekele.fr', 'jean.martin@smartekele.fr']
    },
    {
      id: 'saved_2',
      name: 'Analyse Financière Q3',
      description: 'Suivi des paiements et revenus',
      category: 'financial',
      createdDate: '08/09/2025',
      lastAccessed: '13/09/2025',
      size: '1.8 MB',
      format: 'excel',
      isShared: false,
      sharedWith: []
    },
    {
      id: 'saved_3',
      name: 'Statistiques Inscriptions',
      description: 'Évolution des inscriptions 2025',
      category: 'enrollment',
      createdDate: '05/09/2025',
      lastAccessed: '11/09/2025',
      size: '956 KB',
      format: 'pdf',
      isShared: true,
      sharedWith: ['admin@smartekele.fr']
    },
    {
      id: 'saved_4',
      name: 'Rapport Présence Hebdo',
      description: 'Suivi présence semaine 37',
      category: 'attendance',
      createdDate: '10/09/2025',
      lastAccessed: '15/09/2025',
      size: '1.2 MB',
      format: 'csv',
      isShared: false,
      sharedWith: []
    }
  ]);

  const [sortBy, setSortBy] = useState('lastAccessed');
  const [filterCategory, setFilterCategory] = useState('all');

  const categoryIcons = {
    academic: 'BookOpen',
    financial: 'CreditCard',
    enrollment: 'UserPlus',
    attendance: 'Clock',
    administrative: 'Settings'
  };

  const formatIcons = {
    pdf: 'FileText',
    excel: 'FileSpreadsheet',
    csv: 'Database',
    word: 'FileText'
  };

  const filteredReports = savedReports?.filter(report => filterCategory === 'all' || report?.category === filterCategory)?.sort((a, b) => {
      if (sortBy === 'name') return a?.name?.localeCompare(b?.name);
      if (sortBy === 'createdDate') return new Date(b.createdDate) - new Date(a.createdDate);
      return new Date(b.lastAccessed) - new Date(a.lastAccessed);
    });

  return (
    <div className="bg-card border border-border rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Save" size={18} className="text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Rapports sauvegardés</h3>
          <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
            {savedReports?.length}
          </span>
        </div>
      </div>
      {/* Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e?.target?.value)}
              className="text-xs bg-muted border border-border rounded px-2 py-1"
            >
              <option value="all">Toutes catégories</option>
              <option value="academic">Académique</option>
              <option value="financial">Financier</option>
              <option value="enrollment">Inscriptions</option>
              <option value="attendance">Présence</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="text-xs bg-muted border border-border rounded px-2 py-1"
            >
              <option value="lastAccessed">Dernier accès</option>
              <option value="createdDate">Date création</option>
              <option value="name">Nom</option>
            </select>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="Plus"
            iconPosition="left"
          >
            Nouveau
          </Button>
        </div>
      </div>
      {/* Reports List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredReports?.map((report) => (
          <div
            key={report?.id}
            className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-micro"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="flex items-center space-x-1">
                  <Icon 
                    name={categoryIcons?.[report?.category]} 
                    size={16} 
                    className="text-primary" 
                  />
                  <Icon 
                    name={formatIcons?.[report?.format]} 
                    size={14} 
                    className="text-muted-foreground" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-sm font-medium text-foreground truncate">
                      {report?.name}
                    </h4>
                    {report?.isShared && (
                      <Icon name="Share2" size={12} className="text-success" />
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                    {report?.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Créé: {report?.createdDate}</span>
                    <span>Accédé: {report?.lastAccessed}</span>
                    <span>{report?.size}</span>
                  </div>
                  
                  {report?.isShared && report?.sharedWith?.length > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Partagé avec {report?.sharedWith?.length} personne(s)
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-3">
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Eye"
                  onClick={() => onLoadReport(report)}
                  title="Voir le rapport"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Download"
                  title="Télécharger"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Share2"
                  title="Partager"
                />
                
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="Trash2"
                  onClick={() => onDeleteReport(report?.id)}
                  title="Supprimer"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{filteredReports?.length} rapport(s) affiché(s)</span>
          <div className="flex items-center space-x-4">
            <span>Espace utilisé: 6.2 MB / 100 MB</span>
            <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
              <div className="w-1/6 h-full bg-primary"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedReportsPanel;