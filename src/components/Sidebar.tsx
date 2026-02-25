import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { User } from "../types";

type SidebarProps = {
  currentUser: User | null;
  handleLogout: () => void;
  isUserLoading: boolean;
};

const Sidebar: React.FC<SidebarProps> = ({ currentUser, handleLogout, isUserLoading }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMobileOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navLinks = (
    <div className="space-y-12">
      <div className="space-y-1">
        <Link
          to="/"
          className="block px-5 py-1.5 rounded-2xl font-normal text-lg hover:bg-gray-100 transition-colors duration-300"
          onClick={() => setIsMobileOpen(false)}
        >
          Дашборд
        </Link>
        <Link
          to="/analytics"
          className="block px-5 py-1.5 rounded-2xl font-normal text-lg hover:bg-gray-100 transition-colors duration-300"
          onClick={() => setIsMobileOpen(false)}
        >
          Аналитика
        </Link>
      </div>

      <div>
        <p className="px-5 py-1 text-lg text-left font-semibold">Настройки</p>
        <div>
          <Link
            to="/doctors"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Врачи
          </Link>

          <Link
            to="/services"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Услуги
          </Link>

          <Link
            to="/aspects"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Аспекты
          </Link>

          <Link
            to="/sources"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Источники
          </Link>

          <Link
            to="/rewards"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Подарки
          </Link>

          <Link
            to="/platforms"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Платформы
          </Link>

          <Link
            to="/reasons"
            className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            Причины
          </Link>

          {currentUser?.is_owner && (
            <Link
              to="/users"
              className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
              onClick={() => setIsMobileOpen(false)}
            >
              Пользователи
            </Link>
          )}

          {currentUser?.is_admin && (
            <Link
              to="/prompts"
              className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
              onClick={() => setIsMobileOpen(false)}
            >
              Промпты
            </Link>
          )}

          {currentUser?.is_admin && (
            <Link
              to="/news"
              className="block px-5 py-1 rounded-2xl text-sm font-light hover:bg-gray-100 transition-colors duration-300"
              onClick={() => setIsMobileOpen(false)}
            >
              Новости
            </Link>
          )}
        </div>
      </div>

      <div>
        {isUserLoading ? (
          <div className="mx-5">
            <div className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" />
            <div className="mt-2 h-6 w-full bg-gray-200 rounded-2xl animate-pulse" />
          </div>
        ) : currentUser ? (
          <div>
            <Link
              to="/profile"
              onClick={() => setIsMobileOpen(false)}
              className="block px-5 py-1 text-xl text-left font-semibold hover:bg-gray-100 rounded-2xl transition-colors duration-300"
            >
              {currentUser.name}
            </Link>
            <button
              onClick={handleLogout}
              className="w-full px-5 py-1 rounded-2xl text-sm text-left font-light hover:bg-gray-100 transition-colors duration-300"
            >
              Выйти
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      <button

        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-50 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm"
      >
        ☰
      </button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className="hidden md:flex md:flex-col bg-white text-gray-800 min-h-screen border-r border-gray-200
                        w-52 lg:w-60 xl:w-64 flex-shrink-0 p-6">
        <div className="flex items-center mb-10">
          <img src="/logo.png" alt="Logo" className="max-w-full h-auto" />
        </div>
        {navLinks}
      </aside>

      <aside
        className={`fixed top-0 left-0 h-full bg-white text-gray-800 border-r border-gray-200 z-50 md:hidden
                    w-72 p-6 transform transition-transform duration-300
                    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between mb-10">
          <img src="/logo.png" alt="Logo" className="max-w-[160px] h-auto" />
          <button

            onClick={() => setIsMobileOpen(false)}
            className="px-3 py-2 rounded-xl hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {navLinks}
      </aside>
    </>
  );
};

export default Sidebar;
