import { useMemo, useState } from "react";
import type { Complaint } from "../../types";

type ComplaintsTableProps = {
  title?: string;
  complaints: Complaint[];
  handleExport: () => void;
};

export function ComplaintsTable({ title = "Жалобы", complaints, handleExport }: ComplaintsTableProps) {
  const [openedComplaintText, setOpenedComplaintText] = useState<string | null>(null);
  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => Boolean(complaint.complaint_text?.trim()));
  }, [complaints]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="w-full rounded-2xl bg-white px-5 py-4 shadow-sm">
        <div className="mb-3 text-base font-semibold text-gray-900">{title}</div>

        {filteredComplaints.length == 0 ? (
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
                  <th className="py-3 pr-4 whitespace-nowrap">Причины</th>
                  <th className="py-3 pr-4 whitespace-nowrap">Жалоба</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.map((complaint) => {
                  const reasonNames = complaint.selected_reasons.map((reason) => reason.name);
                  const reasonsText = reasonNames.slice(0, 3).join(", ");

                  return (
                    <tr
                      key={complaint.id}
                      className="border-b border-gray-200 text-sm text-gray-800"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {complaint.contact_name ?? "-"}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {complaint.contact_phone ?? "-"}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap">
                        {reasonsText || "-"}
                        {reasonNames.length > 3 && "…"}
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => setOpenedComplaintText(complaint.complaint_text!)}
                          className="underline underline-offset-2"
                        >
                          Открыть
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {filteredComplaints.length > 0 && (
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

      {openedComplaintText !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpenedComplaintText(null)}
        >
          <div
            className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="text-base font-semibold text-gray-900">
                Текст жалобы
              </div>
              <button
                onClick={() => setOpenedComplaintText(null)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
              {openedComplaintText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
