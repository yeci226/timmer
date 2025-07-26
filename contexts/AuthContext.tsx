"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import {
  auth,
  signInWithGoogle,
  signOutUser,
  onAuthStateChange,
  saveTimelineEvents,
  getTimelineEvents,
  savePresetTemplates,
  getPresetTemplates,
  saveDisplaySettings,
  getDisplaySettings,
} from "@/lib/firebase";
import { TimelineEvent, PresetTemplate } from "@/types/timeline";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  syncEvents: (events: TimelineEvent[]) => Promise<void>;
  syncTemplates: (templates: PresetTemplate[]) => Promise<void>;
  syncDisplaySettings: (settings: any) => Promise<void>;
  loadUserData: () => Promise<{
    events: TimelineEvent[];
    templates: PresetTemplate[];
    displaySettings: any;
  }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {
    console.log("⏳ 等待 Firebase 初始化...");
    // 等待 Firebase 初始化
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (auth) {
      await signInWithGoogle();
    } else {
      throw new Error("Firebase 未初始化");
    }
  },
  signOut: async () => {
    if (auth) {
      await signOutUser();
    } else {
      throw new Error("Firebase 未初始化");
    }
  },
  syncEvents: async () => {
    throw new Error("Firebase 未初始化");
  },
  syncTemplates: async () => {
    throw new Error("Firebase 未初始化");
  },
  syncDisplaySettings: async () => {
    throw new Error("Firebase 未初始化");
  },
  loadUserData: async () => ({
    events: [],
    templates: [],
    displaySettings: {},
  }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("🔧 AuthProvider 開始初始化...");

    // 延遲檢查 Firebase 初始化，確保模組已完全載入
    const checkAuth = () => {
      console.log("🔧 檢查 Firebase 狀態:", {
        window: typeof window !== "undefined",
        auth: !!auth,
        authType: typeof auth,
      });

      if (typeof window !== "undefined" && auth) {
        console.log("🔄 開始檢查認證狀態...");
        const unsubscribe = onAuthStateChange((user) => {
          console.log("👤 認證狀態更新:", user ? "已登入" : "未登入");
          setUser(user);
          setLoading(false);
        });

        return unsubscribe;
      } else {
        console.log("⚠️ Firebase 未初始化，等待重試...");
        return null;
      }
    };

    // 延遲檢查，確保 Firebase 完全初始化
    const initialTimer = setTimeout(() => {
      let unsubscribe = checkAuth();

      // 如果第一次檢查失敗，延遲再試一次
      if (!unsubscribe && typeof window !== "undefined") {
        const retryTimer = setTimeout(() => {
          console.log("🔄 重試檢查認證狀態...");
          unsubscribe = checkAuth();

          // 如果還是失敗，再試一次
          if (!unsubscribe) {
            const retryTimer2 = setTimeout(() => {
              console.log("🔄 第二次重試檢查認證狀態...");
              unsubscribe = checkAuth();

              // 如果還是失敗，設置載入為 false
              if (!unsubscribe) {
                console.log("⚠️ 無法初始化 Firebase，設置載入為 false");
                setLoading(false);
              }
            }, 200);

            return () => {
              clearTimeout(retryTimer2);
              if (unsubscribe) unsubscribe();
            };
          }
        }, 100);

        return () => {
          clearTimeout(retryTimer);
          if (unsubscribe) unsubscribe();
        };
      }

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }, 50); // 延遲 50ms 確保 Firebase 初始化

    return () => {
      clearTimeout(initialTimer);
    };
  }, []);

  // 在客戶端渲染之前，返回一個簡單的載入狀態
  if (!mounted) {
    return (
      <AuthContext.Provider
        value={{
          user: null,
          loading: true,
          signIn: async () => {
            console.log("⏳ 等待 Firebase 初始化...");
            // 等待 Firebase 初始化
            await new Promise((resolve) => setTimeout(resolve, 100));
            if (auth) {
              await signInWithGoogle();
            } else {
              throw new Error("Firebase 未初始化");
            }
          },
          signOut: async () => {
            throw new Error("Firebase 未初始化");
          },
          syncEvents: async () => {
            throw new Error("Firebase 未初始化");
          },
          syncTemplates: async () => {
            throw new Error("Firebase 未初始化");
          },
          syncDisplaySettings: async () => {
            throw new Error("Firebase 未初始化");
          },
          loadUserData: async () => ({
            events: [],
            templates: [],
            displaySettings: {},
          }),
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("登入失敗:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error("登出失敗:", error);
      throw error;
    }
  };

  const syncEvents = async (events: TimelineEvent[]) => {
    if (!user) {
      throw new Error("用戶未登入");
    }

    try {
      await saveTimelineEvents(user.uid, events);
      console.log("時間軸事件已同步到雲端");
    } catch (error) {
      console.error("同步時間軸事件失敗:", error);
      throw error;
    }
  };

  const syncTemplates = async (templates: PresetTemplate[]) => {
    if (!user) {
      throw new Error("用戶未登入");
    }

    try {
      await savePresetTemplates(user.uid, templates);
      console.log("預設模板已同步到雲端");
    } catch (error) {
      console.error("同步預設模板失敗:", error);
      throw error;
    }
  };

  const syncDisplaySettings = async (settings: any) => {
    if (!user) {
      throw new Error("用戶未登入");
    }

    try {
      console.log("🔄 開始同步顯示設定到雲端:", settings);
      await saveDisplaySettings(user.uid, settings);
      console.log("✅ 顯示設定已成功同步到雲端");
    } catch (error) {
      console.error("❌ 同步顯示設定失敗:", error);
      throw error;
    }
  };

  const loadUserData = async () => {
    if (!user) {
      return { events: [], templates: [], displaySettings: {} };
    }

    try {
      const [events, templates, displaySettings] = await Promise.all([
        getTimelineEvents(user.uid),
        getPresetTemplates(user.uid),
        getDisplaySettings(user.uid),
      ]);

      console.log("從雲端載入用戶資料成功", {
        eventsCount: events.length,
        templatesCount: templates.length,
        hasDisplaySettings: Object.keys(displaySettings).length > 0,
      });

      return { events, templates, displaySettings };
    } catch (error) {
      console.error("載入用戶資料失敗:", error);
      return { events: [], templates: [], displaySettings: {} };
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    syncEvents,
    syncTemplates,
    syncDisplaySettings,
    loadUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
