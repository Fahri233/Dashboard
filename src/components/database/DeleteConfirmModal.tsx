import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';
import { K3Finding } from '../../types/k3';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  finding: K3Finding | null;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  finding
}) => {
  if (!finding) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Konfirmasi Hapus Temuan" maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-800 dark:text-red-300 border border-red-200 dark:border-red-900/40">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
          <p className="text-sm">
            Apakah Anda yakin ingin menghapus temuan <strong>No. {finding.no}</strong> (
            <em>{finding.potensiBahaya}</em>)? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Hapus Temuan
          </Button>
        </div>
      </div>
    </Modal>
  );
};

