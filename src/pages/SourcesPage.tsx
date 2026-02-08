import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Source, SourceRequest, User } from "../types";
import {
  createSource,
  deleteSource,
  getSources,
  reorderSources,
  updateSource,
} from "../utils/api";

type SourcesContext = {
  sources: Source[];
  setSources: (sources: Source[]) => void;
  currentUser: User;
};

const emptyFormData: SourceRequest = {
  name: "",
  is_enabled: true,
};

export default function SourcesPage() {
  const {
    sources,
    setSources,
    currentUser
  } = useOutletContext<SourcesContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSourceId, setEditingSourceId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<SourceRequest>(emptyFormData);
  const draggedSourceId = useRef<number | null>(null);

  useEffect(() => {
    const fetchSources = async () => {
      const sourcesData = await getSources();
      setSources(sourcesData);
    };

    fetchSources();
  }, [setSources]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingSourceId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (source: Source) => {
    if (!currentUser.is_admin) return;
    setEditingSourceId(source.id);
    setFormData({
      name: source.name,
      is_enabled: source.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSourceId(null);
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

  const handleToggleEnabled = async (source: Source) => {
    if (!currentUser.is_admin) return;
    setSources(
      sources.map((other) =>
        other.id === source.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateSource(source.id, {
      name: source.name,
      is_enabled: !source.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const sourceData = {
      name: formData.name.trim(),
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);
      if (editingSourceId === null) {
        const createdSource = await createSource(sourceData);
        setSources([createdSource, ...sources]);
      } else {
        const updatedSource = await updateSource(
          editingSourceId,
          sourceData
        );

        setSources(
          sources.map((other) =>
            other.id === updatedSource.id ? updatedSource : other
          )
        );
      }

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingSourceId === null) return;

    try {
      setIsDeleting(true);
      await deleteSource(editingSourceId);
      setSources(
        sources.filter(
          (source) => source.id !== editingSourceId
        )
      );
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (sourceId: number) => {
    if (!currentUser.is_admin) return;
    draggedSourceId.current = sourceId;
  };

  const handleDrop = async (targetSourceId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedSourceId.current;
    if (sourceId === null || sourceId === targetSourceId) return;

    const updatedSources = [...sources];
    const fromIndex = updatedSources.findIndex((source) => source.id === sourceId);
    const toIndex = updatedSources.findIndex((source) => source.id === targetSourceId);
    const [movedSource] = updatedSources.splice(fromIndex, 1);
    updatedSources.splice(toIndex, 0, movedSource);

    setSources(updatedSources);
    draggedSourceId.current = null;

    await reorderSources(updatedSources.map((source) => source.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Источники
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить источник
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
            {sources.map((source) => (
              <tr
                key={source.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(source.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(source.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(source)}
                >
                  {source.name}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={source.is_enabled}
                    handleChange={() => handleToggleEnabled(source)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {sources.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет источников
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
                {editingSourceId === null
                  ? "Добавить источник"
                  : "Редактировать источник"}
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
              {editingSourceId !== null ? (
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
