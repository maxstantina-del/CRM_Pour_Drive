import { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';

interface InputModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (value: string) => void;
    title: string;
    message?: string;
    defaultValue?: string;
    placeholder?: string;
    confirmLabel?: string;
    cancelLabel?: string;
}

export function InputModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    defaultValue = '',
    placeholder = '',
    confirmLabel = 'Valider',
    cancelLabel = 'Annuler'
}: InputModalProps) {
    const [value, setValue] = useState(defaultValue);

    // Reset value when modal opens
    useEffect(() => {
        if (isOpen) {
            setValue(defaultValue);
        }
    }, [isOpen, defaultValue]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        onConfirm(value);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                {message && <p className="text-gray-300">{message}</p>}

                <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    autoFocus
                    className="w-full"
                />

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose}>
                        {cancelLabel}
                    </Button>
                    <Button type="submit">
                        {confirmLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
