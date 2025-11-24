
import React, { useState, FormEvent, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { PaymentStatus } from '../types';

interface PaymentData {
    id: string;
    student_id: string;
    amount: number;
    status: PaymentStatus;
    due_date: string;
    description: string;
    school_id: string;
    student_name: string; // Stored directly in payment for easier retrieval in NoSQL
    class_name: string;
}

interface StudentOption {
    id: string;
    name: string;
    class_id?: string;
    classes?: { name: string };
}

const PaymentManagement: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter state
    const [filterStatus, setFilterStatus] = useState('all');

    // Form state
    const [selectedStudentId, setSelectedStudentId] = useState<string | ''>('');
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const [selectedStudentClass, setSelectedStudentClass] = useState<string>('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedStatus, setSelectedStatus] = useState<PaymentStatus>(PaymentStatus.LATE);
    const [paymentReason, setPaymentReason] = useState('frais_scolaire');
    const [selectedMonth, setSelectedMonth] = useState('septembre');
    const [selectedInstallment, setSelectedInstallment] = useState('1ère');

    // Searchable dropdown state
    const [studentSearchTerm, setStudentSearchTerm] = useState('');
    const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
    const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    // Chargement des paiements
    useEffect(() => {
        fetchPayments();
    }, [user?.schoolId, filterStatus]);

    const fetchPayments = async () => {
        if (!user?.schoolId) return;
        setLoading(true);
        
        let q = query(collection(db, "payments"), where("school_id", "==", user.schoolId));

        if (filterStatus !== 'all') {
            q = query(q, where("status", "==", filterStatus));
        }
        
        const snap = await getDocs(q);
        const fetchedPayments = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentData));
        
        // Sorting in JS
        fetchedPayments.sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime());

        setPayments(fetchedPayments);
        setLoading(false);
    };

    // Recherche d'étudiants (Simulée client-side car pas de search textuel natif simple)
    // Pour une vraie app, utiliser Algolia ou fetcher tous les étudiants de l'école (cache)
    useEffect(() => {
        const searchStudents = async () => {
            if (!studentSearchTerm || !user?.schoolId) {
                setStudentOptions([]);
                return;
            }
            
            // Fetch all students for school (optimized via cache in real app)
            const q = query(collection(db, "students"), where("school_id", "==", user.schoolId));
            const snap = await getDocs(q);
            
            // Fetch classes to map names
            const qClasses = query(collection(db, "classes"), where("school_id", "==", user.schoolId));
            const classSnap = await getDocs(qClasses);
            const classesMap = new Map(classSnap.docs.map(d => [d.id, d.data().name]));

            const results = snap.docs
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name,
                        class_id: data.class_id,
                        classes: { name: classesMap.get(data.class_id) || 'N/A' }
                    } as StudentOption;
                })
                .filter(s => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()))
                .slice(0, 5);
            
            setStudentOptions(results);
        };

        const delayDebounceFn = setTimeout(() => {
            if(studentSearchTerm.length > 1) searchStudents();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [studentSearchTerm, user?.schoolId]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsStudentDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [searchContainerRef]);

    const getStatusColor = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.PAID: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
            case PaymentStatus.PARTIAL: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
            case PaymentStatus.LATE: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
            case PaymentStatus.EXEMPTED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        }
    }

    const resetForm = () => {
        setSelectedStudentId('');
        setSelectedStudentClass('');
        setAmount('');
        setDueDate(new Date().toISOString().split('T')[0]);
        setSelectedStatus(PaymentStatus.LATE);
        setStudentSearchTerm('');
        setPaymentReason('frais_scolaire');
        setSelectedMonth('septembre');
        setSelectedInstallment('1ère');
    };

    const handleOpenAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!selectedStudentId || !amount || parseFloat(amount) <= 0 || !user?.schoolId) {
            alert("Veuillez vérifier les informations.");
            return;
        }
        
        let description = '';
        switch(paymentReason) {
            case 'inscription': description = 'Inscription'; break;
            case 'frais_scolaire': description = `Frais Scolaire - ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}`; break;
            case 'frais_etat': description = `Frais de l'état - ${selectedInstallment} Tranche`; break;
            case 'frais_examen': description = `Frais d'examen - ${selectedInstallment} Tranche`; break;
            default: description = "Paiement divers";
        }

        try {
            await addDoc(collection(db, "payments"), {
                student_id: selectedStudentId,
                amount: parseFloat(amount),
                due_date: dueDate,
                status: selectedStatus,
                description: description,
                school_id: user.schoolId,
                student_name: selectedStudentName, // Denormalization
                class_name: selectedStudentClass,
                created_at: new Date().toISOString()
            });

            setIsModalOpen(false);
            fetchPayments();
        } catch (error: any) {
             alert("Erreur: " + error.message);
        }
    };

    const handleExportPDF = () => {
        const schoolName = "LYCEE SALAMA"; 
        const date = new Date().toLocaleDateString('fr-FR');
        const filterText = filterStatus !== 'all' ? `(Filtre: ${filterStatus})` : '';
        
        let content = `
            <html>
            <head>
                <title>Rapport Paiements - ${date}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                    th, td { border-bottom: 1px solid #e2e8f0; padding: 10px; text-align: left; }
                    th { background-color: #f8fafc; }
                    .header { display: flex; justify-content: space-between; align-items: center; }
                </style>
            </head>
            <body>
                <h1>${schoolName}</h1>
                <h2>Rapport des Paiements ${filterText}</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Étudiant</th>
                            <th>Classe</th>
                            <th>Description</th>
                            <th>Statut</th>
                            <th style="text-align: right">Montant</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        let totalAmount = 0;

        payments.forEach(payment => {
            totalAmount += payment.amount;
            content += `
                <tr>
                    <td>${payment.student_name || 'N/A'}</td>
                    <td>${payment.class_name || 'N/A'}</td>
                    <td>${payment.description}</td>
                    <td>${payment.status}</td>
                    <td style="text-align: right">${payment.amount.toFixed(2)} $</td>
                </tr>
            `;
        });

        content += `
                    <tr>
                        <td colspan="4" style="text-align: right; font-weight: bold; padding-top: 20px;">TOTAL</td>
                        <td style="text-align: right; font-weight: bold; padding-top: 20px;">${totalAmount.toFixed(2)} $</td>
                    </tr>
                    </tbody>
                </table>
            </body></html>`;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 250);
        }
    };
    
    const handleGenerateInvoice = (payment: PaymentData) => {
         const cashierName = user?.name || 'N/A';
         const studentName = payment.student_name || 'N/A';
         const className = payment.class_name || 'N/A';

         const receiptHtml = `
            <html>
            <head>
                <title>Recu #${payment.id}</title>
                <style>
                    body { font-family: 'Courier New', monospace; font-size: 10pt; width: 280px; }
                    .center { text-align: center; }
                    .right { text-align: right; }
                    .bold { font-weight: bold; }
                    .line { border-top: 1px dashed #000; margin: 10px 0; }
                    .table { width: 100%; }
                </style>
            </head>
            <body>
                <div class="center">
                    <h1 class="bold">RECU DE PAIEMENT</h1>
                    <p>Smart Ekele School</p>
                </div>
                <div class="line"></div>
                <p>Reçu #: ${payment.id.substring(0, 8)}</p>
                <p>Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                <p>Caissier: ${cashierName}</p>
                <div class="line"></div>
                <p class="bold">ÉLÈVE: ${studentName}</p>
                <p>CLASSE: ${className}</p>
                <table class="table">
                    <tr><td>${payment.description}</td><td class="right">${payment.amount.toFixed(2)} $</td></tr>
                </table>
                <div class="line"></div>
                <p class="bold right">TOTAL: ${payment.amount.toFixed(2)} $</p>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptHtml);
            printWindow.document.close();
            setTimeout(() => { printWindow.focus(); printWindow.print(); printWindow.close(); }, 250);
        }
    }


    const PaymentModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Nouveau paiement</h3>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-800"><i className="fas fa-times h-6 w-6"></i></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Étudiant</label>
                            <div className="relative" ref={searchContainerRef}>
                                <input
                                    type="text"
                                    value={studentSearchTerm}
                                    onChange={(e) => {
                                        setStudentSearchTerm(e.target.value);
                                        if (!isStudentDropdownOpen) setIsStudentDropdownOpen(true);
                                    }}
                                    onFocus={() => setIsStudentDropdownOpen(true)}
                                    placeholder="Rechercher un étudiant..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                                {isStudentDropdownOpen && studentOptions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {studentOptions.map(student => (
                                            <div
                                                key={student.id}
                                                onClick={() => {
                                                    setSelectedStudentId(student.id);
                                                    setSelectedStudentName(student.name);
                                                    setSelectedStudentClass(student.classes?.name || '');
                                                    setStudentSearchTerm(student.name);
                                                    setIsStudentDropdownOpen(false);
                                                }}
                                                className="px-4 py-2 text-sm hover:bg-primary-500 hover:text-white cursor-pointer dark:text-slate-200"
                                            >
                                                {student.name} ({student.classes?.name})
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Classe</label>
                            <input type="text" value={selectedStudentClass} readOnly disabled className="w-full px-3 py-2 border rounded-md bg-slate-100 dark:bg-slate-600 dark:text-slate-300" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motif</label>
                            <select value={paymentReason} onChange={(e) => setPaymentReason(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                <option value="frais_scolaire">Paiement Frais Scolaire</option>
                                <option value="inscription">Inscription</option>
                                <option value="frais_etat">Frais de l'état</option>
                                <option value="frais_examen">Frais d'examen</option>
                            </select>
                        </div>

                        {paymentReason === 'frais_scolaire' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mois</label>
                                <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    {['septembre', 'octobre', 'novembre', 'decembre', 'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        )}
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Montant ($)</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="0.01" className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as PaymentStatus)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-slate-200 rounded-md">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md">Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">Gestion Financière</h1>
            <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl shadow-md">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <h2 className="text-lg md:text-xl font-semibold">Suivi des Paiements</h2>
                    <div className="flex gap-2">
                        <button onClick={handleExportPDF} className="bg-red-600 text-white font-semibold px-3 py-2 rounded-md"><i className="fas fa-file-pdf"></i> Export PDF</button>
                        <button onClick={handleOpenAddModal} className="bg-brand-primary text-white font-semibold px-3 py-2 rounded-md"><i className="fas fa-plus"></i> Nouveau</button>
                    </div>
                </div>

                {/* Filtres */}
                <div className="mb-4 w-full sm:w-64">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                    >
                        <option value="all">Tous les statuts</option>
                        {Object.values(PaymentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>

                {loading ? <p className="text-center">Chargement...</p> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-style text-sm">
                            <thead>
                                <tr>
                                    <th className="p-3">Étudiant</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3">Montant</th>
                                    <th className="p-3">Statut</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length > 0 ? payments.map(payment => (
                                    <tr key={payment.id} className="border-b dark:border-slate-700">
                                        <td className="p-3 font-medium">{payment.student_name || 'Inconnu'}</td>
                                        <td className="p-3">{payment.description}</td>
                                        <td className="p-3">{payment.amount.toFixed(2)} $</td>
                                        <td className="p-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(payment.status)}`}>{payment.status}</span></td>
                                        <td className="p-3">
                                            <button onClick={() => handleGenerateInvoice(payment)} className="text-slate-500 hover:text-primary-600"><i className="fas fa-receipt"></i></button>
                                        </td>
                                    </tr>
                                )) : <tr><td colSpan={5} className="p-4 text-center">Aucun paiement.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {isModalOpen && <PaymentModal />}
        </div>
    );
};

export default PaymentManagement;
