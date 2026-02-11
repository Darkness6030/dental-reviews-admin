import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import Spinner from "../components/Spinner";
import type { User } from "../types";
import { login } from "../utils/api";

export type LoginContext = {
  setCurrentUser: (user: User) => void;
};

export default function LoginPage() {
  const { setCurrentUser }
    = useOutletContext<LoginContext>();

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [errorText, setErrorText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)

    try {
      const user = await login(username, password)
      setCurrentUser(user)
      navigate("/")
    } catch (err) {
      setErrorText("Неверный логин или пароль")
      throw err;
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] px-[6%] py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] border border-gray-100 p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-[36px] font-semibold leading-[90%] text-[#131927]">
              Вход
            </h2>
            <p className="mt-3 text-sm text-gray-500">
              Введите логин и пароль для доступа в систему
            </p>
          </div>

          {errorText && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-red-600 text-sm text-center">
              {errorText}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Имя пользователя
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                disabled={isLoading}
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-[#F39416] to-[#F33716] text-white rounded-2xl font-semibold text-[16px] tracking-[-0.02em]
                       shadow-[0_0_4px_rgba(44,30,8,0.08),0_8px_24px_rgba(44,30,8,0.08)]
                       hover:opacity-95 transition disabled:opacity-50"
            >
              <span className="flex items-center justify-center h-[1.5rem]">
                {isLoading ? <Spinner /> : "Войти"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
