import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Platform, PlatformRequest, User } from "../types";
import {
  createPlatform,
  deletePlatform,
  getPlatforms,
  reorderPlatforms,
  updatePlatform,
  uploadImageFile,
} from "../utils/api";

type PlatformsContext = {
  platforms: Platform[];
  setPlatforms: (platforms: Platform[]) => void;
  currentUser: User;
};

const emptyFormData: PlatformRequest = {
  name: "",
  url: "",
  image_url: undefined,
  is_enabled: true,
};

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function PlatformsPage() {
  const {
    platforms,
    setPlatforms,
    currentUser
  } = useOutletContext<PlatformsContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatformId, setEditingPlatformId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<PlatformRequest>(emptyFormData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draggedPlatformId = useRef<number | null>(null);

  const isUrlInvalid =
    formData.url.trim().length > 0 &&
    !isValidUrl(formData.url.trim());

  useEffect(() => {
    const fetchPlatforms = async () => {
      const platformsData = await getPlatforms();
      setPlatforms(platformsData);
    };

    fetchPlatforms();
  }, [setPlatforms]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingPlatformId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (platform: Platform) => {
    if (!currentUser.is_admin) return;
    setEditingPlatformId(platform.id);
    setFormData({
      name: platform.name,
      url: platform.url,
      image_url: platform.image_url,
      is_enabled: platform.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPlatformId(null);
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

  const handleImageFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;

    try {
      setIsUploading(true);
      const uploadedImage = await uploadImageFile(imageFile);
      setFormData((value) => ({
        ...value,
        image_url: uploadedImage.image_url,
      }));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleToggleEnabled = async (platform: Platform) => {
    if (!currentUser.is_admin) return;
    setPlatforms(
      platforms.map((other) =>
        other.id === platform.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updatePlatform(platform.id, {
      name: platform.name,
      url: platform.url,
      image_url: platform.image_url,
      is_enabled: !platform.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.url.trim()) return;
    if (isUrlInvalid) return;

    const payload = {
      name: formData.name.trim(),
      url: formData.url.trim(),
      image_url: formData.image_url,
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);

      if (editingPlatformId === null) {
        const createdPlatform = await createPlatform(payload);
        setPlatforms([createdPlatform, ...platforms]);
      } else {
        const updatedPlatform = await updatePlatform(
          editingPlatformId,
          payload
        );

        setPlatforms(
          platforms.map((other) =>
            other.id === updatedPlatform.id
              ? updatedPlatform
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
    if (editingPlatformId === null) return;

    try {
      setIsDeleting(true);
      await deletePlatform(editingPlatformId);
      setPlatforms(
        platforms.filter(
          (platform) => platform.id !== editingPlatformId
        )
      );
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (platformId: number) => {
    if (!currentUser.is_admin) return;
    draggedPlatformId.current = platformId;
  };

  const handleDrop = async (targetPlatformId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedPlatformId.current;
    if (sourceId === null || sourceId === targetPlatformId) return;

    const updatedPlatforms = [...platforms];
    const fromIndex = updatedPlatforms.findIndex((platform) => platform.id === sourceId);
    const toIndex = updatedPlatforms.findIndex((platform) => platform.id === targetPlatformId);
    const [movedPlatform] = updatedPlatforms.splice(fromIndex, 1);
    updatedPlatforms.splice(toIndex, 0, movedPlatform);

    setPlatforms(updatedPlatforms);
    draggedPlatformId.current = null;

    await reorderPlatforms(updatedPlatforms.map((platform) => platform.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Платформы
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить платформу
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Картинка</th>
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">URL</th>
              <th className="py-3 pr-4">Активна</th>
            </tr>
          </thead>

          <tbody>
            {platforms.map((platform) => (
              <tr
                key={platform.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(platform.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(platform.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(platform)}
                >
                  {platform.image_url ? (
                    <img
                      src={platform.image_url}
                      alt={platform.name}
                      className="h-8 w-8 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-gray-100" />
                  )}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(platform)}
                >
                  {platform.name}
                </td>

                <td className="py-3 pr-4">
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    title={platform.url}
                    className="block max-w-[400px] truncate text-gray-900 underline underline-offset-2"
                  >
                    {platform.url}
                  </a>
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={platform.is_enabled}
                    handleChange={() => handleToggleEnabled(platform)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {platforms.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет платформ
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
                {editingPlatformId === null
                  ? "Добавить платформу"
                  : "Редактировать платформу"}
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

              <div>
                <div className="text-xs font-semibold text-gray-700">
                  URL
                </div>
                <input
                  value={formData.url}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      url: event.target.value,
                    }))
                  }
                  className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none ${isUrlInvalid
                    ? "border-red-400 focus:border-red-400"
                    : "border-gray-200 focus:border-gray-400"
                    }`}
                  disabled={!currentUser.is_admin}
                />
                {isUrlInvalid && (
                  <div className="mt-1 text-xs text-red-500">
                    Введите корректный URL
                  </div>
                )}
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-700">
                  Картинка
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="platform"
                      className="h-10 w-10 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-gray-100" />
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
                  >
                    {isUploading ? "Загрузка..." : "Загрузить"}
                  </button>

                  {formData.image_url && (
                    <button
                      onClick={() =>
                        setFormData((value) => ({
                          ...value,
                          image_url: undefined,
                        }))
                      }
                      className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
                    >
                      Удалить
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {editingPlatformId !== null ? (
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
                disabled={
                  isSaving ||
                  !formData.name.trim() ||
                  !formData.url.trim() ||
                  isUrlInvalid ||
                  !currentUser.is_admin
                }
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
