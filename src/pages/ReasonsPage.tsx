import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Reason, ReasonRequest, User } from "../types";
import {
  createReason,
  deleteReason,
  getReasons,
  reorderReasons,
  updateReason,
} from "../utils/api";

type ReasonsContext = {
  reasons: Reason[];
  setReasons: (reasons: Reason[]) => void;
  currentUser: User;
};

const emptyFormData: ReasonRequest = {
  name: "",
  is_enabled: true,
};

export default function ReasonsPage() {
  const {
    reasons,
    setReasons,
    currentUser
  } = useOutletContext<ReasonsContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReasonId, setEditingReasonId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<ReasonRequest>(emptyFormData);
  const draggedReasonId = useRef<number | null>(null);

  useEffect(() => {
    const fetchReasons = async () => {
      const reasonsData = await getReasons();
      setReasons(reasonsData);
    };

    fetchReasons();
  }, [setReasons]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingReasonId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (reason: Reason) => {
    if (!currentUser.is_admin) return;
    setEditingReasonId(reason.id);
    setFormData({
      name: reason.name,
      is_enabled: reason.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReasonId(null);
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

  const handleToggleEnabled = async (reason: Reason) => {
    if (!currentUser.is_admin) return;
    setReasons(
      reasons.map((other) =>
        other.id === reason.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateReason(reason.id, {
      name: reason.name,
      is_enabled: !reason.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const reasonData = {
      name: formData.name.trim(),
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);
      if (editingReasonId === null) {
        const createdReason = await createReason(reasonData);
        setReasons([createdReason, ...reasons]);
      } else {
        const updatedReason = await updateReason(
          editingReasonId,
          reasonData
        );

        setReasons(
          reasons.map((other) =>
            other.id === updatedReason.id
              ? updatedReason
              : other
          )
        );
      }

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingReasonId === null) return;

    try {
      setIsDeleting(true);
      await deleteReason(editingReasonId);
      setReasons(
        reasons.filter(
          (reason) => reason.id !== editingReasonId
        )
      );
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (reasonId: number) => {
    if (!currentUser.is_admin) return;
    draggedReasonId.current = reasonId;
  };

  const handleDrop = async (targetReasonId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedReasonId.current;
    if (sourceId === null || sourceId === targetReasonId) return;

    const updatedReasons = [...reasons];
    const fromIndex = updatedReasons.findIndex((reason) => reason.id === sourceId);
    const toIndex = updatedReasons.findIndex((reason) => reason.id === targetReasonId);
    const [movedReason] = updatedReasons.splice(fromIndex, 1);
    updatedReasons.splice(toIndex, 0, movedReason);

    setReasons(updatedReasons);
    draggedReasonId.current = null;

    await reorderReasons(updatedReasons.map((reason) => reason.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Причины
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить причину
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">Активна</th>
            </tr>
          </thead>

          <tbody>
            {reasons.map((reason) => (
              <tr
                key={reason.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(reason.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(reason.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(reason)}
                >
                  {reason.name}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={reason.is_enabled}
                    handleChange={() => handleToggleEnabled(reason)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {reasons.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет причин
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
                {editingReasonId === null
                  ? "Добавить причину"
                  : "Редактировать причину"}
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
              {editingReasonId !== null ? (
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
