/**
 * Input modal for simple text input
 */

import React, { useState, useEffect } from 'react';
import { Modal, ModalFooter, Button, Input } from '../ui';

export interface InputModalProps {
  isOpen: boolean;
  title: string;
  initialValue?: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onClose: () => void;
}

export function InputModal({
  isOpen,
  title,
  initialValue = '',
  placeholder,
  onSubmit,
  onClose
}: InputModalProps) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <form onSubmit={handleSubmit}>
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          fullWidth
          autoFocus
        />
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" variant="primary">
            Valider
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
