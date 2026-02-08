import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { Service, ServiceRequest, User } from "../types";
import {
  createService,
  deleteService,
  getServices,
  reorderServices,
  updateService,
} from "../utils/api";

type ServicesContext = {
  services: Service[];
  setServices: (services: Service[]) => void;
  currentUser: User;
};

const emptyFormData: ServiceRequest = {
  name: "",
  category: "",
  is_enabled: true,
};

export default function ServicesPage() {
  const {
    services,
    setServices,
    currentUser
  } = useOutletContext<ServicesContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">("existing");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<ServiceRequest>(emptyFormData);
  const draggedServiceId = useRef<number | null>(null);

  const categories = useMemo(() => {
    const categoriesList = services
      .map((service) => service.category.trim())
      .filter(Boolean);

    const uniqueCategories = Array.from(new Set(categoriesList));
    uniqueCategories.sort((a, b) => a.localeCompare(b, "ru"));

    return uniqueCategories;
  }, [services]);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesData = await getServices();
      setServices(servicesData);
    };

    fetchServices();
  }, [setServices]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingServiceId(null);
    setFormData(emptyFormData);
    setCategoryMode("existing");
    setIsModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    if (!currentUser.is_admin) return;
    setEditingServiceId(service.id);
    setFormData({
      name: service.name,
      category: service.category,
      is_enabled: service.is_enabled,
    });
    setCategoryMode("existing");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingServiceId(null);
    setFormData(emptyFormData);
    setCategoryMode("existing");
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  const handleToggleEnabled = async (service: Service) => {
    if (!currentUser.is_admin) return;
    setServices(
      services.map((other) =>
        other.id === service.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateService(service.id, {
      name: service.name,
      category: service.category,
      is_enabled: !service.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    const serviceData = {
      name: formData.name.trim(),
      category: formData.category.trim(),
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);
      if (editingServiceId === null) {
        const createdService = await createService(serviceData);
        setServices([createdService, ...services]);
      } else {
        const updatedService = await updateService(
          editingServiceId,
          serviceData
        );

        setServices(
          services.map((other) =>
            other.id === updatedService.id ? updatedService : other
          )
        );
      }

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (editingServiceId === null) return;

    try {
      setIsDeleting(true);
      await deleteService(editingServiceId);
      setServices(services.filter((service) => service.id !== editingServiceId));
      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (serviceId: number) => {
    if (!currentUser.is_admin) return;
    draggedServiceId.current = serviceId;
  };

  const handleDrop = async (targetServiceId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedServiceId.current;
    if (sourceId === null || sourceId === targetServiceId) return;

    const updatedServices = [...services];
    const fromIndex = updatedServices.findIndex((service) => service.id === sourceId);
    const toIndex = updatedServices.findIndex((service) => service.id === targetServiceId);
    const [movedService] = updatedServices.splice(fromIndex, 1);
    updatedServices.splice(toIndex, 0, movedService);

    setServices(updatedServices);
    draggedServiceId.current = null;

    await reorderServices(updatedServices.map((service) => service.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Услуги
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить услугу
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Название</th>
              <th className="py-3 pr-4">Категория</th>
              <th className="py-3 pr-4">Активна</th>
            </tr>
          </thead>

          <tbody>
            {services.map((service) => (
              <tr
                key={service.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(service.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(service.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(service)}
                >
                  {service.name}
                </td>

                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(service)}
                >
                  {service.category}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={service.is_enabled}
                    handleChange={() => handleToggleEnabled(service)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {services.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет услуг
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
                {editingServiceId === null
                  ? "Добавить услугу"
                  : "Редактировать услугу"}
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
                  Категория
                </div>

                <div className="mt-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={categoryMode === "existing"}
                      onChange={() => {
                        setCategoryMode("existing");
                        setFormData((value) => ({
                          ...value,
                          category: "",
                        }));
                      }}
                    />
                    Выбрать существующую
                  </label>

                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="radio"
                      checked={categoryMode === "new"}
                      onChange={() => {
                        setCategoryMode("new");
                        setFormData((value) => ({
                          ...value,
                          category: "",
                        }));
                      }}
                    />
                    Ввести новую
                  </label>
                </div>

                {categoryMode === "existing" ? (
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((value) => ({
                        ...value,
                        category: event.target.value,
                      }))
                    }
                    className="mt-2 h-9 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  >
                    <option value="">Без категории</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((value) => ({
                        ...value,
                        category: event.target.value,
                      }))
                    }
                    placeholder="Новая категория"
                    className="mt-2 h-9 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {editingServiceId !== null ? (
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
