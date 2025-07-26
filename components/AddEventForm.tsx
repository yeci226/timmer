"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Calendar,
  Clock,
  Target,
  FileText,
  Palette,
  Edit,
} from "lucide-react";
import { AddEventFormData, TimelineEvent } from "@/types/timeline";

// 預設顏色選項
const COLOR_OPTIONS = [
  { name: "預設", value: "", class: "bg-gray-500" },
  { name: "藍色", value: "blue", class: "bg-blue-500" },
  { name: "綠色", value: "green", class: "bg-green-500" },
  { name: "紫色", value: "purple", class: "bg-purple-500" },
  { name: "橙色", value: "orange", class: "bg-orange-500" },
  { name: "紅色", value: "red", class: "bg-red-500" },
  { name: "粉色", value: "pink", class: "bg-pink-500" },
  { name: "黃色", value: "yellow", class: "bg-yellow-500" },
  {
    name: "自訂",
    value: "custom",
    class: "bg-gradient-to-r from-purple-500 to-pink-500",
  },
];

interface AddEventFormProps {
  onAddEvent: (event: AddEventFormData) => void;
  editingEvent?: TimelineEvent | null;
  onUpdateEvent?: (event: TimelineEvent) => void;
  onCancelEdit?: () => void;
}

export default function AddEventForm({
  onAddEvent,
  editingEvent,
  onUpdateEvent,
  onCancelEdit,
}: AddEventFormProps) {
  const [formData, setFormData] = useState<AddEventFormData>({
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    title: "",
    description: "",
    color: "",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [customColor, setCustomColor] = useState("#6366f1"); // 自訂顏色狀態

  // 當進入編輯模式時，自動展開表單並填充數據
  useEffect(() => {
    if (editingEvent) {
      setIsExpanded(true);
      setFormData({
        date: editingEvent.date,
        endDate: editingEvent.endDate || "",
        time: editingEvent.time || "",
        endTime: editingEvent.endTime || "",
        title: editingEvent.title,
        description: editingEvent.description || "",
        color: editingEvent.color || "",
      });
      if (editingEvent.color?.startsWith("#")) {
        setCustomColor(editingEvent.color);
      }
    }
  }, [editingEvent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.date || !formData.title) {
      alert("請填寫必要欄位：日期和標題");
      return;
    }

    // 驗證結束日期是否晚於開始日期
    if (formData.endDate && formData.date > formData.endDate) {
      alert("結束日期必須晚於或等於開始日期");
      return;
    }

    // 驗證結束時間是否晚於開始時間
    if (
      formData.endTime &&
      formData.time &&
      formData.time >= formData.endTime
    ) {
      alert("結束時間必須晚於開始時間");
      return;
    }

    if (editingEvent && onUpdateEvent) {
      // 編輯模式：更新現有事件
      const updatedEvent: TimelineEvent = {
        ...editingEvent,
        date: formData.date,
        endDate: formData.endDate || undefined,
        time: formData.time,
        endTime: formData.endTime || undefined,
        title: formData.title,
        description: formData.description || undefined,
        color: formData.color || undefined,
      };
      onUpdateEvent(updatedEvent);
    } else {
      // 添加模式：創建新事件
      onAddEvent(formData);
    }

    // 重置表單
    setFormData({
      date: "",
      endDate: "",
      time: "",
      endTime: "",
      title: "",
      description: "",
      color: "",
    });
    setIsExpanded(false);
  };

  const handleInputChange = (field: keyof AddEventFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorValue: string) => {
    if (colorValue === "custom") {
      // 如果選擇自訂顏色，使用自訂顏色值
      setFormData((prev) => ({ ...prev, color: customColor }));
    } else {
      setFormData((prev) => ({ ...prev, color: colorValue }));
    }
  };

  return (
    <div className="mb-8 p-6 bg-dark-700 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold title-text flex items-center gap-2">
          {editingEvent ? <Edit size={20} /> : <Plus size={20} />}
          {editingEvent ? "編輯事件" : "添加事件"}
        </h2>
        {!editingEvent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {isExpanded ? "收起" : "展開"}
          </button>
        )}
      </div>

      {(isExpanded || editingEvent) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-primary-300 font-semibold">
                <Calendar size={16} />
                開始日期 *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                className="input-style w-full px-4 py-2"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-primary-300 font-semibold">
                <Calendar size={16} />
                結束日期 (可選)
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className="input-style w-full px-4 py-2"
                min={formData.date} // 確保結束日期不早於開始日期
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-primary-300 font-semibold">
                <FileText size={16} />
                標題 *
              </label>
              <input
                type="text"
                placeholder="例如：2025 07 26 20:30 1999前瞻"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="input-style w-full px-4 py-2"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-primary-300 font-semibold">
                <Clock size={16} />
                開始時間 (可選)
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => handleInputChange("time", e.target.value)}
                className="input-style w-full px-4 py-2"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-primary-300 font-semibold">
                <Clock size={16} />
                結束時間 (可選)
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="input-style w-full px-4 py-2"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-300 font-semibold">
              <Target size={16} />
              描述 (可選)
            </label>
            <input
              type="text"
              placeholder="事件描述"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className="input-style w-full px-4 py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-primary-300 font-semibold">
              <Palette size={16} />
              顏色 (可選)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => handleColorChange(color.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    formData.color === color.value ||
                    (color.value === "custom" &&
                      formData.color &&
                      formData.color.startsWith("#"))
                      ? "border-white"
                      : "border-gray-600 hover:border-gray-400"
                  }`}
                >
                  {color.value === "custom" ? (
                    <div
                      className="w-4 h-4 rounded-full cursor-pointer flex items-center justify-center"
                      style={{
                        backgroundColor:
                          formData.color && formData.color.startsWith("#")
                            ? formData.color
                            : customColor,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // 創建一個隱藏的顏色選擇器
                        const colorInput = document.createElement("input");
                        colorInput.type = "color";
                        colorInput.value =
                          formData.color && formData.color.startsWith("#")
                            ? formData.color
                            : customColor;
                        colorInput.style.position = "absolute";
                        colorInput.style.opacity = "0";
                        colorInput.style.pointerEvents = "none";
                        document.body.appendChild(colorInput);

                        colorInput.addEventListener("change", (e) => {
                          const newColor = (e.target as HTMLInputElement).value;
                          setCustomColor(newColor);
                          setFormData((prev) => ({ ...prev, color: newColor }));
                          document.body.removeChild(colorInput);
                        });

                        colorInput.click();
                      }}
                    />
                  ) : (
                    <div
                      className={`w-4 h-4 rounded-full ${color.class}`}
                    ></div>
                  )}
                  <span className="text-sm text-gray-300">{color.name}</span>
                </button>
              ))}
            </div>

            {/* 移除舊的自訂顏色輸入區塊 */}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn-primary flex items-center gap-2"
            >
              {editingEvent ? <Edit size={16} /> : <Plus size={16} />}
              {editingEvent ? "更新事件" : "添加事件"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (editingEvent && onCancelEdit) {
                  onCancelEdit();
                } else {
                  setIsExpanded(false);
                }
              }}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
