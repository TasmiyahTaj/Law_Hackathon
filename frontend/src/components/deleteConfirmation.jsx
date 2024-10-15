import React from 'react';

const DeleteConfirmationModal = ({ title, onCancel, onDelete }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-semibold mb-4">Delete "{title}"?</h2>
        <p className="text-gray-500 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
