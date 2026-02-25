import axios from "axios";
import type { Aspect, AspectRequest, Doctor, DoctorRequest, News, NewsRequest, Platform, PlatformRequest, Prompt, PromptRequest, Reason, ReasonRequest, ResetPasswordRequest, ReviewsDashboardResponse, Reward, RewardRequest, Service, ServiceRequest, Source, SourceRequest, StartLinkResponse, UploadImageResponse, User, UserRequest } from "../types";

const client = axios.create({
  baseURL: "https://feedback.ddaily.ru/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const saveAccessToken = (access_token: string) => {
  localStorage.setItem("access_token", access_token);
};

export const removeAccessToken = () => {
  localStorage.removeItem("access_token");
}

export const getAccessToken = () => {
  return localStorage.getItem("access_token");
};

client.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = async (username: string, password: string): Promise<User> => {
  const response = await client.post("/login", {
    username,
    password,
  });

  const { user, access_token } = response.data;
  saveAccessToken(access_token);
  return user;
};

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await client.get("/user");
  return data;
};

export const updateCurrentUser = async (userData: UserRequest): Promise<User> => {
  const { data } = await client.post("/user/update", userData);
  return data;
};

export const resetPassword = async (passwordData: ResetPasswordRequest): Promise<void> => {
  await client.post("/password/reset", passwordData);
};

export const getUsers = async (): Promise<User[]> => {
  const { data } = await client.get("/admin/users");
  return data;
};

export const createUser = async (userData: UserRequest): Promise<User> => {
  const { data } = await client.post("/admin/users", userData);
  return data;
};

export const updateUser = async (userId: number, userData: UserRequest): Promise<User> => {
  const { data } = await client.post(`/admin/users/${userId}`, userData);
  return data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await client.delete(`/admin/users/${userId}`);
};

export const getDoctors = async (): Promise<Doctor[]> => {
  const { data } = await client.get("/doctors");
  return data;
};

export const createDoctor = async (doctorData: DoctorRequest): Promise<Doctor> => {
  const { data } = await client.post("/admin/doctors", doctorData);
  return data;
};

export const updateDoctor = async (doctorId: number, doctorData: DoctorRequest): Promise<Doctor> => {
  const { data } = await client.post(`/admin/doctors/${doctorId}`, doctorData);
  return data;
};

export const deleteDoctor = async (doctorId: number): Promise<void> => {
  await client.delete(`/admin/doctors/${doctorId}`);
};

export const reorderDoctors = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/doctors/reorder", { ordered_ids: orderedIds });
};

export const getServices = async (): Promise<Service[]> => {
  const { data } = await client.get("/services");
  return data;
};

export const createService = async (serviceData: ServiceRequest): Promise<Service> => {
  const { data } = await client.post("/admin/services", serviceData);
  return data;
};

export const updateService = async (serviceId: number, serviceData: ServiceRequest): Promise<Service> => {
  const { data } = await client.post(`/admin/services/${serviceId}`, serviceData);
  return data;
};

export const deleteService = async (serviceId: number): Promise<void> => {
  await client.delete(`/admin/services/${serviceId}`);
};

export const reorderServices = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/services/reorder", { ordered_ids: orderedIds });
};

export const getAspects = async (): Promise<Aspect[]> => {
  const { data } = await client.get("/aspects");
  return data;
};

export const createAspect = async (aspectData: AspectRequest): Promise<Aspect> => {
  const { data } = await client.post("/admin/aspects", aspectData);
  return data;
};

export const updateAspect = async (aspectId: number, aspectData: AspectRequest): Promise<Aspect> => {
  const { data } = await client.post(`/admin/aspects/${aspectId}`, aspectData);
  return data;
};

export const deleteAspect = async (aspectId: number): Promise<void> => {
  await client.delete(`/admin/aspects/${aspectId}`);
};

export const reorderAspects = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/aspects/reorder", { ordered_ids: orderedIds });
};

export const getSources = async (): Promise<Source[]> => {
  const { data } = await client.get("/sources");
  return data;
};

export const createSource = async (sourceData: SourceRequest): Promise<Source> => {
  const { data } = await client.post("/admin/sources", sourceData);
  return data;
};

export const updateSource = async (sourceId: number, sourceData: SourceRequest): Promise<Source> => {
  const { data } = await client.post(`/admin/sources/${sourceId}`, sourceData);
  return data;
};

export const deleteSource = async (sourceId: number): Promise<void> => {
  await client.delete(`/admin/sources/${sourceId}`);
};

export const reorderSources = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/sources/reorder", { ordered_ids: orderedIds });
};

export const getRewards = async (): Promise<Reward[]> => {
  const { data } = await client.get("/rewards");
  return data;
};

export const createReward = async (rewardData: RewardRequest): Promise<Reward> => {
  const { data } = await client.post("/admin/rewards", rewardData);
  return data;
};

export const updateReward = async (rewardId: number, rewardData: RewardRequest): Promise<Reward> => {
  const { data } = await client.post(`/admin/rewards/${rewardId}`, rewardData);
  return data;
};

export const deleteReward = async (rewardId: number): Promise<void> => {
  await client.delete(`/admin/rewards/${rewardId}`);
};

export const reorderRewards = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/rewards/reorder", { ordered_ids: orderedIds });
};

export const getPlatforms = async (): Promise<Platform[]> => {
  const { data } = await client.get("/platforms");
  return data;
};

export const createPlatform = async (platformData: PlatformRequest): Promise<Platform> => {
  const { data } = await client.post("/admin/platforms", platformData);
  return data;
};

export const updatePlatform = async (platformId: number, platformData: PlatformRequest): Promise<Platform> => {
  const { data } = await client.post(`/admin/platforms/${platformId}`, platformData);
  return data;
};

export const deletePlatform = async (platformId: number): Promise<void> => {
  await client.delete(`/admin/platforms/${platformId}`);
};

export const reorderPlatforms = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/platforms/reorder", { ordered_ids: orderedIds });
};

export const getReasons = async (): Promise<Reason[]> => {
  const { data } = await client.get("/reasons");
  return data;
};

export const createReason = async (reasonData: ReasonRequest): Promise<Reason> => {
  const { data } = await client.post("/admin/reasons", reasonData);
  return data;
};

export const updateReason = async (reasonId: number, reasonData: ReasonRequest): Promise<Reason> => {
  const { data } = await client.post(`/admin/reasons/${reasonId}`, reasonData);
  return data;
};

export const deleteReason = async (reasonId: number): Promise<void> => {
  await client.delete(`/admin/reasons/${reasonId}`);
};

export const reorderReasons = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/reasons/reorder", { ordered_ids: orderedIds });
};

export const getNews = async (): Promise<News[]> => {
  const { data } = await client.get("/news");
  return data;
};

export const createNews = async (newsData: NewsRequest): Promise<News> => {
  const { data } = await client.post("/admin/news", newsData);
  return data;
};

export const updateNews = async (newsId: number, newsData: NewsRequest): Promise<News> => {
  const { data } = await client.post(`/admin/news/${newsId}`, newsData);
  return data;
};

export const deleteNews = async (newsId: number): Promise<void> => {
  await client.delete(`/admin/news/${newsId}`);
};

export const reorderNews = async (orderedIds: number[]): Promise<void> => {
  await client.patch("/admin/news/reorder", { ordered_ids: orderedIds });
};

export const getPrompts = async (): Promise<Prompt[]> => {
  const { data } = await client.get("/admin/prompts");
  return data;
};

export const getPrompt = async (promptId: string): Promise<Prompt> => {
  const { data } = await client.get(`/admin/prompts/${promptId}`);
  return data;
};

export const updatePrompt = async (promptData: PromptRequest): Promise<Prompt> => {
  const { data } = await client.post("/admin/prompts", promptData);
  return data;
};

export const testPrompt = async (promptData: PromptRequest): Promise<string> => {
  const { data } = await client.post("/admin/prompts/test", promptData);
  return data.generated_text;
}

export const getReviewsDashboard = async (dateAfter?: string, dateBefore?: string): Promise<ReviewsDashboardResponse> => {
  const { data } = await client.get("/dashboard", {
    params: {
      date_after: dateAfter,
      date_before: dateBefore,
    },
  });

  return data;
};

export const exportReviewsFile = async (dateAfter?: string, dateBefore?: string): Promise<void> => {
  const response = await client.get("/export/reviews", {
    params: {
      date_after: dateAfter,
      date_before: dateBefore,
    },
    responseType: "blob",
  });

  downloadBlob(response.data, "reviews.xlsx");
};

export const exportComplaintsFile = async (dateAfter?: string, dateBefore?: string): Promise<void> => {
  const response = await client.get("/export/complaints", {
    params: {
      date_after: dateAfter,
      date_before: dateBefore,
    },
    responseType: "blob",
  });

  downloadBlob(response.data, "complaints.xlsx");
};

export const linkMax = async (): Promise<StartLinkResponse> => {
  const { data } = await client.get("/max/link");
  return data;
};

export const unlinkMax = async (): Promise<void> => {
  await client.post("/max/unlink");
};

export const linkTelegram = async (): Promise<StartLinkResponse> => {
  const { data } = await client.get("/telegram/link");
  return data;
};

export const unlinkTelegram = async (): Promise<void> => {
  await client.post("/telegram/unlink");
};

export const uploadImageFile = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await client.post("/images/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

const downloadBlob = (blob: Blob, filename: string) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
};