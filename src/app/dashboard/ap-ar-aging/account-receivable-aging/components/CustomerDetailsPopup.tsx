// components/CustomerDetailsPopup.tsx
import React from 'react';
import { AgingRow } from '@/api/agingService';


interface CustomerDetailsPopupProps {
    customer: AgingRow | null;
    onClose: () => void;
}

export default function CustomerDetailsPopup({ customer, onClose }: CustomerDetailsPopupProps) {
    if (!customer) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="text-right">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>
                <h3 className="text-2xl font-bold text-center mb-4">Customer Details</h3>
                <div className="mb-4">
                    <p className="text-gray-700"><strong>Customer Name:</strong> {customer.entityName}</p>
                    <p className="text-gray-700"><strong>ID:</strong> {customer.entityId}</p>
                </div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-semibold text-gray-600">Current:</span>
                        <span className="text-gray-800">{(customer.current)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-semibold text-gray-600">1-30 Days:</span>
                        <span className="text-gray-800">{(customer.agingBucket1_30)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-semibold text-gray-600">31-60 Days:</span>
                        <span className="text-gray-800">{(customer.agingBucket31_60)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-semibold text-gray-600">61-90 Days:</span>
                        <span className="text-gray-800">{(customer.agingBucket61_90)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-1">
                        <span className="font-semibold text-gray-600">91+ Days:</span>
                        <span className="text-gray-800">{(customer.agingBucket91Over)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg pt-2">
                        <span>Total:</span>
                        <span>{(customer.total)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}