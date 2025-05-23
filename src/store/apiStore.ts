
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ApiSettings {
  apiUrl: string;
  apiKey: string;
  model: string;
}

interface ApiStore {
  apiSettings: ApiSettings;
  updateApiSettings: (settings: ApiSettings) => void;
}

const defaultSettings: ApiSettings = {
  apiUrl: "https://api.siliconflow.cn/v1/chat/completions",
  apiKey: "",
  model: "Qwen/Qwen3-8B",
};

export const useApiStore = create<ApiStore>()(
  persist(
    (set) => ({
      apiSettings: defaultSettings,
      updateApiSettings: (settings) => set({ apiSettings: settings }),
    }),
    {
      name: "api-settings",
    }
  )
);
