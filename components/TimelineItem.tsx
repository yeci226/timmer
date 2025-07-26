"use client";

import { Calendar, Clock, Target, Trash2, Edit } from "lucide-react";
import { TimelineEvent } from "@/types/timeline";
import { format, parseISO } from "date-fns";
import { zhTW } from "date-fns/locale";

interface TimelineItemProps {
  event: TimelineEvent;
  onDelete: (id: string) => void;
  onEdit: (event: TimelineEvent) => void;
  isCompact?: boolean;
}

export default function TimelineItem({
  event,
  onDelete,
  onEdit,
  isCompact = false,
}: TimelineItemProps) {
  // 檢查是否為當前時間指示器
  const isCurrentTime = event.id === "current-time";

  // 檢查事件是否正在進行中
  const isEventInProgress = () => {
    if (isCurrentTime) return false;

    const now = new Date();
    const currentDate = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm");

    // 檢查日期是否在事件範圍內
    const eventStartDate = event.date;
    const eventEndDate = event.endDate || event.date;

    if (currentDate < eventStartDate || currentDate > eventEndDate) {
      return false;
    }

    // 如果事件有時間設定，檢查時間是否在範圍內
    if (event.time && event.endTime) {
      return currentTime >= event.time && currentTime <= event.endTime;
    } else if (event.time) {
      // 只有開始時間，檢查是否已開始
      return currentTime >= event.time;
    } else if (event.endTime) {
      // 只有結束時間，檢查是否未結束
      return currentTime <= event.endTime;
    }

    // 沒有時間設定，只要日期符合就算進行中
    return true;
  };

  const isInProgress = isEventInProgress();

  // 檢查事件是否已經過去
  const isEventPast = () => {
    if (isCurrentTime) return false;

    const now = new Date();
    const currentDate = format(now, "yyyy-MM-dd");
    const currentTime = format(now, "HH:mm");

    // 檢查事件結束日期和時間
    const eventEndDate = event.endDate || event.date;
    const eventEndTime = event.endTime || event.time;

    // 如果事件結束日期早於今天，則已過去
    if (eventEndDate < currentDate) {
      return true;
    }

    // 如果事件結束日期是今天，檢查結束時間
    if (eventEndDate === currentDate && eventEndTime) {
      return currentTime > eventEndTime;
    }

    return false;
  };

  const isPast = isEventPast();
  let formattedDate = "";
  let formattedEndDate = "";
  try {
    // 確保日期格式正確 (YYYY-MM-DD)
    const dateStr = event.date;
    if (dateStr && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const eventDate = parseISO(dateStr);
      formattedDate = format(eventDate, "yyyy年MM月dd日", { locale: zhTW });
    } else {
      // 如果日期格式不正確，直接顯示原始日期
      formattedDate = event.date;
    }

    // 處理結束日期
    if (event.endDate && event.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const eventEndDate = parseISO(event.endDate);
      formattedEndDate = format(eventEndDate, "yyyy年MM月dd日", {
        locale: zhTW,
      });
    } else if (event.endDate) {
      formattedEndDate = event.endDate;
    }
  } catch (error) {
    console.error("日期解析錯誤:", error, "原始日期:", event.date);
    formattedDate = event.date;
    formattedEndDate = event.endDate || "";
  }

  const getColorClass = (color?: string) => {
    if (!color) {
      // 如果沒有指定顏色，使用灰色
      return "text-gray-400";
    }

    // 檢查是否為自訂顏色（十六進制）
    if (color.startsWith("#")) {
      return ""; // 自訂顏色使用 style 屬性
    }

    // 根據指定的顏色返回對應的樣式
    const colorMap: Record<string, string> = {
      blue: "text-blue-400",
      green: "text-green-400",
      purple: "text-purple-400",
      orange: "text-orange-400",
      red: "text-red-400",
      pink: "text-pink-400",
      yellow: "text-yellow-400",
    };

    return colorMap[color] || "text-primary-400";
  };

  const getBorderColorClass = (color?: string) => {
    if (!color) return "border-gray-600";

    // 檢查是否為自訂顏色（十六進制）
    if (color.startsWith("#")) {
      return ""; // 自訂顏色使用 style 屬性
    }

    const colorMap: Record<string, string> = {
      blue: "border-blue-600",
      green: "border-green-600",
      purple: "border-purple-600",
      orange: "border-orange-600",
      red: "border-red-600",
      pink: "border-pink-600",
      yellow: "border-yellow-600",
    };

    return colorMap[color] || "border-primary-600";
  };

  // 計算持續時間（如果有的話）
  const getDurationText = () => {
    if (!event.endTime || !event.time) return null;

    const startTime = new Date(`2000-01-01T${event.time}`);
    const endTime = new Date(`2000-01-01T${event.endTime}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}小時${diffMinutes > 0 ? ` ${diffMinutes}分鐘` : ""}`;
    } else {
      return `${diffMinutes}分鐘`;
    }
  };

  const getTimelineDotColor = (color?: string) => {
    // 如果沒有指定顏色，使用灰色
    if (!color) {
      return "#6b7280"; // gray-500
    }

    // 檢查是否為自訂顏色（十六進制）
    if (color.startsWith("#")) {
      return color;
    }

    // 根據指定的顏色返回對應的顏色值
    const colorMap: Record<string, string> = {
      blue: "#3b82f6",
      green: "#10b981",
      purple: "#8b5cf6",
      orange: "#f97316",
      red: "#ef4444",
      pink: "#ec4899",
      yellow: "#eab308",
    };

    return colorMap[color] || "#10b981";
  };

  return (
    <div
      className={`timeline-item ${isPast ? "mr-8 ml-0 past-event" : "ml-8"} ${
        isCurrentTime ? "mb-2 pb-1 animate-pulse" : isCompact ? "mb-2" : "mb-6"
      } ${
        isPast
          ? "border-gray-500 border-2"
          : isInProgress
          ? "border-green-500 border-2"
          : getBorderColorClass(event.color)
      } ${isCurrentTime ? "border-green-500 border-2" : ""} ${
        isPast ? "opacity-60 scale-95" : ""
      } ${isCompact ? "scale-75 origin-left" : ""}`}
      style={
        {
          ...(event.color?.startsWith("#") && !isInProgress
            ? { borderColor: event.color }
            : {}),
          "--timeline-dot-color": isPast
            ? "#6b7280"
            : isInProgress
            ? "#10b981"
            : getTimelineDotColor(event.color),
        } as React.CSSProperties
      }
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div
            className={`${
              isPast
                ? "text-gray-500"
                : isInProgress
                ? "text-green-400"
                : getColorClass(event.color)
            } font-bold text-lg ${isCurrentTime ? "text-green-400" : ""}`}
            style={
              event.color?.startsWith("#") && !isInProgress && !isPast
                ? { color: event.color }
                : {}
            }
          >
            {isCurrentTime ? (
              <div className="flex items-center gap-2">
                <span>{event.title}</span>
                <span className="text-accent-400 font-semibold">
                  {formattedDate.replace(/^\d{4}年/, "")} {event.time}
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2">
                  <span>{event.title}</span>
                  {isInProgress && (
                    <span className="text-green-400 text-sm font-semibold bg-green-900 px-2 py-1 rounded">
                      進行中
                    </span>
                  )}
                </div>
                {event.description && (
                  <div className="mt-1">
                    <p className="text-gray-400 text-sm">{event.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {!isCurrentTime && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(event)}
              className="text-blue-400 hover:text-blue-300 transition-colors p-1"
              title="編輯事件"
            >
              <Edit size={16} />
            </button>
            <button
              onClick={() => onDelete(event.id)}
              className="text-red-400 hover:text-red-300 transition-colors p-1"
              title="刪除事件"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {!isCurrentTime && (
        // 普通事件顯示完整信息
        <div className="space-y-2 text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary-400" />
            <span className="text-primary-400 font-semibold">
              {formattedDate}
              {formattedEndDate && formattedEndDate !== formattedDate && (
                <span> - {formattedEndDate}</span>
              )}
            </span>
          </div>

          {(event.time || event.endTime) && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-accent-400" />
              <span className="text-accent-400 font-semibold">
                {event.time ? event.time : "未設定開始時間"}
                {event.endTime && ` - ${event.endTime}`}
              </span>
            </div>
          )}

          {event.time && event.endTime && (
            <div className="flex items-center gap-2">
              <Target size={14} className="text-blue-400" />
              <span className="text-blue-400 font-semibold">
                持續時間: {getDurationText()}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
