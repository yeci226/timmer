"use client";

import { useState, useEffect } from "react";
import {
  TimelineEvent,
  AddEventFormData,
  PresetEvent,
  PresetTemplate,
} from "@/types/timeline";
import AddEventForm from "@/components/AddEventForm";
import PresetTemplateManager from "@/components/PresetTemplateManager";
import TimelineItem from "@/components/TimelineItem";
import { useAuth } from "@/contexts/AuthContext";
import { Settings } from "lucide-react";
import {
  format,
  parseISO,
  addDays,
  addWeeks,
  addMonths,
  addHours,
} from "date-fns";

const getPackageVersion = async () => {
  try {
    const response = await fetch("/api/version");
    const data = await response.json();
    return data.version;
  } catch (error) {
    return "0.1.0";
  }
};

function getNextDates(
  start: Date,
  type: string,
  interval: number,
  count: number
) {
  const result: Date[] = [];
  let current = start;
  for (let i = 0; i < count; i++) {
    result.push(current);
    if (type === "day") current = addDays(current, interval);
    else if (type === "week") current = addWeeks(current, interval);
    else if (type === "month") current = addMonths(current, interval);
    else if (type === "hour") current = addHours(current, interval);
  }
  return result;
}

function getTemplateStartDate(tpl: PresetTemplate) {
  if (tpl.startDate) {
    const d = new Date(tpl.startDate);
    if (tpl.time) {
      const [h, m] = tpl.time.split(":");
      d.setHours(Number(h), Number(m), 0, 0);
    }
    return d;
  }
  const now = new Date();
  if (tpl.time) {
    const [h, m] = tpl.time.split(":");
    now.setHours(Number(h), Number(m), 0, 0);
  }
  return now;
}

export default function Home() {
  const {
    user,
    signIn,
    signOut,
    syncEvents,
    syncTemplates,
    syncDisplaySettings,
    loadUserData,
  } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [presetTemplates, setPresetTemplates] = useState<PresetTemplate[]>([]);
  const [timelineFutureCount, setTimelineFutureCount] = useState<number>(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // 在客戶端載入時設置初始值
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const saved = localStorage.getItem("timeline-future-count");
      if (saved) {
        setTimelineFutureCount(Number(saved));
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(
    null
  );
  const [appVersion, setAppVersion] = useState<string>("0.1.0");
  const [commits, setCommits] = useState<any[]>([]);
  const [showCommits, setShowCommits] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>();
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [syncDisabled, setSyncDisabled] = useState(false);
  // 监听在线状态
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // 处理同步成功状态和一分钟禁用
  useEffect(() => {
    if (syncSuccess) {
      // 3秒后清除成功状态
      const successTimer = setTimeout(() => {
        setSyncSuccess(false);
      }, 3000);

      // 一分钟内禁用同步按钮
      setSyncDisabled(true);
      const disableTimer = setTimeout(() => {
        setSyncDisabled(false);
      }, 60000); // 60秒

      return () => {
        clearTimeout(successTimer);
        clearTimeout(disableTimer);
      };
    }
  }, [syncSuccess]);

  // 載入數據
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        // 用戶已登入，優先從雲端載入資料
        try {
          const {
            events: cloudEvents,
            templates: cloudTemplates,
            displaySettings: cloudDisplaySettings,
          } = await loadUserData();

          let hasCloudData = false;

          if (cloudEvents.length > 0) {
            setEvents(cloudEvents);
            console.log("從雲端載入事件資料成功");
            hasCloudData = true;
          } else {
            console.log("雲端沒有事件資料");
          }

          if (cloudTemplates.length > 0) {
            setPresetTemplates(cloudTemplates);
            console.log("從雲端載入模板資料成功");
            hasCloudData = true;
          } else {
            console.log("雲端沒有模板資料");
          }

          // 載入顯示設定
          if (
            cloudDisplaySettings &&
            Object.keys(cloudDisplaySettings).length > 0
          ) {
            if (cloudDisplaySettings.timelineFutureCount) {
              // 只有在本地没有设置时才从云端加载
              const localCount = localStorage.getItem("timeline-future-count");
              if (!localCount) {
                setTimelineFutureCount(
                  cloudDisplaySettings.timelineFutureCount
                );
                console.log("從雲端載入顯示設定成功");
              } else {
                console.log("本地已有顯示設定，使用本地設定");
              }
              hasCloudData = true;
            }
          } else {
            console.log("雲端沒有顯示設定，使用預設值");
          }

          // 如果雲端有任何資料，更新最後同步時間
          if (hasCloudData) {
            setLastSyncTime(new Date().toISOString());
            console.log("✅ 雲端載入完成，已更新同步時間");
          } else {
            console.log("雲端完全沒有資料，嘗試從本地載入");
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error("從雲端載入資料失敗:", error);
          // 如果雲端載入失敗，回退到本地儲存
          loadFromLocalStorage();
        }
      } else {
        // 用戶未登入，從本地儲存載入資料
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      const savedAllEvents = localStorage.getItem("all-timeline-events");
      if (savedAllEvents) {
        try {
          const allEvents = JSON.parse(savedAllEvents);
          // 分離出自動產生的事件和手動添加的事件
          const manualEvents = allEvents.filter(
            (event: TimelineEvent) => !event.id.startsWith("auto-")
          );
          setEvents(manualEvents);
        } catch (error) {
          console.error("載入事件數據失敗:", error);
        }
      } else {
        // 如果沒有 all-timeline-events，嘗試載入舊的 timeline-events
        const savedEvents = localStorage.getItem("timeline-events");
        if (savedEvents) {
          try {
            setEvents(JSON.parse(savedEvents));
          } catch (error) {
            console.error("載入事件數據失敗:", error);
          }
        }
      }

      // 載入預設模板
      const savedTemplates = localStorage.getItem("preset-templates");
      if (savedTemplates) {
        try {
          const parsedTemplates = JSON.parse(savedTemplates);
          console.log("載入預設模板:", parsedTemplates);
          if (parsedTemplates && parsedTemplates.length > 0) {
            setPresetTemplates(parsedTemplates);
          }
        } catch (error) {
          console.error("載入模板數據失敗:", error);
        }
      } else {
        console.log("沒有找到保存的預設模板");
      }

      // 載入時間軸未來事件數量設定
      const savedTimelineFutureCount = localStorage.getItem(
        "timeline-future-count"
      );
      if (savedTimelineFutureCount) {
        const count = Number(savedTimelineFutureCount);
        console.log("載入時間軸未來事件數量:", count);
        // 只有在还没有初始化时才设置
        if (!isInitialized) {
          setTimelineFutureCount(count);
        }
      } else {
        console.log("沒有找到保存的時間軸未來事件數量設定，使用預設值 1");
      }
    };

    // 獲取應用版本
    const fetchVersion = async () => {
      try {
        const version = await getPackageVersion();
        setAppVersion(version);
      } catch (error) {
        console.error("獲取版本失敗:", error);
      }
    };
    fetchVersion();

    // 獲取 GitHub commits
    const fetchCommits = async () => {
      try {
        const response = await fetch("/api/github/commits");
        if (response.ok) {
          const commitsData = await response.json();
          setCommits(commitsData);
        }
      } catch (error) {
        console.error("獲取 commits 失敗:", error);
      }
    };
    fetchCommits();

    loadData();
  }, [user, loadUserData]);

  // 清理過期14天的事件
  useEffect(() => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    setEvents((prevEvents) => {
      const filteredEvents = prevEvents.filter((event) => {
        // 跳過自動生成的事件
        if (event.id.startsWith("auto-")) {
          return true;
        }

        // 檢查事件結束日期
        const eventEndDate = event.endDate || event.date;
        const eventEndDateTime = parseISO(
          `${eventEndDate}T${event.endTime || "23:59"}`
        );

        // 如果事件結束日期晚於7天前，保留事件
        return eventEndDateTime > sevenDaysAgo;
      });

      // 如果有事件被刪除，記錄到控制台
      if (filteredEvents.length < prevEvents.length) {
        const deletedCount = prevEvents.length - filteredEvents.length;
        console.log(`已自動清理 ${deletedCount} 個過期事件`);
      }

      return filteredEvents;
    });
  }, []); // 只在組件掛載時執行一次

  // 保存預設模板
  useEffect(() => {
    console.log("保存預設模板:", presetTemplates);
    if (presetTemplates.length > 0) {
      localStorage.setItem("preset-templates", JSON.stringify(presetTemplates));

      // 如果用戶已登入，同步到雲端
      if (user) {
        syncTemplates(presetTemplates)
          .then(() => {
            setLastSyncTime(new Date().toISOString());
          })
          .catch((error) => {
            console.error("同步模板到雲端失敗:", error);
          });
      }
    }
  }, [presetTemplates, user, syncTemplates]);

  // 保存時間軸未來事件數量設定到 localStorage
  useEffect(() => {
    // 只有在已初始化且值不为默认值时才保存
    if (isInitialized && timelineFutureCount !== 1) {
      localStorage.setItem(
        "timeline-future-count",
        timelineFutureCount.toString()
      );
      console.log("保存時間軸未來事件數量:", timelineFutureCount);

      // 如果用戶已登入，同步顯示設定到雲端
      if (user) {
        const displaySettings = {
          timelineFutureCount: timelineFutureCount,
        };
        syncDisplaySettings(displaySettings)
          .then(() => {
            console.log("顯示設定已同步到雲端");
          })
          .catch((error) => {
            console.error("同步顯示設定到雲端失敗:", error);
          });
      }
    }
  }, [timelineFutureCount, user, syncDisplaySettings, isInitialized]);

  const addEvent = (formData: AddEventFormData) => {
    const newEvent: TimelineEvent = {
      id: Date.now().toString(),
      date: formData.date,
      endDate: formData.endDate || undefined,
      time: formData.time,
      endTime: formData.endTime || undefined,
      title: formData.title,
      description: formData.description || undefined,
      color: formData.color || undefined,
      createdAt: new Date().toISOString(),
    };
    setEvents((prev) => {
      const updatedEvents = [...prev, newEvent];

      // 如果用戶已登入，同步到雲端
      if (user) {
        syncEvents(updatedEvents)
          .then(() => {
            setLastSyncTime(new Date().toISOString());
          })
          .catch((error) => {
            console.error("同步事件到雲端失敗:", error);
          });
      }

      return updatedEvents;
    });
  };

  const deleteEvent = (id: string) => {
    if (confirm("確定要刪除這個事件嗎？")) {
      setEvents((prev) => {
        const updatedEvents = prev.filter((event) => event.id !== id);

        // 如果用戶已登入，同步到雲端
        if (user) {
          syncEvents(updatedEvents)
            .then(() => {
              setLastSyncTime(new Date().toISOString());
            })
            .catch((error) => {
              console.error("同步事件到雲端失敗:", error);
            });
        }

        return updatedEvents;
      });
    }
  };

  const editEvent = (event: TimelineEvent) => {
    // 檢查是否為自動生成的預設模板事件
    if (event.id.startsWith("auto-")) {
      // 從事件 ID 中提取模板 ID
      // 格式: auto-{templateId}-{date}-{index}
      const templateId = event.id.split("-")[1];
      const template = presetTemplates.find((t) => t.id === templateId);

      if (template) {
        // 跳轉到預設模板編輯
        setEditingTemplateId(templateId);
        setShowModal(true);
        return;
      }
    }

    // 普通事件編輯
    setEditingEvent(event);
    setShowModal(true);
  };

  const updateEvent = (updatedEvent: TimelineEvent) => {
    setEvents((prev) => {
      const updatedEvents = prev.map((event) =>
        event.id === updatedEvent.id ? updatedEvent : event
      );

      // 如果用戶已登入，同步到雲端
      if (user) {
        syncEvents(updatedEvents)
          .then(() => {
            setLastSyncTime(new Date().toISOString());
          })
          .catch((error) => {
            console.error("同步事件到雲端失敗:", error);
          });
      }

      return updatedEvents;
    });
    setEditingEvent(null);
    setShowModal(false);
  };

  const cancelEdit = () => {
    setEditingEvent(null);
    setShowModal(false);
  };

  // 產生自動顯示的模板事件
  const autoTemplateEvents: TimelineEvent[] = [];
  presetTemplates.forEach((tpl) => {
    if (tpl.showOnTimeline) {
      const nextDates = getNextDates(
        getTemplateStartDate(tpl),
        tpl.repeatType,
        tpl.repeatInterval,
        timelineFutureCount
      );
      nextDates.forEach((d, idx) => {
        autoTemplateEvents.push({
          id: `auto-${tpl.id}-${format(d, "yyyyMMdd")}-${idx}`,
          date: format(d, "yyyy-MM-dd"),
          time: tpl.time || "",
          endTime: tpl.endTime || undefined,
          title: tpl.title,
          description: tpl.description || undefined,
          color: tpl.color || undefined,
          createdAt: new Date().toISOString(),
        });
      });
    }
  });

  // 合併自訂事件與自動模板事件，並去重（以 id 區分）
  const allEvents = [...events, ...autoTemplateEvents].filter(
    (e, idx, arr) => arr.findIndex((ev) => ev.id === e.id) === idx
  );

  // 按日期和時間排序（最近的在前）
  const sortedEvents = [...allEvents].sort((a, b) => {
    const dateA = parseISO(`${a.date}T${a.time || "00:00"}`);
    const dateB = parseISO(`${b.date}T${b.time || "00:00"}`);
    return dateA.getTime() - dateB.getTime();
  });

  // 創建包含當前時間指示器的完整事件列表
  const now = new Date();
  const currentTimeEvent: TimelineEvent = {
    id: "current-time",
    date: format(now, "yyyy-MM-dd"),
    time: format(now, "HH:mm"),
    title: "當前時間",
    createdAt: now.toISOString(),
    color: "green",
  };

  // 檢查事件是否正在進行中
  const isEventInProgress = (event: TimelineEvent) => {
    if (event.id === "current-time") return false;

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

  // 將當前時間事件插入到正確的位置
  const eventsWithCurrentTime = [...sortedEvents];

  // 找到第一個進行中的事件
  const firstInProgressIndex =
    eventsWithCurrentTime.findIndex(isEventInProgress);

  if (firstInProgressIndex !== -1) {
    // 如果有進行中的事件，將當前時間插入到第一個進行中事件之前
    eventsWithCurrentTime.splice(firstInProgressIndex, 0, currentTimeEvent);
  } else {
    // 如果沒有進行中的事件，按時間順序插入
    const currentTimeIndex = eventsWithCurrentTime.findIndex((event) => {
      const eventDate = parseISO(`${event.date}T${event.time || "00:00"}`);
      return eventDate.getTime() > now.getTime();
    });

    if (currentTimeIndex === -1) {
      // 如果當前時間晚於所有事件，插入到最後
      eventsWithCurrentTime.push(currentTimeEvent);
    } else {
      // 插入到正確的位置
      eventsWithCurrentTime.splice(currentTimeIndex, 0, currentTimeEvent);
    }
  }

  // 分離過去事件和當前/未來事件
  const currentTime = new Date();
  const pastEvents = eventsWithCurrentTime.filter((event) => {
    if (event.id === "current-time") return false;

    const eventEndDate = event.endDate || event.date;
    const eventEndTime = event.endTime || "23:59";
    const eventEndDateTime = parseISO(`${eventEndDate}T${eventEndTime}`);

    return eventEndDateTime < currentTime;
  });

  const currentAndFutureEvents = eventsWithCurrentTime.filter((event) => {
    if (event.id === "current-time") return true;

    const eventEndDate = event.endDate || event.date;
    const eventEndTime = event.endTime || "23:59";
    const eventEndDateTime = parseISO(`${eventEndDate}T${eventEndTime}`);

    return eventEndDateTime >= currentTime;
  });

  // 按年月分組當前和未來事件
  const groupedCurrentAndFutureEvents = currentAndFutureEvents.reduce(
    (groups, event) => {
      const date = parseISO(`${event.date}T${event.time || "00:00"}`);
      const year = format(date, "yyyy年");
      const month = format(date, "M月");

      if (!groups[year]) {
        groups[year] = {};
      }
      if (!groups[year][month]) {
        groups[year][month] = [];
      }
      groups[year][month].push(event);
      return groups;
    },
    {} as Record<string, Record<string, TimelineEvent[]>>
  );

  // 按年月分組過去事件
  const groupedPastEvents = pastEvents.reduce((groups, event) => {
    const date = parseISO(`${event.date}T${event.time || "00:00"}`);
    const year = format(date, "yyyy年");
    const month = format(date, "M月");

    if (!groups[year]) {
      groups[year] = {};
    }
    if (!groups[year][month]) {
      groups[year][month] = [];
    }
    groups[year][month].push(event);
    return groups;
  }, {} as Record<string, Record<string, TimelineEvent[]>>);

  // 保存所有事件（包括自動產生的）到 localStorage
  useEffect(() => {
    // 只在有實際變更時才保存，避免無限循環
    if (allEvents.length > 0) {
      localStorage.setItem("all-timeline-events", JSON.stringify(allEvents));
    }
  }, [events, timelineFutureCount]);

  return (
    <div className="min-h-screen bg-dark-900">
      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        {/* 設置按鈕 */}
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-colors"
            title="設置"
          >
            <Settings size={24} />
          </button>
        </div>

        {/* 雙欄時間軸布局 */}
        <div className="flex gap-8">
          {/* 左側：過去事件（縮小版） */}
          {Object.keys(groupedPastEvents).length > 0 && (
            <div className="w-1/4">
              <h3 className="text-lg font-bold text-gray-500 mb-4 sticky top-0 bg-dark-900 py-2">
                過去
              </h3>
              <div className="relative">
                {/* 左側時間軸線 */}
                <div className="absolute left-[-20px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-500 to-gray-400"></div>

                <div className="space-y-1">
                  {Object.entries(groupedPastEvents).map(([year, months]) => (
                    <div key={year}>
                      {Object.entries(months).map(([month, events]) => (
                        <div key={month}>
                          {events.map((event) => (
                            <TimelineItem
                              key={event.id}
                              event={event}
                              onDelete={deleteEvent}
                              onEdit={editEvent}
                              isCompact={true}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 右側：當前和未來事件 */}
          <div className="flex-1">
            <div className="relative">
              {/* 右側時間軸線 */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-accent-500 via-primary-500 to-blue-500"></div>

              {/* 事件列表 */}
              <div className="space-y-2">
                {Object.entries(groupedCurrentAndFutureEvents).map(
                  ([year, months]) => (
                    <div key={year} className="mb-4">
                      <h4 className="text-sm font-semibold text-primary-400 mb-2 ml-8">
                        {year}
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(months).map(([month, events]) => (
                          <div key={month} className="mb-2">
                            <h5 className="text-xs font-medium text-primary-300 mb-1 ml-8">
                              {month}
                            </h5>
                            <div className="space-y-1">
                              {events.map((event) => (
                                <TimelineItem
                                  key={event.id}
                                  event={event}
                                  onDelete={deleteEvent}
                                  onEdit={editEvent}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-400">設置</h2>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditingTemplateId(null);
                    }}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* 帳號設置 */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-300 mb-4 flex items-center gap-2">
                    <span>👤</span>
                    帳號
                  </h3>

                  <div className="bg-dark-700 p-4 rounded-lg">
                    {/* 登入狀態 */}
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-300 mb-3">
                        登入狀態
                      </h4>
                      {user ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || "用戶"}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                                <span className="text-gray-400 text-lg">
                                  👤
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="text-gray-200 font-medium">
                                {user.displayName || user.email}
                              </div>
                              <div className="text-sm text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={signOut}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <span>🚪</span>
                            登出
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="text-gray-400">未登入</div>
                          <button
                            onClick={signIn}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <span>🔑</span>
                            使用 Google 登入
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 同步狀態 */}
                    {user && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-300 mb-3">
                          資料同步
                        </h4>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isOnline ? "bg-green-400" : "bg-red-400"
                              }`}
                            ></div>
                            <div>
                              <div className="text-gray-200">
                                {isOnline ? "線上" : "離線"}
                              </div>
                              <div className="text-sm text-gray-400">
                                {lastSyncTime
                                  ? `最後同步: ${new Date(
                                      lastSyncTime
                                    ).toLocaleString("zh-TW", {
                                      year: "numeric",
                                      month: "2-digit",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}`
                                  : "尚未同步"}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={async () => {
                              if (isSyncing || syncDisabled) return;
                              if (!user) {
                                alert("請先登入後再進行同步");
                                return;
                              }
                              setIsSyncing(true);
                              try {
                                const displaySettings = {
                                  timelineFutureCount: timelineFutureCount,
                                };
                                await Promise.all([
                                  syncEvents(events),
                                  syncTemplates(presetTemplates),
                                  syncDisplaySettings(displaySettings),
                                ]);
                                // 更新最後同步時間
                                setLastSyncTime(new Date().toISOString());
                                setSyncSuccess(true);
                              } catch (error) {
                                console.error("同步失敗:", error);
                                alert("同步失敗，請檢查網路連接或稍後再試");
                              } finally {
                                setIsSyncing(false);
                              }
                            }}
                            disabled={!isOnline || isSyncing || syncDisabled}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                              syncSuccess
                                ? "bg-green-600 text-white"
                                : isOnline && !isSyncing && !syncDisabled
                                ? "bg-blue-600 hover:bg-blue-700 text-white"
                                : "bg-gray-600 text-gray-400 cursor-not-allowed"
                            }`}
                          >
                            <span className={isSyncing ? "animate-spin" : ""}>
                              {syncSuccess ? "✅" : "🔄"}
                            </span>
                            {syncSuccess
                              ? "已同步至最新！"
                              : isSyncing
                              ? "同步中..."
                              : syncDisabled
                              ? "已同步至最新！"
                              : "立即同步"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 自訂模板管理 */}
                <PresetTemplateManager
                  templates={presetTemplates}
                  onChange={setPresetTemplates}
                  timelineFutureCount={timelineFutureCount}
                  setTimelineFutureCount={setTimelineFutureCount}
                  editingTemplateId={editingTemplateId}
                  onEditingTemplateIdChange={setEditingTemplateId}
                />

                {/* 添加事件表單 */}
                <AddEventForm
                  onAddEvent={addEvent}
                  editingEvent={editingEvent}
                  onUpdateEvent={updateEvent}
                  onCancelEdit={cancelEdit}
                />
              </div>
            </div>
          </div>
        )}

        {/* Commits Modal */}
        {showCommits && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-primary-400 flex items-center gap-2">
                    <span>📝</span>
                    最近提交
                  </h2>
                  <button
                    onClick={() => setShowCommits(false)}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  {commits.length > 0 ? (
                    commits.map((commit, index) => (
                      <div
                        key={commit.sha}
                        className="p-4 bg-dark-700 rounded-lg border border-gray-600"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono bg-gray-800 px-2 py-1 rounded">
                              {commit.sha}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(commit.date).toLocaleString("zh-TW", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="text-xs text-gray-500">
                              by {commit.author}
                            </span>
                          </div>
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-xs"
                          >
                            查看 →
                          </a>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          {commit.message}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-8">
                      正在載入更新記錄...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 右下角信息區域 */}
        <div className="fixed bottom-4 right-4 flex flex-col gap-2">
          {/* Commit 信息按鈕 */}
          <button
            onClick={() => setShowCommits(true)}
            className="text-xs text-gray-400 bg-dark-800 px-2 py-1 rounded border border-gray-600 hover:text-gray-300 hover:border-gray-500 transition-colors"
            title="查看最近更新"
          >
            📝 最近提交
          </button>

          {/* 版本顯示 */}
          <div className="text-xs text-gray-500 bg-dark-800 px-2 py-1 rounded border border-gray-600 flex justify-center">
            v{appVersion}
          </div>
        </div>
      </div>
    </div>
  );
}
