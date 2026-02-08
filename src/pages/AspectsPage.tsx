import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Aspect, AspectRequest, User } from "../types";
import {
  createAspect,
  deleteAspect,
  getAspects,
  reorderAspects,
  updateAspect,
} from "../utils/api";

type AspectsContext = {
  aspects: Aspect[];
  setAspects: (aspects: Aspect[]) => void;
  currentUser: User;
};

const emptyFormData: AspectRequest = {
  name: "",
  is_enabled: true,
};

export default function AspectsPage() {
  const {
    aspects,
    setAspects,
    currentUser
  } = useOutletContext<AspectsContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAspectId, setEditingAspectId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<AspectRequest>(emptyFormData);
  const draggedAspectId = useRef<number | null>(null);

  useEffect(() => {
    const fetchAspects = async () => {
      const aspectsData = await getAspects();
      setAspects(aspectsData);
    };

    fetchAspects();
  }, [setAspects]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingAspectId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (aspect: Aspect) => {
    if (!currentUser.is_admin) return;
    setEditingAspectId(aspect.id);
    setFormData({
      name: aspect.name,
      is_enabled: aspect.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAspectId(null);
    setFormData(emptyFormData);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleToggleEnabled = async (aspect: Aspect) => {
    if (!currentUser.is_admin) return;
    setAspects(
      aspects.map((other) =>
        other.id === aspect.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateAspect(aspect.id, {
      name: aspect.name,
      is_enabled: !aspect.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const aspectData = {
      name: formData.name.trim(),
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);
      if (editingAspectId === null) {
        const createdAspect = await createAspect(aspectData);
        setAspects([createdAspect, ...aspects]);
      } else {
        const updatedAspect = await updateAspect(
          editingAspectId,
          aspectData
        );

        setAspects(
          aspects.map((other) =>
            other.id === updatedAspect.id ? updatedAspect : other
          )
        );
      }

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingAspectId === null) return;

    try {
      setIsDeleting(true);
      await deleteAspect(editingAspectId);
      setAspects(
        aspects.filter(
          (aspect) => aspect.id !== editingAspectId
        )
      );
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (aspectId: number) => {
    if (!currentUser.is_admin) return;
    draggedAspectId.current = aspectId;
  };

  const handleDrop = async (targetAspectId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedAspectId.current;
    if (sourceId === null || sourceId === targetAspectId) return;

    const updatedAspects = [...aspects];
    const fromIndex = updatedAspects.findIndex((aspect) => aspect.id === sourceId);
    const toIndex = updatedAspects.findIndex((aspect) => aspect.id === targetAspectId);
    const [movedAspect] = updatedAspects.splice(fromIndex, 1);
    updatedAspects.splice(toIndex, 0, movedAspect);

    setAspects(updatedAspects);
    draggedAspectId.current = null;

    await reorderAspects(updatedAspects.map((aspect) => aspect.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Аспекты
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить аспект
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">Активен</th>
            </tr>
          </thead>

          <tbody>
            {aspects.map((aspect) => (
              <tr
                key={aspect.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(aspect.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(aspect.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(aspect)}
                >
                  {aspect.name}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={aspect.is_enabled}
                    disabled={!currentUser.is_admin}
                    handleChange={() => handleToggleEnabled(aspect)}
                  />
                </td>
              </tr>
            ))}

            {aspects.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет аспектов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-base font-semibold text-gray-900">
                {editingAspectId === null
                  ? "Добавить аспект"
                  : "Редактировать аспект"}
              </div>

              <button
                onClick={closeModal}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div>
                <div className="text-xs font-semibold text-gray-700">
                  Название
                </div>
                <input
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  disabled={!currentUser.is_admin}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {editingAspectId !== null ? (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving || !currentUser.is_admin}
                  className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {isDeleting ? "Удаление..." : "Удалить"}
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name.trim() || !currentUser.is_admin}
                className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-60"
              >
                {isSaving ? "Сохранение..." : "Сохранить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
