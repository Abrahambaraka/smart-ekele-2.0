
// Fix: Import 'useMemo' from 'react' to resolve the "Cannot find name 'useMemo'" error.
import React, { useState, useMemo } from 'react';
import { MOCK_CLASSES, MOCK_NOTIFICATIONS, MOCK_STUDENTS } from '../constants';
import { Student, Role } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSchoolSettings } from '../lib/useSchoolSettings';

interface ClassReport {
  classId: number | string;
  className: string;
  presentStudents: Student[];
  absentStudents: Student[];
}

const ReportsDashboard: React.FC = () => {
    const { user } = useAuth();
    const { settings } = useSchoolSettings(user?.schoolId);

    if (user?.role === Role.SUPER_ADMIN) {
        return (
            <div className="container mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-0">
                        Rapports Consolidés
                    </h1>
                </div>
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
                    <i className="fas fa-chart-line text-4xl text-slate-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Analyses Multi-Écoles</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Cette section est en cours de développement et affichera prochainement des rapports et des statistiques consolidées sur l'ensemble du réseau scolaire.</p>
                </div>
            </div>
        );
    }
    
    const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState<'all' | number | string>('all');
    const [reportData, setReportData] = useState<ClassReport[] | null>(null);
    const [reportGenerated, setReportGenerated] = useState(false);

    const handleGenerateReport = () => {
        const absenceNotifications = MOCK_NOTIFICATIONS.filter(notif => 
            notif.date === reportDate && (notif.title.toLowerCase().includes('absence') || notif.title.toLowerCase().includes('renvoi'))
        );

        const absentStudentNames = absenceNotifications.map(notif => {
            const match = notif.target.match(/Parent de (.+)/);
            return match ? match[1] : null;
        }).filter((name): name is string => name !== null);

        const classesToReport = selectedClassId === 'all' 
            ? MOCK_CLASSES 
            : MOCK_CLASSES.filter(c => c.id === selectedClassId);

        const newReportData = classesToReport.map(cls => {
            const studentsInClass = MOCK_STUDENTS.filter(s => s.classId === cls.id);
            const absentStudents: Student[] = [];
            const presentStudents: Student[] = [];

            studentsInClass.forEach(student => {
                if (absentStudentNames.includes(student.name)) {
                    absentStudents.push(student);
                } else {
                    presentStudents.push(student);
                }
            });

            return {
                classId: cls.id,
                className: cls.name,
                presentStudents,
                absentStudents,
            };
        });

        setReportData(newReportData);
        setReportGenerated(true);
    };
    
    const handleExport = () => {
        // This export will now use all classes, regardless of the filter, for a full report.
        const allNotifications = MOCK_NOTIFICATIONS.filter(notif => 
            notif.date === reportDate && (notif.title.toLowerCase().includes('absence') || notif.title.toLowerCase().includes('renvoi'))
        );
        const allAbsentStudentNames = allNotifications.map(notif => {
            const match = notif.target.match(/Parent de (.+)/);
            return match ? match[1] : null;
        }).filter((name): name is string => name !== null);
    
        const fullReportData = MOCK_CLASSES.map(cls => {
            const studentsInClass = MOCK_STUDENTS.filter(s => s.classId === cls.id);
            const absentStudents: Student[] = [];
            const presentStudents: Student[] = [];
    
            studentsInClass.forEach(student => {
                if (allAbsentStudentNames.includes(student.name)) {
                    absentStudents.push(student);
                } else {
                    presentStudents.push(student);
                }
            });
    
            return {
                classId: cls.id,
                className: cls.name,
                presentStudents,
                absentStudents,
            };
        });


      const schoolName = settings?.display_name || "Établissement";
      const logoUrl = settings?.logo_url;
      const address = settings?.address || "";
      const phone = settings?.phone || "";
      const reportDateFormatted = new Date(reportDate + 'T00:00:00').toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });

      let content = `
        <html>
          <head>
            <title>Registre de Présence - ${reportDateFormatted}</title>
            <style>
              body { 
                font-family: 'Courier New', Courier, monospace; 
                font-size: 10pt; 
                color: #000;
                margin: 0;
                padding: 0;
              }
              .receipt-container { 
                width: 280px; /* Standard 80mm thermal paper width */
                padding: 10px;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .line { border-top: 1px dashed #000; margin: 10px 0; }
              .header h1 { font-size: 12pt; margin: 0; }
              .header p { margin: 2px 0; font-size: 9pt; }
              .class-header { margin-top: 15px; margin-bottom: 5px; font-size: 11pt; font-weight: bold; }
              .student-list { list-style-type: none; padding: 0; margin: 0; }
              .student-list li { padding: 2px 0; }
              .summary { margin-top: 10px; font-size: 9pt; }
              .footer p { font-size: 9pt; margin: 2px 0; }
              .logo { width: 40px; height: 40px; object-fit: cover; border-radius: 6px; display: block; margin: 0 auto 6px; }
              @media print {
                  @page {
                    margin: 0;
                  }
                  body {
                     margin: 0.5cm;
                  }
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              <div class="header center">
                  ${logoUrl ? `<img src="${logoUrl}" alt="Logo" class="logo"/>` : ''}
                  <h1 class="bold">${schoolName.toUpperCase()}</h1>
                  ${address ? `<p>${address}</p>` : ''}
                  ${phone ? `<p>Tel: ${phone}</p>` : ''}
                  <div class="line"></div>
                  <p class="bold">REGISTRE DE PRESENCE</p>
                  <p>${reportDateFormatted}</p>
              </div>
      `;

      fullReportData.forEach(classReport => {
        const allStudents = [...classReport.presentStudents, ...classReport.absentStudents].sort((a, b) => a.name.localeCompare(b.name));
        
        content += `<div class="line"></div>`;
        content += `<div class="class-header">${classReport.className}</div>`;
        content += `<ul class="student-list">`;

        allStudents.forEach(student => {
          const isPresent = classReport.presentStudents.some(s => s.id === student.id);
          const status = isPresent ? '[P]' : '[A]';
          content += `<li>${status} ${student.name}</li>`;
        });

        content += `</ul>`;
        content += `<div class="summary">`;
        content += `PRESENTS: ${classReport.presentStudents.length}, ABSENTS: ${classReport.absentStudents.length}`;
        content += `</div>`;
      });

      content += `
          <div class="line"></div>
          <div class="footer center">
              <p>P=Présent, A=Absent</p>
              <p>Généré par Smart Ekele</p>
              <p>${new Date().toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </body>
    </html>
  `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => {
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }, 250);
      }
    };


    const summary = useMemo(() => {
        if (!reportData) return null;
        const result = reportData.reduce((acc, report) => {
            acc.present += report.presentStudents.length;
            acc.absent += report.absentStudents.length;
            return acc;
        }, { present: 0, absent: 0 });
        const total = result.present + result.absent;
        const rate = total > 0 ? ((result.present / total) * 100).toFixed(1) : '0.0';
        return { ...result, total, rate, classCount: reportData.length };
    }, [reportData]);

    const SummaryCard = ({ title, value, icon, colorClass }: { title: string; value: string | number; icon: string; colorClass: string; }) => (
        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg flex items-center">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-4 text-lg md:text-xl ${colorClass}`}>
                <i className={icon}></i>
            </div>
            <div>
                <div className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
                <div className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{title}</div>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4 sm:mb-0">
                    Rapports de Présence
                </h1>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="reportDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date du rapport</label>
                        <input
                            type="date"
                            id="reportDate"
                            value={reportDate}
                            onChange={(e) => setReportDate(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                    <div>
                        <label htmlFor="classFilter" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe</label>
                        <select
                            id="classFilter"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="all">Toutes les classes</option>
                            {MOCK_CLASSES.map(cls => (
                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerateReport}
                        className="w-full bg-brand-primary text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-brand-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px flex items-center justify-center sm:col-span-2 lg:col-span-1"
                    >
                        <i className="fas fa-sync-alt mr-2"></i>Générer le Rapport
                    </button>
                </div>
            </div>

            {reportGenerated && reportData && summary && (
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-4">
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4 md:mb-0">Résumé du Rapport</h2>
                        <button
                            onClick={handleExport}
                            className="bg-brand-primary text-white font-semibold px-4 py-2 rounded-md shadow-md hover:bg-brand-secondary hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:-translate-y-px flex items-center w-full md:w-auto justify-center"
                        >
                            <i className="fas fa-file-export mr-2"></i>Exporter le Registre
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <SummaryCard title="Classes Analysées" value={summary.classCount} icon="fas fa-chalkboard" colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300" />
                        <SummaryCard title="Élèves Présents" value={summary.present} icon="fas fa-user-check" colorClass="bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-300" />
                        <SummaryCard title="Élèves Absents" value={summary.absent} icon="fas fa-user-times" colorClass="bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-300" />
                        <SummaryCard title="Taux de Présence" value={`${summary.rate}%`} icon="fas fa-percentage" colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300" />
                    </div>
                </div>
            )}


            {reportGenerated ? (
                reportData && reportData.length > 0 ? (
                    <div className="space-y-6">
                        {reportData.map(report => (
                            <div key={report.classId} className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                                <h2 className="text-lg md:text-xl font-bold text-primary-600 dark:text-primary-400 mb-4 pb-2 border-b dark:border-slate-700">{report.className}</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                                    <div>
                                        <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center text-green-600 dark:text-green-400">
                                            <i className="fas fa-check-circle mr-2"></i> Présents ({report.presentStudents.length})
                                        </h3>
                                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {report.presentStudents.map(student => (
                                                <li key={student.id} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md text-sm">{student.name}</li>
                                            ))}
                                            {report.presentStudents.length === 0 && <li className="text-slate-500 text-sm">Aucun élève présent.</li>}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base md:text-lg mb-3 flex items-center text-red-600 dark:text-red-400">
                                            <i className="fas fa-times-circle mr-2"></i> Absents ({report.absentStudents.length})
                                        </h3>
                                        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                            {report.absentStudents.map(student => (
                                                <li key={student.id} className="bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md text-sm">{student.name}</li>
                                            ))}
                                            {report.absentStudents.length === 0 && <li className="text-slate-500 text-sm">Aucun élève absent signalé.</li>}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
                        <i className="fas fa-info-circle text-4xl text-slate-400 mb-4"></i>
                        <p className="text-slate-500 dark:text-slate-400">Aucune donnée de présence trouvée pour la sélection actuelle.</p>
                        <p className="text-sm text-slate-400 mt-2">Essayez une autre date ou assurez-vous que des communications d'absence ont été envoyées.</p>
                    </div>
                )
            ) : (
                <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md">
                    <i className="fas fa-chart-bar text-4xl text-slate-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Prêt à analyser la présence</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Veuillez sélectionner une date et une classe, puis cliquez sur "Générer le Rapport".</p>
                </div>
            )}
        </div>
    );
};

export default ReportsDashboard;
