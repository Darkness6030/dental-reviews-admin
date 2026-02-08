import { useEffect, useMemo, useState } from "react";
import MetricBar from "../components/prompts/MetricBar";
import type { Prompt, PromptRequest } from "../types";
import { getPrompts, testPrompt, updatePrompt } from "../utils/api";

const emptyFormData: PromptRequest = {
  id: "",
  prompt_text: "",
  temperature: 0.0,
  frequency_penalty: 1.0,
};

const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

const clampTemperature = (value: number) => clampNumber(value, 0, 1);
const clampRepetitionPenalty = (value: number) => clampNumber(value, 0, 2);

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [editingPromptId, setEditingPromptId] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTestResultOpen, setIsTestResultOpen] = useState(false);

  const [formData, setFormData] = useState<PromptRequest>(emptyFormData);

  useEffect(() => {
    const fetchPrompts = async () => {
      const promptsData = await getPrompts();
      setPrompts(promptsData);
    };

    fetchPrompts();
  }, []);

  const selectedPrompt = useMemo(() => {
    if (editingPromptId === null) return null;
    return (
      prompts.find((prompt) => prompt.id === editingPromptId) ??
      null
    );
  }, [prompts, editingPromptId]);

  const openEditModal = (prompt: Prompt) => {
    setEditingPromptId(prompt.id);
    setTestResult(null);
    setIsTestResultOpen(false);

    setFormData({
      id: prompt.id,
      prompt_text: prompt.prompt_text,
      temperature: prompt.temperature,
      frequency_penalty: prompt.frequency_penalty,
    });
  };

  const closeModal = () => {
    setEditingPromptId(null);
    setTestResult(null);
    setIsTestResultOpen(false);

    setFormData({
      id: "",
      prompt_text: "",
      temperature: 0.0,
      frequency_penalty: 1.0,
    });
  };

  useEffect(() => {
    if (editingPromptId === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "Escape") {
        if (isTestResultOpen) {
          setIsTestResultOpen(false);
        } else {
          closeModal();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingPromptId, isTestResultOpen]);

  const handleTest = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const generatedText = await testPrompt({
        id: formData.id,
        prompt_text: formData.prompt_text,
        temperature: clampTemperature(
          formData.temperature
        ),
        frequency_penalty: clampRepetitionPenalty(
          formData.frequency_penalty
        ),
      });

      setTestResult(generatedText);
      setIsTestResultOpen(true);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const updatedPrompt = await updatePrompt({
        id: formData.id,
        prompt_text: formData.prompt_text,
        temperature: clampTemperature(
          formData.temperature
        ),
        frequency_penalty: clampRepetitionPenalty(
          formData.frequency_penalty
        ),
      });

      setPrompts((value) =>
        value.map((prompt) =>
          prompt.id === updatedPrompt.id
            ? updatedPrompt
            : prompt
        )
      );

      closeModal();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="text-3xl font-semibold text-gray-900">
          Промпты
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {prompts.map((prompt) => {
          const isEmptyText =
            !prompt.prompt_text.trim();

          return (
            <button
              key={prompt.id}
             
              onClick={() => openEditModal(prompt)}
              className="w-full rounded-2xl bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-xs font-semibold text-gray-500">
                  ID: {prompt.id}
                </div>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-gray-700">
                  Текст промпта
                </div>

                <div
                  className={`mt-2 rounded-xl border px-3 py-2 text-sm ${isEmptyText
                    ? "border-gray-200 bg-white text-gray-400"
                    : "border-gray-200 bg-gray-50 text-gray-800"
                    }`}
                >
                  <div className="line-clamp-6 whitespace-pre-wrap">
                    {isEmptyText
                      ? "Промпт пустой (нажмите, чтобы добавить текст)"
                      : prompt.prompt_text}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <MetricBar
                  label="Температура"
                  value={prompt.temperature}
                  percent={clampTemperature(prompt.temperature) * 100}
                />

                <MetricBar
                  label="Штраф за повторение"
                  value={prompt.frequency_penalty}
                  percent={(clampRepetitionPenalty(prompt.frequency_penalty) / 2) * 100}
                />
              </div>
            </button>
          );
        })}

        {prompts.length === 0 && (
          <div className="w-full rounded-2xl bg-white px-5 py-8 text-center text-sm text-gray-400 shadow-sm">
            Нет промптов
          </div>
        )}
      </div>

      {selectedPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          {!isTestResultOpen && (
            <div
              className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-lg"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    Редактирование промпта
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    ID: {selectedPrompt.id}
                  </div>
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
                    Текст промпта
                  </div>
                  <textarea
                    value={formData.prompt_text}
                    onChange={(event) =>
                      setFormData((value) => ({
                        ...value,
                        prompt_text:
                          event.target.value,
                      }))
                    }
                    rows={10}
                    placeholder="Введите текст промпта..."
                    className="mt-1 w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-xs font-semibold text-gray-700">
                      Температура (0–1)
                    </div>
                    <input
                      type="number"
                      value={formData.temperature}
                      step={0.05}
                      min={0}
                      max={1}
                      onChange={(event) =>
                        setFormData((value) => ({
                          ...value,
                          temperature:
                            clampTemperature(
                              Number(
                                event.target.value
                              )
                            ),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700">
                      Штраф за повторение (0–2)
                    </div>
                    <input
                      type="number"
                      value={
                        formData.frequency_penalty
                      }
                      step={0.1}
                      min={0}
                      max={2}
                      onChange={(event) =>
                        setFormData((value) => ({
                          ...value,
                          frequency_penalty:
                            clampRepetitionPenalty(
                              Number(
                                event.target.value
                              )
                            ),
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                 
                  onClick={handleTest}
                  disabled={isTesting || isSaving}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:opacity-60"
                >
                  {isTesting
                    ? "Тестируем..."
                    : "Тестировать"}
                </button>

                <button
                 
                  onClick={handleSave}
                  disabled={isSaving || isTesting}
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90 disabled:opacity-60"
                >
                  {isSaving
                    ? "Сохранение..."
                    : "Сохранить"}
                </button>
              </div>
            </div>
          )}

          {isTestResultOpen && (
            <div
              className="w-full max-w-3xl rounded-2xl bg-white p-5 shadow-lg"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-base font-semibold text-gray-900">
                    Результат теста
                  </div>
                  <div className="mt-1 text-xs font-semibold text-gray-500">
                    ID: {selectedPrompt.id}
                  </div>
                </div>

                <button
                 
                  onClick={() =>
                    setIsTestResultOpen(false)
                  }
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  Закрыть
                </button>
              </div>

              <div className="mt-4">
                <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
                  {testResult ?? "Нет результата"}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                 
                  onClick={() =>
                    setIsTestResultOpen(false)
                  }
                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/90"
                >
                  Вернуться к редактированию
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
