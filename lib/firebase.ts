import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// Firebase 配置
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 檢查 Firebase 配置
const missingConfigs = [];
if (!firebaseConfig.apiKey) missingConfigs.push("NEXT_PUBLIC_FIREBASE_API_KEY");
if (!firebaseConfig.authDomain)
  missingConfigs.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
if (!firebaseConfig.databaseURL)
  missingConfigs.push("NEXT_PUBLIC_FIREBASE_DATABASE_URL");
if (!firebaseConfig.projectId)
  missingConfigs.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
if (!firebaseConfig.storageBucket)
  missingConfigs.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
if (!firebaseConfig.messagingSenderId)
  missingConfigs.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
if (!firebaseConfig.appId) missingConfigs.push("NEXT_PUBLIC_FIREBASE_APP_ID");
if (!firebaseConfig.measurementId)
  missingConfigs.push("NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID");

if (missingConfigs.length > 0) {
  console.error("❌ Firebase 配置缺失:", missingConfigs);
  console.error("請在專案根目錄建立 .env.local 檔案並添加以下內容：");
  console.error(`
NEXT_PUBLIC_FIREBASE_API_KEY=你的API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=你的AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL=你的DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID=你的PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=你的STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=你的MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=你的APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=你的MEASUREMENT_ID
  `);
  throw new Error(`Firebase 配置缺失: ${missingConfigs.join(", ")}`);
}

console.log("✅ Firebase 配置已加載");

// 初始化 Firebase（僅在客戶端）
let app: any = null;
let auth: any = null;
let db: any = null;
let analytics: any = null;

if (typeof window !== "undefined") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // 初始化 Analytics
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn("Analytics 初始化失敗:", error);
    }

    console.log("✅ Firebase 已成功初始化");
    console.log("🔧 Firebase 組件狀態:", {
      app: !!app,
      auth: !!auth,
      db: !!db,
    });
  } catch (error) {
    console.error("❌ Firebase 初始化失敗:", error);
  }
}

export { auth, db, analytics };

// Analytics 工具函数
export const logEvent = (
  eventName: string,
  parameters?: Record<string, any>
) => {
  if (analytics && typeof window !== "undefined") {
    try {
      // 這裡可以添加具體的 Analytics 事件記錄
      console.log(`📊 Analytics Event: ${eventName}`, parameters);
    } catch (error) {
      console.warn("Analytics 事件記錄失敗:", error);
    }
  }
};

// Google 登入提供者
const googleProvider = new GoogleAuthProvider();

// 登入函數
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("登入失敗:", error);
    throw error;
  }
};

// 登出函数
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("登出失敗:", error);
    throw error;
  }
};

// 監聽認證狀態變化
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// 保存用戶數據到 Firestore
export const saveUserData = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("保存用戶數據失敗:", error);
    throw error;
  }
};

// 獲取用戶數據
export const getUserData = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("獲取用戶數據失敗:", error);
    throw error;
  }
};

// 保存時間軸事件
export const saveTimelineEvents = async (userId: string, events: any[]) => {
  try {
    console.log(
      `🔄 開始保存時間軸事件，用戶ID: ${userId}，事件數量: ${events.length}`
    );

    if (!userId) {
      throw new Error("用戶ID不能為空");
    }

    const userRef = doc(db, "users", userId);
    const dataToSave = {
      timelineEvents: events,
      updatedAt: new Date().toISOString(),
    };

    console.log("📝 準備保存的數據:", dataToSave);

    await setDoc(userRef, dataToSave, { merge: true });
    console.log("✅ 時間軸事件已成功保存到 Firestore");
  } catch (error) {
    console.error("❌ 保存時間軸事件失敗:", error);
    console.error("錯誤詳情:", {
      userId,
      eventsCount: events.length,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode:
        error instanceof Error && "code" in error
          ? (error as any).code
          : undefined,
    });
    throw error;
  }
};

// 獲取時間軸事件
export const getTimelineEvents = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const events = data.timelineEvents || [];
      console.log(`📊 從雲端獲取到 ${events.length} 個時間軸事件`);
      return events;
    } else {
      console.log("📊 用戶文檔不存在，返回空事件列表");
      return [];
    }
  } catch (error) {
    console.error("獲取時間軸事件失敗:", error);
    throw error;
  }
};

// 保存預設模板
export const savePresetTemplates = async (userId: string, templates: any[]) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        presetTemplates: templates,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("預設模板已保存到 Firestore");
  } catch (error) {
    console.error("保存預設模板失敗:", error);
    throw error;
  }
};

// 獲取預設模板
export const getPresetTemplates = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const templates = data.presetTemplates || [];
      console.log(`📊 從雲端獲取到 ${templates.length} 個預設模板`);
      return templates;
    } else {
      console.log("📊 用戶文檔不存在，返回空模板列表");
      return [];
    }
  } catch (error) {
    console.error("獲取預設模板失敗:", error);
    throw error;
  }
};

// 保存顯示設定
export const saveDisplaySettings = async (userId: string, settings: any) => {
  try {
    console.log("📝 準備保存顯示設定:", settings);
    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        displaySettings: settings,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    console.log("✅ 顯示設定已成功保存到 Firestore");
  } catch (error) {
    console.error("❌ 保存顯示設定失敗:", error);
    console.error("錯誤詳情:", {
      userId,
      settings,
      errorMessage: error instanceof Error ? error.message : String(error),
      errorCode:
        error instanceof Error && "code" in error
          ? (error as any).code
          : undefined,
    });
    throw error;
  }
};

// 獲取顯示設定
export const getDisplaySettings = async (userId: string) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      const settings = data.displaySettings || {};
      console.log(`📊 從雲端獲取到顯示設定:`, settings);
      return settings;
    } else {
      console.log("📊 用戶文檔不存在，返回空顯示設定");
      return {};
    }
  } catch (error) {
    console.error("獲取顯示設定失敗:", error);
    throw error;
  }
};
