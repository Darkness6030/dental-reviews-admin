import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Doctor, DoctorRequest, Service, User } from "../types";
import {
  createDoctor,
  deleteDoctor,
  getDoctors,
  getServices,
  reorderDoctors,
  updateDoctor,
  uploadImageFile,
} from "../utils/api";

type DoctorsContext = {
  doctors: Doctor[];
  setDoctors: (doctors: Doctor[]) => void;
  services: Service[];
  setServices: (services: Service[]) => void;
  currentUser: User;
};

const emptyFormData: DoctorRequest = {
  name: "",
  role: "",
  avatar_url: null,
  service_ids: [],
  is_enabled: true,
};

export default function DoctorsPage() {
  const {
    doctors,
    setDoctors,
    services,
    setServices,
    currentUser
  } = useOutletContext<DoctorsContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<DoctorRequest>(emptyFormData);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const draggedDoctorId = useRef<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [doctorsData, servicesData] = await Promise.all([
        getDoctors(),
        getServices(),
      ]);

      setDoctors(doctorsData);
      setServices(servicesData);
    };

    fetchData();
  }, [setDoctors, setServices]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingDoctorId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (doctor: Doctor) => {
    if (!currentUser.is_admin) return;
    setEditingDoctorId(doctor.id);
    setFormData({
      name: doctor.name,
      role: doctor.role,
      avatar_url: doctor.avatar_url,
      service_ids: doctor.services.map((service) => service.id),
      is_enabled: doctor.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoctorId(null);
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

  const handleToggleService = (serviceId: number) => {
    setFormData((value) => {
      return {
        ...value,
        service_ids: value.service_ids.includes(serviceId)
          ? value.service_ids.filter((otherId) => otherId !== serviceId)
          : [...value.service_ids, serviceId],
      };
    });
  };

  const handleToggleEnabled = async (doctor: Doctor) => {
    if (!currentUser.is_admin) return;
    setDoctors(
      doctors.map((other) =>
        other.id === doctor.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateDoctor(doctor.id, {
      name: doctor.name,
      role: doctor.role,
      avatar_url: doctor.avatar_url,
      service_ids: doctor.services.map((service) => service.id),
      is_enabled: !doctor.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.role.trim()) return;

    try {
      setIsSaving(true);
      if (editingDoctorId === null) {
        const createdDoctor = await createDoctor(formData);
        setDoctors([createdDoctor, ...doctors]);
      } else {
        const updatedDoctor = await updateDoctor(
          editingDoctorId,
          formData
        );

        setDoctors(
          doctors.map((other) =>
            other.id === updatedDoctor.id ? updatedDoctor : other
          )
        );
      }

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingDoctorId === null) return;

    try {
      setIsDeleting(true);
      await deleteDoctor(editingDoctorId);
      setDoctors(doctors.filter((doctor) => doctor.id !== editingDoctorId));
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (doctorId: number) => {
    if (!currentUser.is_admin) return;
    draggedDoctorId.current = doctorId;
  };

  const handleDrop = async (targetDoctorId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedDoctorId.current;
    if (sourceId === null || sourceId === targetDoctorId) return;

    const updatedDoctors = [...doctors];
    const fromIndex = updatedDoctors.findIndex((doctor) => doctor.id === sourceId);
    const toIndex = updatedDoctors.findIndex((doctor) => doctor.id === targetDoctorId);
    const [movedDoctor] = updatedDoctors.splice(fromIndex, 1);

    updatedDoctors.splice(toIndex, 0, movedDoctor);
    setDoctors(updatedDoctors);

    draggedDoctorId.current = null;
    await reorderDoctors(updatedDoctors.map((doctor) => doctor.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between">
        <div className="text-3xl font-semibold">
          Врачи
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить врача
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Фото</th>
              <th className="py-3 pr-4">ФИО</th>
              <th className="py-3 pr-4">Специальность</th>
              <th className="py-3 pr-4">Активен</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((doctor) => (
              <tr
                key={doctor.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(doctor.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(doctor.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(doctor)}
                >
                  {doctor.avatar_url ? (
                    <img
                      src={doctor.avatar_url}
                      alt={doctor.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100" />
                  )}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(doctor)}
                >
                  {doctor.name}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(doctor)}
                >
                  {doctor.role}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={doctor.is_enabled}
                    handleChange={() => handleToggleEnabled(doctor)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {doctors.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет врачей
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
                {editingDoctorId === null
                  ? "Добавить врача"
                  : "Редактировать врача"}
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
                  ФИО
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
                  Специальность
                </div>
                <input
                  value={formData.role}
                  onChange={(event) =>
                    setFormData((value) => ({
                      ...value,
                      role: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  disabled={!currentUser.is_admin}
                />
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-700">
                  Аватар
                </div>

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
                          avatar_url: null,
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

              <div>
                <div className="text-xs font-semibold text-gray-700">
                  Услуги
                </div>

                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((service) => {
                    const isSelected =
                      formData.service_ids.includes(service.id);

                    return (
                      <button
                        key={service.id}
                        onClick={() => handleToggleService(service.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${isSelected
                          ? "border-black bg-black text-white"
                          : "border-gray-200 bg-white text-gray-900 hover:border-gray-400"
                          }`}
                        disabled={!currentUser.is_admin}
                      >
                        {service.name}
                      </button>
                    );
                  })}

                  {services.length === 0 && (
                    <div className="text-sm text-gray-400">
                      Услуг нет
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {editingDoctorId !== null ? (
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
                  !formData.role.trim() ||
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
