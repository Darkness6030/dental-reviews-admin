export type UserRequest = {
    name: string;
    username: string;
    password: string;
    is_admin: boolean;
    avatar_url: string | null;
};

export type User = {
    id: number;
    name: string;
    username: string;
    is_admin: boolean;
    is_owner: boolean;
    avatar_url: string | null;
    max_id: number | null;
    max_name: string | null;
    telegram_id: number | null;
    telegram_name: string | null;
}

export type DoctorRequest = {
    name: string;
    role: string;
    avatar_url: string | null;
    is_enabled: boolean;
    service_ids: number[];
};

export type Doctor = {
    id: number;
    name: string;
    role: string;
    avatar_url: string | null;
    is_enabled: boolean;
    services: Service[];
};

export type ServiceRequest = {
    name: string;
    category: string;
    is_enabled: boolean;
};

export type Service = {
    id: number;
    name: string;
    category: string;
    is_enabled: boolean;
};

export type AspectRequest = {
    name: string;
    is_enabled: boolean;
};

export type Aspect = {
    id: number;
    name: string;
    is_enabled: boolean;
};

export type SourceRequest = {
    name: string;
    is_enabled: boolean;
};

export type Source = {
    id: number;
    name: string;
    is_enabled: boolean;
};

export type RewardRequest = {
    name: string;
    image_url: string | null;
    is_enabled: boolean;
};

export type Reward = {
    id: number;
    name: string;
    image_url: string | null;
    is_enabled: boolean;
};

export type PlatformRequest = {
    name: string;
    url: string;
    image_url: string | null;
    is_enabled: boolean;
};

export type Platform = {
    id: number;
    name: string;
    url: string;
    image_url: string | null;
    is_enabled: boolean;
};

export type ReasonRequest = {
    name: string;
    is_enabled: boolean;
};

export type Reason = {
    id: number;
    name: string;
    is_enabled: boolean;
};

export type PromptRequest = {
    id: string;
    prompt_text: string;
    temperature: number;
    frequency_penalty: number;
};

export type Prompt = {
    id: string;
    prompt_text: string;
    temperature: number;
    frequency_penalty: number;
};

export type Review = {
    id: number;
    contact_name: string | null;
    contact_phone: string | null;
    review_text: string | null;
    selected_doctors: Doctor[];
    selected_services: Service[];
    selected_aspects: Aspect[];
    selected_source: Source | null;
    selected_reward: Reward | null;
    published_platforms: Platform[];
};

export type Complaint = {
    id: number;
    contact_name: string | null;
    contact_phone: string | null;
    complaint_text: string | null;
    selected_reasons: Reason[];
};

export type ReviewsDashboardResponse = {
    reviews: Review[];
    complaints: Complaint[];
};

export type ResetPasswordRequest = {
    password: string
    new_password: string
}

export type StartLinkResponse = {
    start_link: string;
}

export type UploadImageResponse = {
    filename: string;
    image_url: string;
}