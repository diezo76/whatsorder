'use client';

import { useState, useEffect } from 'react';
import { X, User } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AssignStaffModalProps {
  conversationId: string;
  currentAssignedTo?: string | null;
  onAssign: (assignedToId: string | null) => void;
  onClose: () => void;
}

export function AssignStaffModal({
  conversationId,
  currentAssignedTo,
  onAssign,
  onClose,
}: AssignStaffModalProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(currentAssignedTo || null);

  useEffect(() => {
    loadStaffMembers();
  }, []);

  const loadStaffMembers = async () => {
    try {
      const response = await fetch('/api/staff');
      const data = await response.json();
      
      if (data.success) {
        setStaffMembers(data.staff);
      } else {
        console.error('Failed to load staff:', data.error);
      }
    } catch (error) {
      console.error('Failed to load staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    onAssign(selectedId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold">Assigner la conversation</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={() => setSelectedId(null)}
                className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                  selectedId === null
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User size={20} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">Non assignée</p>
                    <p className="text-sm text-gray-500">Aucun membre assigné</p>
                  </div>
                </div>
              </button>

              {staffMembers.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedId(staff.id)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
                    selectedId === staff.id
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <User size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{staff.name}</p>
                      <p className="text-sm text-gray-500">{staff.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={handleAssign}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}
