import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import maxIcon from "../icons/max.svg";
import telegramIcon from "../icons/telegram.svg";
import type { ResetPasswordRequest, User, UserRequest } from "../types";
import {
  linkMax,
  linkTelegram,
  resetPassword,
  unlinkMax,
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
  const [isMaxLoading, setIsMaxLoading] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsIsUploading] = useState(false);
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

  const handleSocialClick = async (
    type: "telegram" | "max"
  ) => {
    const isLinked =
      type === "telegram"
        ? currentUser.telegram_id
        : currentUser.max_id;

    const setLoading =
      type === "telegram"
        ? setIsTelegramLoading
        : setIsMaxLoading;

    const linkFn = type === "telegram" ? linkTelegram : linkMax;
    const unlinkFn = type === "telegram" ? unlinkTelegram : unlinkMax;

    try {
      setLoading(true);

      if (!isLinked) {
        const { start_link } = await linkFn();
        window.open(start_link, "_blank");
      } else {
        await unlinkFn();
        window.location.reload();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsIsUploading(true);
      const uploadedImage = await uploadImageFile(file);
      setFormData((v) => ({ ...v, avatar_url: uploadedImage.image_url }));
    } finally {
      setIsIsUploading(false);
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

  const socials = [
    {
      key: "telegram" as const,
      label: "Telegram",
      id: currentUser.telegram_id,
      name: currentUser.telegram_name,
      icon: telegramIcon,
      loading: isTelegramLoading,
    },
    {
      key: "max" as const,
      label: "Max",
      id: currentUser.max_id,
      name: currentUser.max_name,
      icon: maxIcon,
      loading: isMaxLoading,
    },
  ];

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

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm">
              <span className="text-gray-500">ID</span>
              <span className="font-medium text-gray-900">
                {currentUser.id}
              </span>
            </div>

            {socials.map((social) => (
              <div
                key={social.key}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm"
              >
                <img src={social.icon} className="h-4 w-4 opacity-80" />
                <span className="font-medium text-gray-900 truncate">
                  {social.name ? `@${social.name}` : "Не привязан"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
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

            {socials.map((social) => (
              <button
                key={social.key}
                onClick={() => handleSocialClick(social.key)}
                disabled={social.loading}
                className={`w-full py-3 rounded-2xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50
                  ${social.id
                    ? "border border-red-200 text-red-600 hover:bg-red-50"
                    : "bg-gradient-to-r from-[#F39416] to-[#F33716] text-white"
                  }`}
              >
                <img src={social.icon} className="h-4 w-4" />
                {social.loading
                  ? "Загрузка..."
                  : social.id
                    ? `Отвязать ${social.label}`
                    : `Привязать ${social.label}`}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full sm:col-span-2 py-3 rounded-2xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50"
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
                    onChange={(e) =>
                      setFormData((v) => ({ ...v, name: e.target.value }))
                    }
                    placeholder="ФИО"
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />

                  <input
                    value={formData.username}
                    onChange={(e) =>
                      setFormData((v) => ({ ...v, username: e.target.value }))
                    }
                    placeholder="Имя пользователя"
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
                          setFormData((v) => ({ ...v, avatar_url: null }))
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
                    onChange={(e) =>
                      setPasswordData((v) => ({
                        ...v,
                        password: e.target.value,
                      }))
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />

                  <input
                    type="password"
                    placeholder="Новый пароль"
                    value={passwordData.new_password}
                    onChange={(e) =>
                      setPasswordData((v) => ({
                        ...v,
                        new_password: e.target.value,
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