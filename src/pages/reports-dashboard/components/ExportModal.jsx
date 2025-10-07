import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ExportModal = ({ isOpen, onClose, reportData, onExport }) => {
  const [exportConfig, setExportConfig] = useState({
    format: 'pdf',
    includeCharts: true,
    includeData: true,
    includeSummary: true,
    dateFormat: 'dd/mm/yyyy',
    language: 'fr',
    orientation: 'portrait'
  });

  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const formatOptions = [
    { value: 'pdf', label: 'PDF - Document portable', description: 'Idéal pour l\'impression et le partage' },
    { value: 'excel', label: 'Excel - Tableur', description: 'Pour l\'analyse et la manipulation des données' },
    { value: 'csv', label: 'CSV - Données brutes', description: 'Format universel pour les données' },
    { value: 'word', label: 'Word - Document texte', description: 'Pour l\'édition et la personnalisation' }
  ];

  const dateFormatOptions = [
    { value: 'dd/mm/yyyy', label: 'DD/MM/AAAA (Français)' },
    { value: 'mm/dd/yyyy', label: 'MM/DD/AAAA (Américain)' },
    { value: 'yyyy-mm-dd', label: 'AAAA-MM-DD (ISO)' }
  ];

  const orientationOptions = [
    { value: 'portrait', label: 'Portrait' },
    { value: 'landscape', label: 'Paysage' }
  ];

  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const exportData = {
      ...reportData,
      config: exportConfig,
      exportedAt: new Date()?.toISOString(),
      filename: `rapport_${reportData?.id}_${Date.now()}.${exportConfig?.format}`
    };
    
    onExport(exportData);
    setIsExporting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Download" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Exporter le rapport</h2>
              <p className="text-sm text-muted-foreground">{reportData?.title}</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            iconName="X"
            onClick={onClose}
          />
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Format Selection */}
          <div>
            <Select
              label="Format d'export"
              description="Choisissez le format de fichier souhaité"
              options={formatOptions}
              value={exportConfig?.format}
              onChange={(value) => setExportConfig(prev => ({ ...prev, format: value }))}
            />
          </div>

          {/* Content Options */}
          <div>
            <label className="text-sm font-medium text-foreground mb-3 block">
              Contenu à inclure
            </label>
            <div className="space-y-3">
              <Checkbox
                label="Graphiques et visualisations"
                description="Inclure tous les graphiques du rapport"
                checked={exportConfig?.includeCharts}
                onChange={(e) => setExportConfig(prev => ({ 
                  ...prev, 
                  includeCharts: e?.target?.checked 
                }))}
              />
              
              <Checkbox
                label="Données détaillées"
                description="Inclure les tableaux de données brutes"
                checked={exportConfig?.includeData}
                onChange={(e) => setExportConfig(prev => ({ 
                  ...prev, 
                  includeData: e?.target?.checked 
                }))}
              />
              
              <Checkbox
                label="Résumé exécutif"
                description="Inclure le résumé et les conclusions"
                checked={exportConfig?.includeSummary}
                onChange={(e) => setExportConfig(prev => ({ 
                  ...prev, 
                  includeSummary: e?.target?.checked 
                }))}
              />
            </div>
          </div>

          {/* Format Options */}
          {exportConfig?.format === 'pdf' && (
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Orientation"
                options={orientationOptions}
                value={exportConfig?.orientation}
                onChange={(value) => setExportConfig(prev => ({ ...prev, orientation: value }))}
              />
              
              <Select
                label="Format de date"
                options={dateFormatOptions}
                value={exportConfig?.dateFormat}
                onChange={(value) => setExportConfig(prev => ({ ...prev, dateFormat: value }))}
              />
            </div>
          )}

          {/* Preview */}
          <div className="bg-muted/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Icon name="Eye" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Aperçu de l'export</span>
            </div>
            
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Format: {formatOptions?.find(f => f?.value === exportConfig?.format)?.label}</div>
              <div>Taille estimée: ~{Math.floor(Math.random() * 5 + 1)}.{Math.floor(Math.random() * 9)}MB</div>
              <div>Pages: ~{Math.floor(Math.random() * 20 + 5)} pages</div>
              <div>Nom du fichier: rapport_{reportData?.id}_{Date.now()}.{exportConfig?.format}</div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Options avancées</h4>
            
            <div className="space-y-3">
              <Checkbox
                label="Inclure les métadonnées"
                description="Ajouter les informations de génération et d'export"
                checked
                disabled
              />
              
              <Checkbox
                label="Optimiser pour l'impression"
                description="Ajuster la mise en page pour l'impression"
                checked={exportConfig?.format === 'pdf'}
                onChange={(e) => setExportConfig(prev => ({ 
                  ...prev, 
                  optimizeForPrint: e?.target?.checked 
                }))}
              />
              
              <Checkbox
                label="Inclure le filigrane"
                description="Ajouter le logo Smart Ekele en filigrane"
                checked
                disabled
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/30">
          <div className="text-sm text-muted-foreground">
            L'export respecte les standards français (EUR, DD/MM/AAAA)
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isExporting}
            >
              Annuler
            </Button>
            
            <Button
              variant="default"
              iconName="Download"
              iconPosition="left"
              loading={isExporting}
              onClick={handleExport}
            >
              {isExporting ? 'Export en cours...' : 'Exporter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;