import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { User, UserRequest } from "../types";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  uploadImageFile,
} from "../utils/api";

type UsersContext = {
  users: User[];
  setUsers: (users: User[]) => void;
};

const emptyFormData: UserRequest = {
  name: "",
  username: "",
  password: "",
  is_admin: false,
  avatar_url: undefined,
};

export default function UsersPage() {
  const {
    users,
    setUsers
  } = useOutletContext<UsersContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<UserRequest>(emptyFormData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const usersData = await getUsers();
      setUsers(usersData);
    };

    fetchData();
  }, [setUsers]);

  const openCreateModal = () => {
    setEditingUserId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name,
      username: user.username,
      is_admin: user.is_admin,
      avatar_url: user.avatar_url,
      password: "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
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

  const handleAvatarFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile) return;

    try {
      setIsUploading(true);
      const uploadedImage = await uploadImageFile(imageFile);
      setFormData((value) => ({
        ...value,
        avatar_url: uploadedImage.image_url,
      }));
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleToggleAdmin = async (user: User) => {
    setUsers(
      users.map((other) =>
        other.id === user.id ? { ...other, is_admin: !other.is_admin } : other
      )
    );

    await updateUser(user.id, {
      name: user.name,
      username: user.username,
      is_admin: !user.is_admin,
      avatar_url: user.avatar_url,
      password: "",
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.username.trim()) return;

    try {
      setIsSaving(true);
      if (editingUserId === null) {
        const createdUser = await createUser(formData);
        setUsers([createdUser, ...users]);
      } else {
        const updatedUser = await updateUser(editingUserId, formData);
        setUsers(
          users.map((other) =>
            other.id === updatedUser.id ? updatedUser : other
          )
        );
      }

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingUserId === null) return;

    try {
      setIsDeleting(true);
      await deleteUser(editingUserId);
      setUsers(users.filter((user) => user.id !== editingUserId));
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-3xl font-semibold">Пользователи</div>

        <button
          onClick={openCreateModal}
          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
        >
          Добавить пользователя
        </button>
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Фото</th>
              <th className="py-3 pr-4">ФИО</th>
              <th className="py-3 pr-4">Имя пользователя</th>
              <th className="py-3 pr-4">Админ</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className={`cursor-pointer border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50 ${user.is_owner ? "underline" : ""}`}
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(user)}
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                  )}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(user)}
                >
                  {user.name}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(user)}
                >
                  {user.username}
                </td>

                <td className="py-3 pr-4">
                  {user.is_owner ? (
                    <span className="bg-gray-800 text-white px-2 py-1 rounded-full">Владелец</span>
                  ) : (
                    <Switch
                      checked={user.is_admin}
                      handleChange={() => handleToggleAdmin(user)}
                    />
                  )}
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-gray-400">
                  Нет пользователей
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
                {editingUserId === null ? "Добавить пользователя" : "Редактировать пользователя"}
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
                <div className="text-xs font-semibold text-gray-700">ФИО</div>
                <input
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      name: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-700">Имя пользователя</div>
                <input
                  value={formData.username}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      username: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-700">Новый пароль (необязательно)</div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      password: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-700">Аватар</div>

                <div className="mt-2 flex items-center gap-3">
                  {formData.avatar_url ? (
                    <img
                      src={formData.avatar_url}
                      alt="avatar"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-100" />
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="rounded-xl bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-200"
                  >
                    {isUploading ? "Загрузка..." : "Загрузить"}
                  </button>

                  {formData.avatar_url && (
                    <button
                      onClick={() =>
                        setFormData((value) => ({
                          ...value,
                          avatar_url: undefined,
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
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {editingUserId !== null ? (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
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
                  isSaving || !formData.name.trim() || !formData.username.trim()
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
