import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'warning',
  onConfirm,
  onClose,
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      case 'primary':
      default:
        return <HelpCircle className="w-6 h-6 text-[#354F52] dark:text-[#6B8E6B]" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/40';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40';
      case 'primary':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40';
    }
  };

  const getButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
      case 'primary':
      default:
        return 'primary';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${getIconBg()}`}>
            {getIcon()}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line pt-0.5">
            {message}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={getButtonVariant()}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Memproses...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

