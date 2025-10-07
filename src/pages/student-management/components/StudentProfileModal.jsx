import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const StudentProfileModal = ({ student, isOpen, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('profile');

  if (!isOpen || !student) return null;

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'User' },
    { id: 'academic', label: 'Académique', icon: 'BookOpen' },
    { id: 'attendance', label: 'Présence', icon: 'Calendar' },
    { id: 'payments', label: 'Paiements', icon: 'CreditCard' },
    { id: 'family', label: 'Famille', icon: 'Users' }
  ];

  const mockAcademicData = {
    currentGPA: 15.2,
    subjects: [
      { name: 'Mathématiques', grade: 16.5, teacher: 'M. Dupont' },
      { name: 'Français', grade: 14.8, teacher: 'Mme Martin' },
      { name: 'Sciences', grade: 15.9, teacher: 'M. Bernard' },
      { name: 'Histoire', grade: 13.7, teacher: 'Mme Rousseau' },
      { name: 'Anglais', grade: 16.2, teacher: 'M. Smith' }
    ]
  };

  const mockAttendanceData = {
    totalDays: 180,
    presentDays: 165,
    absentDays: 15,
    attendanceRate: 91.7,
    recentAttendance: [
      { date: '15/09/2024', status: 'Présent' },
      { date: '14/09/2024', status: 'Présent' },
      { date: '13/09/2024', status: 'Absent' },
      { date: '12/09/2024', status: 'Présent' },
      { date: '11/09/2024', status: 'Présent' }
    ]
  };

  const mockPaymentData = {
    totalFees: 2500,
    paidAmount: 2000,
    pendingAmount: 500,
    payments: [
      { date: '01/09/2024', amount: 500, type: 'Frais de scolarité', status: 'Payé' },
      { date: '01/08/2024', amount: 500, type: 'Frais de scolarité', status: 'Payé' },
      { date: '01/07/2024', amount: 500, type: 'Frais de scolarité', status: 'Payé' },
      { date: '01/06/2024', amount: 500, type: 'Frais de scolarité', status: 'Payé' },
      { date: '01/10/2024', amount: 500, type: 'Frais de scolarité', status: 'En attente' }
    ]
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-foreground mb-3">Informations Personnelles</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Nom Complet</label>
                    <p className="font-medium">{student?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">ID Étudiant</label>
                    <p className="font-mono text-sm bg-muted px-2 py-1 rounded inline-block">
                      {student?.studentId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{student?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <p className="font-medium">+33 6 12 34 56 78</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Date de Naissance</label>
                    <p className="font-medium">15/03/2008</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Adresse</label>
                    <p className="font-medium">123 Rue de la République\n75001 Paris, France</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-3">Informations Scolaires</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground">Classe</label>
                    <p className="font-medium">{student?.class} - {student?.section}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Statut</label>
                    <p className="font-medium">{student?.status}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Date d'Inscription</label>
                    <p className="font-medium">{student?.enrollmentDate}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Année Scolaire</label>
                    <p className="font-medium">2024-2025</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Professeur Principal</label>
                    <p className="font-medium">Mme Dubois</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'academic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{mockAcademicData?.currentGPA}</div>
                <div className="text-sm text-muted-foreground">Moyenne Générale</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">5</div>
                <div className="text-sm text-muted-foreground">Matières</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-accent">2ème</div>
                <div className="text-sm text-muted-foreground">Rang de Classe</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Notes par Matière</h4>
              <div className="space-y-3">
                {mockAcademicData?.subjects?.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{subject?.name}</div>
                      <div className="text-sm text-muted-foreground">{subject?.teacher}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{subject?.grade}/20</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'attendance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">{mockAttendanceData?.attendanceRate}%</div>
                <div className="text-sm text-muted-foreground">Taux de Présence</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">{mockAttendanceData?.presentDays}</div>
                <div className="text-sm text-muted-foreground">Jours Présents</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-error">{mockAttendanceData?.absentDays}</div>
                <div className="text-sm text-muted-foreground">Jours Absents</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{mockAttendanceData?.totalDays}</div>
                <div className="text-sm text-muted-foreground">Total Jours</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Présence Récente</h4>
              <div className="space-y-2">
                {mockAttendanceData?.recentAttendance?.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="font-medium">{record?.date}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record?.status === 'Présent' ?'bg-success/10 text-success' :'bg-error/10 text-error'
                    }`}>
                      {record?.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-foreground">{mockPaymentData?.totalFees}€</div>
                <div className="text-sm text-muted-foreground">Frais Totaux</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-success">{mockPaymentData?.paidAmount}€</div>
                <div className="text-sm text-muted-foreground">Montant Payé</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-warning">{mockPaymentData?.pendingAmount}€</div>
                <div className="text-sm text-muted-foreground">En Attente</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Historique des Paiements</h4>
              <div className="space-y-3">
                {mockPaymentData?.payments?.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium">{payment?.type}</div>
                      <div className="text-sm text-muted-foreground">{payment?.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{payment?.amount}€</div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        payment?.status === 'Payé' ?'bg-success/10 text-success' :'bg-warning/10 text-warning'
                      }`}>
                        {payment?.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'family':
        return (
          <div className="space-y-6">
            <div>
              <h4 className="font-medium text-foreground mb-3">Contact Principal</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nom</label>
                    <p className="font-medium">{student?.parentName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Relation</label>
                    <p className="font-medium">Mère</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <p className="font-medium">{student?.parentPhone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">marie.parent@email.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Contact Secondaire</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nom</label>
                    <p className="font-medium">Pierre Martin</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Relation</label>
                    <p className="font-medium">Père</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <p className="font-medium">+33 6 98 76 54 32</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">pierre.parent@email.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-3">Contact d'Urgence</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Nom</label>
                    <p className="font-medium">Sophie Dubois</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Relation</label>
                    <p className="font-medium">Tante</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Téléphone</label>
                    <p className="font-medium">+33 6 11 22 33 44</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">sophie.urgence@email.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-300 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
              <Image
                src={student?.avatar}
                alt={student?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">{student?.name}</h2>
              <p className="text-muted-foreground">{student?.studentId} • {student?.class}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(student)}
              iconName="Edit"
              iconPosition="left"
            >
              Modifier
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <Icon name="X" size={20} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <div className="flex overflow-x-auto">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-micro ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default StudentProfileModal;