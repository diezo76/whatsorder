'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, X, ChevronDown, ChevronRight, Package, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { OptionGroup, MenuItemOption } from '@/types/menu';

// Wrapper sortable qui passe les props de drag handle via render prop
function SortableGroupWrapper({
  id,
  children,
}: {
  id: string;
  children: (dragHandleProps: Record<string, any>) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg overflow-hidden">
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

// Wrapper sortable pour une option dans un groupe
function SortableOptionWrapper({
  id,
  children,
}: {
  id: string;
  children: (dragHandleProps: Record<string, any>) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      {children({ ...attributes, ...listeners })}
    </div>
  );
}

interface OptionGroupManagerProps {
  menuItemId: string;
  initialGroups?: OptionGroup[];
  onGroupsChange?: (groups: OptionGroup[]) => void;
}

export function OptionGroupManager({ menuItemId, initialGroups = [], onGroupsChange }: OptionGroupManagerProps) {
  const [groups, setGroups] = useState<OptionGroup[]>(initialGroups);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // État pour nouveau groupe
  const [newGroup, setNewGroup] = useState({
    name: '',
    nameAr: '',
    includedCount: 1,
    minSelections: 1,
    maxSelections: undefined as number | undefined,
    isRequired: true,
  });

  // État pour nouvelle option dans un groupe
  const [addingOptionToGroup, setAddingOptionToGroup] = useState<string | null>(null);
  const [newOption, setNewOption] = useState({
    name: '',
    nameAr: '',
    priceModifier: 0,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Charger les groupes au montage
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get<{ success: boolean; optionGroups: OptionGroup[] }>(
          `/menu/items/${menuItemId}/option-groups`
        );
        setGroups(response.data.optionGroups || []);
        if (onGroupsChange) {
          onGroupsChange(response.data.optionGroups || []);
        }
      } catch (error) {
        console.error('Failed to fetch option groups:', error);
      }
    };

    if (menuItemId) {
      fetchGroups();
    }
  }, [menuItemId, onGroupsChange]);

  // Toggle expansion d'un groupe
  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Drag & drop des groupes
  const handleGroupDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = groups.findIndex(g => g.id === active.id);
    const newIndex = groups.findIndex(g => g.id === over.id);

    const reordered = arrayMove(groups, oldIndex, newIndex);
    setGroups(reordered);
    if (onGroupsChange) onGroupsChange(reordered);

    try {
      await api.put(`/menu/items/${menuItemId}/option-groups/reorder`, {
        groupIds: reordered.map(g => g.id),
      });
    } catch (error) {
      console.error('Failed to reorder groups:', error);
      toast.error('Erreur lors du réordonnancement');
      setGroups(groups);
    }
  }, [groups, menuItemId, onGroupsChange]);

  // Drag & drop des options dans un groupe
  const handleOptionDragEnd = useCallback(async (groupId: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const group = groups.find(g => g.id === groupId);
    if (!group || !group.options) return;

    const oldIndex = group.options.findIndex(o => o.id === active.id);
    const newIndex = group.options.findIndex(o => o.id === over.id);

    const reorderedOptions = arrayMove(group.options, oldIndex, newIndex);
    const updatedGroups = groups.map(g =>
      g.id === groupId ? { ...g, options: reorderedOptions } : g
    );
    setGroups(updatedGroups);
    if (onGroupsChange) onGroupsChange(updatedGroups);

    try {
      await api.put(`/menu/items/${menuItemId}/options/reorder`, {
        optionIds: reorderedOptions.map(o => o.id),
        groupId,
      });
    } catch (error) {
      console.error('Failed to reorder options:', error);
      toast.error('Erreur lors du réordonnancement');
      setGroups(groups);
    }
  }, [groups, menuItemId, onGroupsChange]);

  // Créer un groupe
  const handleAddGroup = async () => {
    if (!newGroup.name) {
      toast.error('Le nom du groupe est requis');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; optionGroup: OptionGroup }>(
        `/menu/items/${menuItemId}/option-groups`,
        {
          name: newGroup.name,
          nameAr: newGroup.nameAr || undefined,
          includedCount: newGroup.includedCount,
          minSelections: newGroup.minSelections,
          maxSelections: newGroup.maxSelections || undefined,
          isRequired: newGroup.isRequired,
        }
      );

      const updatedGroups = [...groups, response.data.optionGroup];
      setGroups(updatedGroups);
      if (onGroupsChange) {
        onGroupsChange(updatedGroups);
      }
      
      // Expand le nouveau groupe
      setExpandedGroups(prev => new Set(prev).add(response.data.optionGroup.id));
      
      resetGroupForm();
      toast.success('Groupe d\'options créé');
    } catch (error: any) {
      console.error('Failed to add group:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la création du groupe');
    } finally {
      setLoading(false);
    }
  };

  // Modifier un groupe
  const handleUpdateGroup = async (groupId: string) => {
    try {
      setLoading(true);
      const response = await api.put<{ success: boolean; optionGroup: OptionGroup }>(
        `/menu/items/${menuItemId}/option-groups/${groupId}`,
        {
          name: newGroup.name,
          nameAr: newGroup.nameAr || undefined,
          includedCount: newGroup.includedCount,
          minSelections: newGroup.minSelections,
          maxSelections: newGroup.maxSelections || undefined,
          isRequired: newGroup.isRequired,
        }
      );

      const updatedGroups = groups.map(g => 
        g.id === groupId ? response.data.optionGroup : g
      );
      setGroups(updatedGroups);
      if (onGroupsChange) {
        onGroupsChange(updatedGroups);
      }
      
      resetGroupForm();
      toast.success('Groupe modifié');
    } catch (error: any) {
      console.error('Failed to update group:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un groupe
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Supprimer ce groupe et toutes ses options ?')) return;

    try {
      setLoading(true);
      await api.delete(`/menu/items/${menuItemId}/option-groups/${groupId}`);

      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
      if (onGroupsChange) {
        onGroupsChange(updatedGroups);
      }
      toast.success('Groupe supprimé');
    } catch (error: any) {
      console.error('Failed to delete group:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Ajouter une option dans un groupe
  const handleAddOption = async (groupId: string) => {
    if (!newOption.name) {
      toast.error('Le nom de l\'option est requis');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post<{ success: boolean; option: MenuItemOption }>(
        `/menu/items/${menuItemId}/option-groups/${groupId}/options`,
        {
          name: newOption.name,
          nameAr: newOption.nameAr || undefined,
          priceModifier: newOption.priceModifier || 0,
        }
      );

      // Mettre à jour le groupe avec la nouvelle option
      const updatedGroups = groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            options: [...(g.options || []), response.data.option],
          };
        }
        return g;
      });
      setGroups(updatedGroups);
      if (onGroupsChange) {
        onGroupsChange(updatedGroups);
      }
      
      resetOptionForm();
      toast.success('Option ajoutée');
    } catch (error: any) {
      console.error('Failed to add option:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de l\'ajout');
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une option
  const handleDeleteOption = async (groupId: string, optionId: string) => {
    if (!confirm('Supprimer cette option ?')) return;

    try {
      setLoading(true);
      await api.delete(`/menu/items/${menuItemId}/option-groups/${groupId}/options/${optionId}`);

      const updatedGroups = groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.filter(o => o.id !== optionId),
          };
        }
        return g;
      });
      setGroups(updatedGroups);
      if (onGroupsChange) {
        onGroupsChange(updatedGroups);
      }
      toast.success('Option supprimée');
    } catch (error: any) {
      console.error('Failed to delete option:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Reset form pour groupe
  const resetGroupForm = () => {
    setIsAddingGroup(false);
    setEditingGroupId(null);
    setNewGroup({
      name: '',
      nameAr: '',
      includedCount: 1,
      minSelections: 1,
      maxSelections: undefined,
      isRequired: true,
    });
  };

  // Reset form pour option
  const resetOptionForm = () => {
    setAddingOptionToGroup(null);
    setNewOption({
      name: '',
      nameAr: '',
      priceModifier: 0,
    });
  };

  // Commencer l'édition d'un groupe
  const startEditingGroup = (group: OptionGroup) => {
    setEditingGroupId(group.id);
    setNewGroup({
      name: group.name,
      nameAr: group.nameAr || '',
      includedCount: group.includedCount,
      minSelections: group.minSelections,
      maxSelections: group.maxSelections,
      isRequired: group.isRequired,
    });
    setIsAddingGroup(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Groupes d'options</h3>
          <p className="text-sm text-gray-500">
            Créez des groupes avec X choix inclus (ex: "Choix de 3 viandes")
          </p>
        </div>
        {!isAddingGroup && (
          <button
            onClick={() => setIsAddingGroup(true)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus size={16} />
            Nouveau groupe
          </button>
        )}
      </div>

      {/* Formulaire d'ajout/modification de groupe */}
      {isAddingGroup && (
        <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-900">
              {editingGroupId ? 'Modifier le groupe' : 'Nouveau groupe d\'options'}
            </h4>
            <button onClick={resetGroupForm} className="p-1 hover:bg-blue-100 rounded">
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Nom du groupe (ex: Choix de viandes)"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              placeholder="Nom arabe (optionnel)"
              value={newGroup.nameAr}
              onChange={(e) => setNewGroup({ ...newGroup, nameAr: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choix inclus (gratuits)
              </label>
              <input
                type="number"
                min="0"
                value={newGroup.includedCount}
                onChange={(e) => setNewGroup({ ...newGroup, includedCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. requis
              </label>
              <input
                type="number"
                min="0"
                value={newGroup.minSelections}
                onChange={(e) => setNewGroup({ ...newGroup, minSelections: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. autorisé
              </label>
              <input
                type="number"
                min="0"
                placeholder="Illimité"
                value={newGroup.maxSelections || ''}
                onChange={(e) => setNewGroup({ ...newGroup, maxSelections: parseInt(e.target.value) || undefined })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newGroup.isRequired}
              onChange={(e) => setNewGroup({ ...newGroup, isRequired: e.target.checked })}
            />
            <span className="text-sm">Le client doit choisir (groupe obligatoire)</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={editingGroupId ? () => handleUpdateGroup(editingGroupId) : handleAddGroup}
              disabled={loading || !newGroup.name}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {editingGroupId ? 'Enregistrer' : 'Créer le groupe'}
            </button>
            <button
              onClick={resetGroupForm}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Liste des groupes */}
      {groups.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupDragEnd}>
          <SortableContext items={groups.map(g => g.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {groups.map((group) => (
                <SortableGroupWrapper key={group.id} id={group.id}>
                  {(dragHandleProps) => (
                    <>
                      {/* Header du groupe - identique à avant + poignée drag */}
                      <div
                        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleGroupExpansion(group.id)}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                            onClick={(e) => e.stopPropagation()}
                            {...dragHandleProps}
                          >
                            <GripVertical size={18} />
                          </button>
                          {expandedGroups.has(group.id) ? (
                            <ChevronDown size={20} className="text-gray-500" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-500" />
                          )}
                          <Package size={20} className="text-blue-600" />
                          <div>
                            <p className="font-semibold">{group.name}</p>
                            <p className="text-sm text-gray-600">
                              {group.includedCount} inclus
                              {group.minSelections > 0 && ` • Min: ${group.minSelections}`}
                              {group.maxSelections && ` • Max: ${group.maxSelections}`}
                              {group.isRequired && ' • Obligatoire'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <span className="text-sm text-gray-500 mr-2">
                            {group.options?.length || 0} options
                          </span>
                          <button
                            onClick={() => startEditingGroup(group)}
                            disabled={loading}
                            className="p-2 hover:bg-gray-200 rounded transition-colors"
                            title="Modifier"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group.id)}
                            disabled={loading}
                            className="p-2 hover:bg-red-100 text-red-600 rounded transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Options du groupe (expandable) - identique à avant + drag pour options */}
                      {expandedGroups.has(group.id) && (
                        <div className="p-4 border-t bg-white">
                          {/* Liste des options */}
                          {group.options && group.options.length > 0 ? (
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={(event) => handleOptionDragEnd(group.id, event)}
                            >
                              <SortableContext
                                items={group.options.map(o => o.id)}
                                strategy={verticalListSortingStrategy}
                              >
                                <div className="space-y-2 mb-4">
                                  {group.options.map((option, index) => (
                                    <SortableOptionWrapper key={option.id} id={option.id}>
                                      {(optionDragProps) => (
                                        <>
                                          <div className="flex items-center gap-2">
                                            <button
                                              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 touch-none"
                                              {...optionDragProps}
                                            >
                                              <GripVertical size={14} />
                                            </button>
                                            <span className="text-sm text-gray-400 w-6">{index + 1}.</span>
                                            <div>
                                              <p className="font-medium">{option.name}</p>
                                              {option.nameAr && (
                                                <p className="text-sm text-gray-500">{option.nameAr}</p>
                                              )}
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <span className={`text-sm font-medium ${option.priceModifier > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                              {option.priceModifier > 0 ? `+${option.priceModifier} EGP` : 'Gratuit'}
                                            </span>
                                            <button
                                              onClick={() => handleDeleteOption(group.id, option.id)}
                                              disabled={loading}
                                              className="p-1 hover:bg-red-100 text-red-600 rounded"
                                              title="Supprimer"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </SortableOptionWrapper>
                                  ))}
                                </div>
                              </SortableContext>
                            </DndContext>
                          ) : (
                            <p className="text-sm text-gray-500 mb-4">
                              Aucune option dans ce groupe
                            </p>
                          )}

                          {/* Formulaire d'ajout d'option */}
                          {addingOptionToGroup === group.id ? (
                            <div className="p-3 border rounded-lg bg-gray-50 space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                <input
                                  type="text"
                                  placeholder="Nom (ex: Boeuf)"
                                  value={newOption.name}
                                  onChange={(e) => setNewOption({ ...newOption, name: e.target.value })}
                                  className="px-3 py-2 border rounded"
                                />
                                <input
                                  type="text"
                                  placeholder="Nom arabe"
                                  value={newOption.nameAr}
                                  onChange={(e) => setNewOption({ ...newOption, nameAr: e.target.value })}
                                  className="px-3 py-2 border rounded"
                                />
                                <input
                                  type="number"
                                  placeholder="Prix supplément"
                                  min="0"
                                  step="0.5"
                                  value={newOption.priceModifier || ''}
                                  onChange={(e) => setNewOption({ ...newOption, priceModifier: parseFloat(e.target.value) || 0 })}
                                  className="px-3 py-2 border rounded"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddOption(group.id)}
                                  disabled={loading || !newOption.name}
                                  className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  Ajouter
                                </button>
                                <button
                                  onClick={resetOptionForm}
                                  className="px-3 py-1.5 bg-gray-300 text-sm rounded hover:bg-gray-400"
                                >
                                  Annuler
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setAddingOptionToGroup(group.id)}
                              className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Plus size={14} />
                              Ajouter une option
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </SortableGroupWrapper>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : !isAddingGroup ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
          <Package size={40} className="mx-auto mb-2 text-gray-300" />
          <p>Aucun groupe d'options</p>
          <p className="text-sm">
            Créez un groupe pour définir des choix avec quota inclus
          </p>
        </div>
      ) : null}
    </div>
  );
}
