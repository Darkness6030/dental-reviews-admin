import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { ResetPasswordRequest, User, UserRequest } from "../types";
import {
  linkTelegram,
  resetPassword,
  unlinkTelegram,
  updateCurrentUser,
  uploadImageFile,
} from "../utils/api";

type ProfileContext = {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  handleLogout: () => void;
};

export default function ProfilePage() {
  const { currentUser, setCurrentUser, handleLogout } =
    useOutletContext<ProfileContext>();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isTelegramLoading, setIsTelegramLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState<UserRequest>({
    name: currentUser.name,
    username: currentUser.username,
    password: "",
    is_admin: currentUser.is_admin,
    avatar_url: currentUser.avatar_url,
  });

  const [passwordData, setPasswordData] = useState<ResetPasswordRequest>({
    password: "",
    new_password: "",
  });

  useEffect(() => {
    setFormData({
      name: currentUser.name,
      username: currentUser.username,
      password: "",
      is_admin: currentUser.is_admin,
      avatar_url: currentUser.avatar_url,
    });
  }, [currentUser]);

  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsPasswordModalOpen(false);
    setPasswordData({ password: "", new_password: "" });
  };

  const handleTelegramClick = async () => {
    try {
      setIsTelegramLoading(true);
      if (!currentUser.telegram_id) {
        const { start_link } = await linkTelegram();
        window.open(start_link, "_blank");
      } else {
        await unlinkTelegram();
        window.location.reload();
      }
    } finally {
      setIsTelegramLoading(false);
    }
  };

  const handleAvatarFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const uploadedImage = await uploadImageFile(file);
      setFormData((value) => ({ ...value, avatar_url: uploadedImage.image_url }));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.name.trim() || !formData.username.trim()) return;

    try {
      setIsSaving(true);
      const updatedUser = await updateCurrentUser(formData);
      setCurrentUser(updatedUser);
      closeModals();
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordData.password || !passwordData.new_password) return;

    try {
      setIsResetting(true);
      await resetPassword(passwordData);
      closeModals();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-gray-100 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.name}
                  className="h-28 w-28 rounded-full object-cover shadow-md"
                />
              ) : (
                <div className="h-28 w-28 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-semibold text-gray-400">
                  {currentUser.name[0] ?? "U"}
                </div>
              )}
            </div>

            <h2 className="mt-5 text-2xl font-semibold text-[#131927]">
              {currentUser.name}
            </h2>
            <p className="text-sm text-gray-500">
              @{currentUser.username}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="text-xs font-semibold text-gray-500">
                ID
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {currentUser.id}
              </div>
            </div>
            <div className="rounded-2xl bg-gray-50 p-4">
              <div className="text-xs font-semibold text-gray-500">
                Telegram
              </div>
              <div className="mt-1 text-sm font-medium text-gray-900">
                {currentUser.telegram_name
                  ? `@${currentUser.telegram_name}`
                  : "Не привязан"}
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
            >
              Редактировать профиль
            </button>

            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="w-full py-3 rounded-2xl border border-gray-200 text-sm font-medium hover:bg-gray-50"
            >
              Сменить пароль
            </button>

            <button
              onClick={handleTelegramClick}
              disabled={isTelegramLoading}
              className={`w-full py-3 rounded-2xl text-sm font-medium disabled:opacity-50 ${currentUser.telegram_id
                ? "border border-red-200 text-red-600 hover:bg-red-50"
                : "bg-gradient-to-r from-[#F39416] to-[#F33716] text-white"
                }`}
            >
              {isTelegramLoading
                ? "Загрузка..."
                : currentUser.telegram_id
                  ? "Отвязать Telegram"
                  : "Привязать Telegram"}
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-2xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
            >
              Выйти
            </button>
          </div>
        </div>
      </div>

      {(isEditModalOpen || isPasswordModalOpen) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={closeModals}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            {isEditModalOpen && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="text-base font-semibold text-gray-900">
                    Редактировать профиль
                  </div>

                  <button
                    onClick={closeModals}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Закрыть
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  <input
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((value) => ({ ...value, name: event.target.value }))
                    }
                    placeholder="ФИО"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />

                  <input
                    value={formData.username}
                    onChange={(event) =>
                      setFormData((value) => ({ ...value, username: event.target.value }))
                    }
                    placeholder="Username"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />

                  <div className="flex items-center gap-3">
                    {formData.avatar_url && (
                      <img
                        src={formData.avatar_url}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    )}

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="rounded-xl bg-gray-100 px-3 py-2 text-sm"
                    >
                      {isUploading ? "Загрузка..." : "Загрузить аватар"}
                    </button>

                    {formData.avatar_url && (
                      <button
                        onClick={() =>
                          setFormData((value) => ({ ...value, avatar_url: null }))
                        }
                        className="rounded-xl bg-gray-100 px-3 py-2 text-sm"
                      >
                        Удалить
                      </button>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                  >
                    {isSaving ? "Сохранение..." : "Сохранить"}
                  </button>
                </div>
              </>
            )}

            {isPasswordModalOpen && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="text-base font-semibold text-gray-900">
                    Сменить пароль
                  </div>

                  <button
                    onClick={closeModals}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    Закрыть
                  </button>
                </div>

                <div className="mt-4 grid gap-4">
                  <input
                    type="password"
                    placeholder="Текущий пароль"
                    value={passwordData.password}
                    onChange={(event) =>
                      setPasswordData((value) => ({
                        ...value,
                        password: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />

                  <input
                    type="password"
                    placeholder="Новый пароль"
                    value={passwordData.new_password}
                    onChange={(event) =>
                      setPasswordData((value) => ({
                        ...value,
                        new_password: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={handleResetPassword}
                    disabled={isResetting}
                    className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                  >
                    {isResetting ? "Сохранение..." : "Сменить пароль"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
