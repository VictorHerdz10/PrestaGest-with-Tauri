// src/components/borrower/BorrowerModal.tsx
import { useState } from 'react';
import { type BorrowerResponse, type BorrowerForm as BorrowerFormData } from '../../schemas/borrower.schema';
import { BorrowerForm } from './BorrowerForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

interface BorrowerModalProps {
  borrower?: BorrowerResponse;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BorrowerFormData) => void;
  isSubmitting: boolean;
  isCreate?: boolean;
  onDelete?: (id: number) => Promise<void>;
}

export function BorrowerModal({ 
  borrower, 
  isOpen, 
  onClose, 
  onSubmit, 
  isSubmitting,
  isCreate = false,
  onDelete
}: BorrowerModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    if (onDelete && borrower?.id) {
      await onDelete(borrower.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 border border-gray-100 my-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {isCreate ? 'Agregar Nuevo Prestatario' : 'Editar Prestatario'}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                disabled={isSubmitting}
              >
                ✕
              </button>
            </div>
            
            <BorrowerForm 
              initialValues={borrower}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
              onCancel={onClose}
            />

            {!isCreate && onDelete && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                {showDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-3">¿Estás seguro de que quieres eliminar este prestatario?</p>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-1.5"
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={isSubmitting}
                        className="px-4 py-1.5"
                      >
                        Confirmar Eliminación
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isSubmitting}
                    className="w-full text-red-600 hover:text-red-800 text-sm font-medium py-2"
                  >
                    Eliminar Prestatario
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}