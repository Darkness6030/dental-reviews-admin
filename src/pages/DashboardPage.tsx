import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type { Complaint, Review } from "../types";
import { exportComplaintsFile, exportReviewsFile, getReviewsDashboard } from "../utils/api";

import ArrowUpIcon from "../icons/arrow_up.svg?react";
import ChatIcon from "../icons/chat.svg?react";
import CheckmarkIcon from "../icons/checkmark.svg?react";
import SadIcon from "../icons/sad.svg?react";
import UsersIcon from "../icons/users.svg?react";

import { ChartCard } from "../components/dashboard/ChartCard";
import { ComplaintsTable } from "../components/dashboard/ComplaintsTable";
import { RangeTabs } from "../components/dashboard/RangeTabs";
import { RatingTab } from "../components/dashboard/RatingTab";
import { ReviewsTable } from "../components/dashboard/ReviewsTable";
import { StatCard } from "../components/dashboard/StatCard";
import {
  countByName,
  makeBarChartData,
  toSortedCountArray,
  type CountItem,
} from "../utils/chartData";
import { formatDateYMD, getDateRange, type DateRangeKey } from "../utils/dateRange";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export type DashboardContext = {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  complaints: Complaint[];
  setComplaints: (complaints: Complaint[]) => void;
};

type DashboardPageProps = {
  mode?: "dashboard" | "analytics";
};

export default function DashboardPage({ mode = "dashboard" }: DashboardPageProps) {
  const { reviews, setReviews, complaints, setComplaints } = useOutletContext<DashboardContext>();
  const [selectedRange, setSelectedRange] = useState<DateRangeKey>("month");

  const [visitsCount, setVisitsCount] = useState<number>(0);
  const [createdReviewsCount, setCreatedReviewsCount] = useState<number>(0);
  const [publishedReviewsCount, setPublishedReviewsCount] = useState<number>(0);

  const [negativeReviewsCount, setNegativeReviewsCount] = useState<number>(0);
  const [ownerCompaintsCount, setOwnerCompaintsCount] = useState<number>(0);

  const [platformsChartData, setPlatformsChartData] = useState(makeBarChartData([]));
  const [servicesChartData, setServicesChartData] = useState(makeBarChartData([]));
  const [rewardsChartData, setRewardsChartData] = useState(makeBarChartData([]));
  const [doctorsRating, setDoctorsRating] = useState<CountItem[]>([]);

  const { fromDate, toDate } = useMemo(() => getDateRange(selectedRange), [selectedRange]);
  const dateFrom = fromDate ? formatDateYMD(fromDate) : undefined;
  const dateTo = toDate ? formatDateYMD(toDate) : undefined;

  const reviewsConversion = useMemo(() => {
    if (!visitsCount) return "0%";
    return `${Math.round((publishedReviewsCount / visitsCount) * 100)}%`;
  }, [publishedReviewsCount, visitsCount]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const response = await getReviewsDashboard(dateFrom, dateTo);
      const newReviews = response.reviews;
      const newComplaints = response.complaints;

      setReviews(newReviews);
      setComplaints(newComplaints);

      setVisitsCount(newReviews.length);
      setCreatedReviewsCount(
        newReviews.filter((review) => Boolean(review.selected_source)).length
      );

      setPublishedReviewsCount(
        newReviews.filter((review) => review.published_platforms.length > 0).length
      );

      setNegativeReviewsCount(newComplaints.length);
      setOwnerCompaintsCount(
        newComplaints.filter((complaint) => Boolean(complaint.complaint_text)).length
      );

      const doctorsMap = countByName(newReviews.flatMap((review) => review.selected_doctors));
      const servicesMap = countByName(newReviews.flatMap((review) => review.selected_services));
      const platformsMap = countByName(
        newReviews.flatMap((review) => review.published_platforms)
      );

      const rewardsMap = countByName(
        newReviews.flatMap((review) => (review.selected_reward ? [review.selected_reward] : []))
      );

      setPlatformsChartData(makeBarChartData(toSortedCountArray(platformsMap)));
      setServicesChartData(makeBarChartData(toSortedCountArray(servicesMap)));
      setRewardsChartData(makeBarChartData(toSortedCountArray(rewardsMap)));
      setDoctorsRating(toSortedCountArray(doctorsMap));
    };

    fetchDashboardData();
  }, [dateFrom, dateTo, setReviews, setComplaints]);

  return (
    <div className="flex-1 bg-[#F5F5F5] px-[6%] py-7">
      <div className="mb-6">
        <div className="text-3xl font-semibold text-gray-900">
          {mode === "analytics" ? "Аналитика" : "Сводный отчёт"}
        </div>

        <div className="mt-3 flex flex-col min-[600px]:flex-row min-[600px]:items-center gap-y-2 min-[600px]:gap-y-0 min-[600px]:gap-x-4">
          <RangeTabs value={selectedRange} handleSelect={setSelectedRange} />
          {dateFrom && dateTo && (
            <div className="text-xs text-gray-400 break-words ml-4 min-[600px]:ml-0">
              {dateFrom} - {dateTo}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-3 w-full">
        <StatCard icon={<UsersIcon />} value={visitsCount} label="посещений" />
        <StatCard icon={<ChatIcon />} value={createdReviewsCount} label="созданных отзывов" />
        <StatCard
          icon={<CheckmarkIcon className="w-full h-full" />}
          value={publishedReviewsCount}
          label="опубликованных отзывов"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6 w-full">
        <StatCard icon={<ArrowUpIcon />} value={reviewsConversion} label="конверсия в отзыв" />
        <StatCard icon={<SadIcon />} value={negativeReviewsCount} label="негатива" />
        <StatCard
          icon={<ChatIcon />}
          value={ownerCompaintsCount}
          label="обращений к руководству"
        />
      </div>

      {mode === "analytics" ? (
        <div className="space-y-6 w-full">
          <ReviewsTable reviews={reviews} handleExport={() => exportReviewsFile(dateFrom, dateTo)} />
          <ComplaintsTable complaints={complaints} handleExport={() => exportComplaintsFile(dateFrom, dateTo)} />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 w-full">
          <ChartCard title="По платформам" data={platformsChartData} />
          <ChartCard title="По услугам" data={servicesChartData} />
          <ChartCard title="По наградам" data={rewardsChartData} />

          {doctorsRating.length > 0 && <RatingTab title="Рейтинг врачей" items={doctorsRating} />}
        </div>
      )}
    </div>
  );
}
