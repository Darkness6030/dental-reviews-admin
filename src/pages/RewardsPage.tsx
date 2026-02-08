import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Reward, RewardRequest, User } from "../types";
import {
  createReward,
  deleteReward,
  getRewards,
  reorderRewards,
  updateReward,
  uploadImageFile,
} from "../utils/api";

type RewardsContext = {
  rewards: Reward[];
  setRewards: (rewards: Reward[]) => void;
  currentUser: User;
};

const emptyFormData: RewardRequest = {
  name: "",
  image_url: undefined,
  is_enabled: true,
};

export default function RewardsPage() {
  const {
    rewards,
    setRewards,
    currentUser
  } = useOutletContext<RewardsContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRewardId, setEditingRewardId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<RewardRequest>(emptyFormData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draggedRewardId = useRef<number | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      const rewardsData = await getRewards();
      setRewards(rewardsData);
    };

    fetchRewards();
  }, [setRewards]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingRewardId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (reward: Reward) => {
    if (!currentUser.is_admin) return;
    setEditingRewardId(reward.id);
    setFormData({
      name: reward.name,
      image_url: reward.image_url,
      is_enabled: reward.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRewardId(null);
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

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleToggleEnabled = async (reward: Reward) => {
    if (!currentUser.is_admin) return;
    setRewards(
      rewards.map((other) =>
        other.id === reward.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateReward(reward.id, {
      name: reward.name,
      image_url: reward.image_url,
      is_enabled: !reward.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const rewardData = {
      name: formData.name.trim(),
      image_url: formData.image_url,
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);
      if (editingRewardId === null) {
        const createdReward = await createReward(rewardData);
        setRewards([createdReward, ...rewards]);
      } else {
        const updatedReward = await updateReward(
          editingRewardId,
          rewardData
        );

        setRewards(
          rewards.map((other) =>
            other.id === updatedReward.id
              ? updatedReward
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
    if (editingRewardId === null) return;

    try {
      setIsDeleting(true);
      await deleteReward(editingRewardId);
      setRewards(
        rewards.filter(
          (reward) => reward.id !== editingRewardId
        )
      );
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (rewardId: number) => {
    if (!currentUser.is_admin) return;
    draggedRewardId.current = rewardId;
  };

  const handleDrop = async (targetRewardId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedRewardId.current;
    if (sourceId === null || sourceId === targetRewardId) return;

    const updatedRewards = [...rewards];
    const fromIndex = updatedRewards.findIndex((reward) => reward.id === sourceId);
    const toIndex = updatedRewards.findIndex((reward) => reward.id === targetRewardId);
    const [movedReward] = updatedRewards.splice(fromIndex, 1);
    updatedRewards.splice(toIndex, 0, movedReward);

    setRewards(updatedRewards);
    draggedRewardId.current = null;

    await reorderRewards(updatedRewards.map((reward) => reward.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Подарки
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить подарок
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Картинка</th>
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">Активен</th>
            </tr>
          </thead>

          <tbody>
            {rewards.map((reward) => (
              <tr
                key={reward.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(reward.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(reward.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(reward)}
                >
                  {reward.image_url ? (
                    <img
                      src={reward.image_url}
                      alt={reward.name}
                      className="h-8 w-8 rounded-md object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-md bg-gray-100" />
                  )}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(reward)}
                >
                  {reward.name}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={reward.is_enabled}
                    handleChange={() => handleToggleEnabled(reward)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {rewards.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет подарков
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
                {editingRewardId === null
                  ? "Добавить подарок"
                  : "Редактировать подарок"}
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
                  Картинка
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {formData.image_url ? (
                    <img
                      src={formData.image_url}
                      alt="reward"
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
              {editingRewardId !== null ? (
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
