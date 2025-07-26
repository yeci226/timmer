"use client";

import { useState, useEffect } from "react";
import { PresetTemplate, PresetRepeatType } from "@/types/timeline";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Settings,
  Eye,
  EyeOff,
  Palette,
  Calendar,
  Clock,
  Target,
  FileText,
} from "lucide-react";

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

const REPEAT_TYPE_LABELS: Record<PresetRepeatType, string> = {
  hour: "每小時",
  day: "每天",
  week: "每週",
  month: "每月",
};

interface PresetTemplateManagerProps {
  templates: PresetTemplate[];
  onChange: (templates: PresetTemplate[]) => void;
  timelineFutureCount: number;
  setTimelineFutureCount: (n: number) => void;
  editingTemplateId?: string | null;
  onEditingTemplateIdChange?: (id: string | null) => void;
}

export default function PresetTemplateManager({
  templates,
  onChange,
  timelineFutureCount,
  setTimelineFutureCount,
  editingTemplateId,
  onEditingTemplateIdChange,
}: PresetTemplateManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [customColor, setCustomColor] = useState("#6366f1"); // 自訂顏色狀態
  const [form, setForm] = useState<Omit<PresetTemplate, "id">>({
    title: "",
    description: "",
    repeatType: "day",
    repeatInterval: 1,
    time: "",
    endTime: "",
    startDate: "",
    color: "",
  });

  // 處理外部觸發的編輯
  useEffect(() => {
    if (editingTemplateId && editingTemplateId !== editingId) {
      setEditingId(editingTemplateId);
      setIsExpanded(true);
    }
  }, [editingTemplateId, editingId]);

  // 編輯時填充表單
  useEffect(() => {
    if (editingId) {
      const tpl = templates.find((t) => t.id === editingId);
      if (tpl) {
        setForm({
          title: tpl.title,
          description: tpl.description,
          repeatType: tpl.repeatType,
          repeatInterval: tpl.repeatInterval,
          time: tpl.time,
          endTime: tpl.endTime || "",
          startDate: tpl.startDate || "",
          color: tpl.color || "",
        });
      }
    } else {
      setForm({
        title: "",
        description: "",
        repeatType: "day",
        repeatInterval: 1,
        time: "",
        endTime: "",
        startDate: "",
        color: "",
      });
    }
  }, [editingId, templates]);

  const handleChange = (field: keyof typeof form, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleColorChange = (colorValue: string) => {
    if (colorValue === "custom") {
      // 如果選擇自訂顏色，使用自訂顏色值
      setForm((prev) => ({ ...prev, color: customColor }));
    } else {
      setForm((prev) => ({ ...prev, color: colorValue }));
    }
  };

  const handleSave = () => {
    if (!form.title) {
      alert("請填寫標題");
      return;
    }
    if (form.endTime && form.time && form.time >= form.endTime) {
      alert("結束時間必須晚於開始時間");
      return;
    }
    if (form.repeatInterval < 1) {
      alert("間隔必須大於0");
      return;
    }
    if (editingId) {
      onChange(
        templates.map((t) => (t.id === editingId ? { ...t, ...form } : t))
      );
      setEditingId(null);
      // 清除外部編輯狀態
      if (onEditingTemplateIdChange) {
        onEditingTemplateIdChange(null);
      }
    } else {
      onChange([...templates, { ...form, id: Date.now().toString() }]);
    }
    setForm({
      title: "",
      description: "",
      repeatType: "day",
      repeatInterval: 1,
      time: "",
      endTime: "",
      startDate: "",
      color: "",
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("確定要刪除這個模板嗎？")) {
      onChange(templates.filter((t) => t.id !== id));
      if (editingId === id) setEditingId(null);
    }
  };

  const handleToggleShow = (id: string) => {
    onChange(
      templates.map((t) =>
        t.id === id ? { ...t, showOnTimeline: !t.showOnTimeline } : t
      )
    );
  };

  // 格式化週期顯示
  const formatRepeatText = (repeatType: PresetRepeatType, interval: number) => {
    const typeLabels = {
      hour: "小時",
      day: "天",
      week: "週",
      month: "月",
    };
    return `每 ${interval} ${typeLabels[repeatType]}`;
  };

  return (
    <div className="mb-8 p-6 bg-dark-700 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold title-text flex items-center gap-2">
          <FileText size={20} />
          自訂預設事件模板
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn-secondary flex items-center gap-2"
          >
            <Settings size={14} />
            設定
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            {isExpanded ? "收起" : "展開"}
          </button>
        </div>
      </div>

      {/* 設定面板 */}
      {showSettings && (
        <div className="mb-4 p-4 bg-dark-700 rounded-lg border border-gray-600">
          <h3 className="text-lg font-semibold text-primary-300 mb-3">
            顯示設定
          </h3>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-primary-300 font-semibold">
                每個模板在時間軸顯示未來：
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={timelineFutureCount}
                  onChange={(e) =>
                    setTimelineFutureCount(Number(e.target.value))
                  }
                  className="input-style w-20 px-2 py-1"
                />
                筆
              </label>
            </div>
          </div>
        </div>
      )}

      {isExpanded && (
        <div className="space-y-6">
          {/* 表單 */}
          <div className="p-4 bg-dark-700 rounded-lg border border-gray-600 mb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-primary-300 font-semibold">
                  <FileText size={16} />
                  標題 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="input-style w-full px-4 py-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-primary-300 font-semibold">
                  <Target size={16} />
                  描述
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="input-style w-full px-4 py-2"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-primary-300 font-semibold">
                  <Calendar size={16} />
                  起始日期 (可選)
                </label>
                <input
                  type="date"
                  value={form.startDate || ""}
                  onChange={(e) => handleChange("startDate", e.target.value)}
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
                      onClick={(e) => {
                        if (color.value === "custom") {
                          // 創建一個隱藏的顏色選擇器
                          const colorInput = document.createElement("input");
                          colorInput.type = "color";
                          colorInput.value =
                            form.color && form.color.startsWith("#")
                              ? form.color
                              : customColor;

                          // 設置顏色選擇器的位置在點擊位置附近
                          const rect = (
                            e.target as HTMLElement
                          ).getBoundingClientRect();
                          colorInput.style.position = "fixed";
                          colorInput.style.left = `${rect.left}px`;
                          colorInput.style.top = `${rect.bottom + 5}px`;
                          colorInput.style.zIndex = "9999";
                          colorInput.style.opacity = "0";
                          colorInput.style.pointerEvents = "none";
                          document.body.appendChild(colorInput);

                          colorInput.addEventListener("change", (e) => {
                            const newColor = (e.target as HTMLInputElement)
                              .value;
                            setCustomColor(newColor);
                            setForm((prev) => ({ ...prev, color: newColor }));
                            document.body.removeChild(colorInput);
                          });

                          colorInput.click();
                        } else {
                          handleColorChange(color.value);
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                        (color.value === "custom" &&
                          form.color &&
                          form.color.startsWith("#")) ||
                        (color.value !== "custom" && form.color === color.value)
                          ? "border-white"
                          : "border-gray-400"
                      }`}
                    >
                      {color.value === "custom" ? (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center border border-gray-400"
                          style={{
                            backgroundColor:
                              form.color && form.color.startsWith("#")
                                ? form.color
                                : customColor,
                          }}
                        />
                      ) : (
                        <div
                          className={`w-4 h-4 rounded-full ${color.class}`}
                        ></div>
                      )}
                      <span className="text-sm text-gray-300">
                        {color.name}
                      </span>
                    </button>
                  ))}
                </div>

                {/* 移除舊的自訂顏色輸入區塊 */}
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-primary-300 font-semibold">
                  <Clock size={16} />
                  週期 *
                </label>
                <div className="flex gap-2">
                  <select
                    value={form.repeatType}
                    onChange={(e) =>
                      handleChange(
                        "repeatType",
                        e.target.value as PresetRepeatType
                      )
                    }
                    className="input-style px-2 py-2"
                  >
                    <option value="hour">每小時</option>
                    <option value="day">每天</option>
                    <option value="week">每週</option>
                    <option value="month">每月</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={form.repeatInterval}
                    onChange={(e) =>
                      handleChange("repeatInterval", Number(e.target.value))
                    }
                    className="input-style w-20 px-2 py-2"
                  />
                  <span className="text-gray-400 self-center">
                    {form.repeatType === "hour"
                      ? "小時"
                      : form.repeatType === "day"
                      ? "天"
                      : form.repeatType === "week"
                      ? "週"
                      : "月"}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-primary-300 font-semibold">
                  <Clock size={16} />
                  開始時間 (可選)
                </label>
                <input
                  type="time"
                  value={form.time}
                  onChange={(e) => handleChange("time", e.target.value)}
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
                  value={form.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                  className="input-style w-full px-4 py-2"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                className="btn-primary flex items-center gap-2"
                onClick={handleSave}
              >
                <Save size={16} />
                {editingId ? "儲存修改" : "新增模板"}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-secondary flex items-center gap-2"
                  onClick={() => setEditingId(null)}
                >
                  <X size={16} />
                  取消編輯
                </button>
              )}
            </div>
          </div>

          {/* 模板列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.length === 0 ? (
              <div className="text-gray-400 col-span-3 text-center py-8">
                尚無模板，請新增。
              </div>
            ) : (
              templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 bg-dark-700 rounded-lg border border-gray-600 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <div className="font-semibold text-primary-300">
                        {tpl.title}
                      </div>
                      <div className="text-sm text-gray-400">
                        {tpl.description}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        className={`p-1 ${
                          tpl.showOnTimeline
                            ? "text-green-400"
                            : "text-gray-400"
                        } hover:text-green-300`}
                        onClick={() => handleToggleShow(tpl.id)}
                        title={
                          tpl.showOnTimeline ? "隱藏於時間軸" : "顯示於時間軸"
                        }
                      >
                        {tpl.showOnTimeline ? (
                          <Eye size={16} />
                        ) : (
                          <EyeOff size={16} />
                        )}
                      </button>
                      <button
                        className="p-1 text-blue-400 hover:text-blue-300"
                        onClick={() => setEditingId(tpl.id)}
                        title="編輯"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="p-1 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(tpl.id)}
                        title="刪除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    {formatRepeatText(tpl.repeatType, tpl.repeatInterval)}
                    {tpl.time && `，${tpl.time}`}
                    {tpl.endTime && ` - ${tpl.endTime}`}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
