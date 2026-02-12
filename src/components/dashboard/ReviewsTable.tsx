import { useMemo, useState } from "react";
import type { Review } from "../../types";

type ReviewsTableProps = {
  title?: string;
  reviews: Review[];
  handleExport: () => void;
};

function getShortName(fullName: string): string {
  const nameParts = fullName.split(/\s+/).filter(Boolean);
  if (nameParts.length <= 1) return fullName;

  const [lastName, ...otherParts] = nameParts;
  const initials = otherParts
    .map((part) => part[0]?.toUpperCase())
    .filter(Boolean)
    .map((letter) => `${letter}.`)
    .join("");

  return `${lastName} ${initials}`;
}

export function ReviewsTable({ title = "Отзывы", reviews, handleExport }: ReviewsTableProps) {
  const [openedReviewText, setOpenedReviewText] = useState<string | null>(null);
  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => Boolean(review.review_text?.trim()));
  }, [reviews]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div className="mb-3 text-base font-semibold text-gray-900">{title}</div>

        {filteredReviews.length == 0 ? (
          <div className="py-6 text-center text-sm text-gray-400">
            Нет данных
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full max-w-full border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-left text-sm font-semibold text-gray-900">
                  <th className="py-3 pr-4 whitespace-nowrap">Пациент</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Телефон</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Врач</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Услуга</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Отзыв</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Подарок</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Платформы</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => {
                  const doctorNames = review.selected_doctors.map((doctor) => getShortName(doctor.name));
                  const serviceNames = review.selected_services.map((service) => service.name);

                  const doctorsText = doctorNames.slice(0, 3).join(", ");
                  const servicesText = serviceNames.slice(0, 3).join(", ");
                  const platforms = review.published_platforms;

                  return (
                    <tr
                      key={review.id}
                      className="border-b border-gray-200 text-sm text-gray-800"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {review.contact_name ?? "-"}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {review.contact_phone ?? "-"}
                      </td>

                      <td className="py-3 pr-4 whitespace-nowrap">
                        {doctorsText || "-"}
                        {doctorNames.length > 3 && "…"}
                      </td>

                      <td className="py-3 pr-4 whitespace-nowrap">
                        {servicesText || "-"}
                        {serviceNames.length > 3 && "…"}
                      </td>

                      <td className="py-3 pr-4">
                        <button
                          onClick={() => setOpenedReviewText(review.review_text!)}
                          className="underline underline-offset-2"
                        >
                          Открыть
                        </button>
                      </td>

                      <td className="py-3 pr-4 whitespace-nowrap">
                        {review.selected_reward?.name ?? "-"}
                      </td>

                      <td className="py-3 pr-4 whitespace-nowrap">
                        {platforms.length === 0 ? (
                          "-"
                        ) : (
                          <div className="flex items-center gap-1">
                            {platforms.slice(0, 3).map((platform, index) => (
                              <div key={`${platform.name}-${index}`}>
                                {platform.image_url ? (
                                  <img
                                    src={platform.image_url}
                                    alt={platform.name}
                                    className="h-5 w-5 rounded-sm object-contain"
                                  />
                                ) : (
                                  <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                                    {platform.name[0] ?? "?"}
                                  </div>
                                )}
                              </div>
                            ))}
                            {platforms.length > 3 && (
                              <span className="text-xs text-gray-500">…</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredReviews.length > 0 && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleExport}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Экспорт
            </button>
          </div>
        )}
      </div>

      {openedReviewText !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpenedReviewText(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-base font-semibold text-gray-900">
                Текст отзыва
              </div>
              <button
                onClick={() => setOpenedReviewText(null)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
              {openedReviewText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
