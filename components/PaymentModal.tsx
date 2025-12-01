import React, { FormEvent, useRef, useEffect } from 'react';
import { PaymentStatus } from '../types';

interface StudentOption {
    id: string;
    name: string;
    class_id?: string;
    classes?: { name: string };
}

interface PaymentModalProps {
    isOpen: boolean;
    studentSearchTerm: string;
    studentOptions: StudentOption[];
    isStudentDropdownOpen: boolean;
    selectedStudentClass: string;
    paymentReason: string;
    selectedMonth: string;
    amount: string;
    selectedStatus: PaymentStatus;
    formErrors: Record<string, string>;

    onStudentSearchChange: (value: string) => void;
    onDropdownOpenChange: (value: boolean) => void;
    onStudentSelect: (student: StudentOption) => void;
    onPaymentReasonChange: (value: string) => void;
    onMonthChange: (value: string) => void;
    onAmountChange: (value: string) => void;
    onStatusChange: (value: PaymentStatus) => void;
    onSubmit: (e: FormEvent) => void;
    onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    studentSearchTerm,
    studentOptions,
    isStudentDropdownOpen,
    selectedStudentClass,
    paymentReason,
    selectedMonth,
    amount,
    selectedStatus,
    formErrors,
    onStudentSearchChange,
    onDropdownOpenChange,
    onStudentSelect,
    onPaymentReasonChange,
    onMonthChange,
    onAmountChange,
    onStatusChange,
    onSubmit,
    onClose,
}) => {
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                onDropdownOpenChange(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onDropdownOpenChange]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-4 sm:p-6 w-full max-w-lg m-4 transform transition-all animate-scale-in">
                <div className="flex justify-between items-center border-b pb-3 mb-4 dark:border-slate-700">
                    <h3 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">Nouveau paiement</h3>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"><i className="fas fa-times h-6 w-6"></i></button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="space-y-3 sm:space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Étudiant *</label>
                            <div className="relative" ref={searchContainerRef}>
                                <input
                                    type="text"
                                    value={studentSearchTerm}
                                    onChange={(e) => {
                                        onStudentSearchChange(e.target.value);
                                        if (!isStudentDropdownOpen) onDropdownOpenChange(true);
                                    }}
                                    onFocus={() => onDropdownOpenChange(true)}
                                    placeholder="Rechercher un étudiant..."
                                    className={`w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                                        formErrors.student ? 'border-red-500' : 'border-slate-300'
                                    }`}
                                />
                                {formErrors.student && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.student}</p>}
                                {isStudentDropdownOpen && studentOptions.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border rounded-md shadow-lg max-h-48 overflow-y-auto">
                                        {studentOptions.map(student => (
                                            <div
                                                key={student.id}
                                                onClick={() => onStudentSelect(student)}
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
                            <select value={paymentReason} onChange={(e) => onPaymentReasonChange(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                <option value="frais_scolaire">Paiement Frais Scolaire</option>
                                <option value="inscription">Inscription</option>
                                <option value="frais_etat">Frais de l'état</option>
                                <option value="frais_examen">Frais d'examen</option>
                            </select>
                        </div>

                        {paymentReason === 'frais_scolaire' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Mois</label>
                                <select value={selectedMonth} onChange={(e) => onMonthChange(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                    {['septembre', 'octobre', 'novembre', 'decembre', 'janvier', 'fevrier', 'mars', 'avril', 'mai', 'juin'].map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Montant ($) *</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => onAmountChange(e.target.value)}
                                min="0"
                                step="0.01"
                                className={`w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white ${
                                    formErrors.amount ? 'border-red-500' : 'border-slate-300'
                                }`}
                            />
                            {formErrors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.amount}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Statut</label>
                            <select value={selectedStatus} onChange={(e) => onStatusChange(e.target.value as PaymentStatus)} className="w-full px-3 py-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                                {Object.values(PaymentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4 border-t pt-4 dark:border-slate-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors">Annuler</button>
                        <button type="submit" className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-secondary transition-colors">Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentModal;
