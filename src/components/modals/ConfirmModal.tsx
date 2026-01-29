/**
 * Confirmation modal
 */

import React from 'react';
import { Modal, ModalFooter, Button } from '../ui';
import { AlertCircle } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  danger = false,
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      <div className="flex items-start gap-4">
        {danger && (
          <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
            <AlertCircle className="text-red-600" size={24} />
          </div>
        )}
        <p className="text-gray-700">{message}</p>
      </div>
      <ModalFooter>
        <Button variant="ghost" onClick={onCancel}>
          {cancelText}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
