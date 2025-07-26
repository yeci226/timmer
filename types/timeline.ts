export interface TimelineEvent {
  id: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD - 新增：結束日期
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  title: string;
  description?: string;
  createdAt: string;
  color?: string; // 新增：事件顏色
}

export interface AddEventFormData {
  date: string;
  endDate?: string; // 新增：結束日期
  time?: string;
  endTime?: string;
  title: string;
  description?: string;
  color?: string; // 新增：事件顏色
}

export interface PresetEvent {
  id: string;
  title: string;
  description?: string;
  time?: string;
  endTime?: string;
  color?: string; // 新增：預設事件顏色
}

export type PresetRepeatType = "hour" | "day" | "week" | "month";

export interface PresetTemplate {
  id: string;
  title: string;
  description?: string;
  repeatType: PresetRepeatType;
  repeatInterval: number;
  time?: string; // HH:mm
  endTime?: string; // HH:mm
  showOnTimeline?: boolean; // 是否顯示在時間軸
  startDate?: string; // 新增
  color?: string; // 新增：模板顏色
}
