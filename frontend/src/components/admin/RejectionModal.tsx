import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  blogTitle: string;
  isLoading?: boolean;
}

const RejectionModal: React.FC<RejectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  blogTitle,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isLoading) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    if (reason.trim().length < 10) {
      toast.error("Rejection reason must be at least 10 characters");
      return;
    }

    onConfirm(reason.trim());
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason("");
      onClose();
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={handleClose}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-2xl rounded-2xl z-[10000]"
              style={{ transform: 'translateZ(0)' }}
              onClick={(e) => e.stopPropagation()}
            >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Reject Blog</h3>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-4">
              You are about to reject the blog:
            </p>
            <p className="font-medium text-gray-900 mb-4 p-3 bg-gray-50 rounded-lg">
              "{blogTitle}"
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a clear reason for rejection. This will be shown to
              the author.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please explain why this blog is being rejected..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  disabled={isLoading}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {reason.length}/500 characters (minimum 10 characters)
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    isLoading || !reason.trim() || reason.trim().length < 10
                  }
                  className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <span>Reject Blog</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default RejectionModal;
