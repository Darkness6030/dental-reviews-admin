import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Switch from "../components/Switch";
import type { News, NewsRequest, User } from "../types";
import {
  createNews,
  deleteNews,
  getNews,
  reorderNews,
  updateNews,
} from "../utils/api";

type NewsContext = {
  news: News[];
  setNews: (news: News[]) => void;
  currentUser: User;
};

const emptyFormData: NewsRequest = {
  title: "",
  is_enabled: true,
};

export default function NewsPage() {
  const { news, setNews, currentUser } =
    useOutletContext<NewsContext>();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState<number | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState<NewsRequest>(emptyFormData);
  const draggedNewsId = useRef<number | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      const newsData = await getNews();
      setNews(newsData);
    };

    fetchNews();
  }, [setNews]);

  const openCreateModal = () => {
    if (!currentUser.is_admin) return;
    setEditingNewsId(null);
    setFormData(emptyFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (item: News) => {
    if (!currentUser.is_admin) return;
    setEditingNewsId(item.id);
    setFormData({
      title: item.title,
      is_enabled: item.is_enabled,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNewsId(null);
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

  const handleToggleEnabled = async (item: News) => {
    if (!currentUser.is_admin) return;

    setNews(
      news.map((other) =>
        other.id === item.id
          ? { ...other, is_enabled: !other.is_enabled }
          : other
      )
    );

    await updateNews(item.id, {
      title: item.title,
      is_enabled: !item.is_enabled,
    });
  };

  const handleSave = async () => {
    if (!formData.title.trim()) return;

    const newsData = {
      title: formData.title.trim(),
      is_enabled: formData.is_enabled,
    };

    try {
      setIsSaving(true);

      if (editingNewsId === null) {
        const createdNews = await createNews(newsData);
        setNews([createdNews, ...news]);
      } else {
        const updatedNews = await updateNews(
          editingNewsId,
          newsData
        );

        setNews(
          news.map((other) =>
            other.id === updatedNews.id
              ? updatedNews
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
    if (editingNewsId === null) return;

    try {
      setIsDeleting(true);
      await deleteNews(editingNewsId);

      setNews(
        news.filter(
          (item) => item.id !== editingNewsId
        )
      );

      closeModal();
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (newsId: number) => {
    if (!currentUser.is_admin) return;
    draggedNewsId.current = newsId;
  };

  const handleDrop = async (targetNewsId: number) => {
    if (!currentUser.is_admin) return;
    const sourceId = draggedNewsId.current;
    if (sourceId === null || sourceId === targetNewsId) return;

    const updatedNews = [...news];
    const fromIndex = updatedNews.findIndex((item) => item.id === sourceId);
    const toIndex = updatedNews.findIndex((item) => item.id === targetNewsId);
    const [movedItem] = updatedNews.splice(fromIndex, 1);
    updatedNews.splice(toIndex, 0, movedItem);

    setNews(updatedNews);
    draggedNewsId.current = null;

    await reorderNews(updatedNews.map((item) => item.id));
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Новости
        </div>

        {currentUser.is_admin && (
          <button
            onClick={openCreateModal}
            className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
          >
            Добавить новость
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-2xl bg-white px-5 py-4 shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
              <th className="py-3 pr-4">Заголовок</th>
              <th className="py-3 pr-4">Активна</th>
            </tr>
          </thead>

          <tbody>
            {news.map((item) => (
              <tr
                key={item.id}
                draggable={currentUser.is_admin}
                onDragStart={() => handleDragStart(item.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(item.id)}
                className="cursor-move border-b border-gray-200 text-sm text-gray-800 hover:bg-gray-50"
              >
                <td
                  className="py-3 pr-4"
                  onClick={() => openEditModal(item)}
                >
                  {item.title}
                </td>

                <td className="py-3 pr-4">
                  <Switch
                    checked={item.is_enabled}
                    handleChange={() => handleToggleEnabled(item)}
                    disabled={!currentUser.is_admin}
                  />
                </td>
              </tr>
            ))}

            {news.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="py-8 text-center text-sm text-gray-400"
                >
                  Нет новостей
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
                {editingNewsId === null
                  ? "Добавить новость"
                  : "Редактировать новость"}
              </div>

              <button
                onClick={closeModal}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-700">
                Заголовок
              </div>
              <input
                value={formData.title}
                onChange={(event) =>
                  setFormData((value) => ({
                    ...value,
                    title: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                disabled={!currentUser.is_admin}
              />
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              {editingNewsId !== null ? (
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
                disabled={isSaving || !formData.title.trim() || !currentUser.is_admin}
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