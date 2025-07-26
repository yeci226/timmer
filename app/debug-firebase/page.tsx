"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { getDoc, doc } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

export default function DebugFirebase() {
  const { user, signIn, signOut } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const checkFirebaseConfig = () => {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const missingKeys = Object.entries(config)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    return {
      config,
      missingKeys,
      isValid: missingKeys.length === 0,
    };
  };

  const testFirestoreConnection = async () => {
    setIsLoading(true);
    try {
      // 測試讀取操作
      const testDoc = await getDoc(doc(db, "test", "connection-test"));
      return { success: true, message: "Firestore 連接正常" };
    } catch (error) {
      return {
        success: false,
        message: "Firestore 連接失敗",
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      setIsLoading(false);
    }
  };

  const testAuthConnection = async () => {
    try {
      // 測試認證狀態
      const currentUser = auth.currentUser;
      return {
        success: true,
        message: "認證連接正常",
        currentUser: currentUser ? currentUser.email : "未登入",
      };
    } catch (error) {
      return {
        success: false,
        message: "認證連接失敗",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  };

  useEffect(() => {
    const runDebugChecks = async () => {
      const configCheck = checkFirebaseConfig();
      const firestoreTest = await testFirestoreConnection();
      const authTest = await testAuthConnection();

      setDebugInfo({
        configCheck,
        firestoreTest,
        authTest,
        timestamp: new Date().toISOString(),
      });
    };

    runDebugChecks();
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary-400 mb-8">
          Firebase 調試工具
        </h1>

        <div className="space-y-6">
          {/* 配置檢查 */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              🔧 Firebase 配置檢查
            </h2>
            <div className="space-y-2">
              {debugInfo.configCheck && (
                <>
                  <div
                    className={`text-sm ${
                      debugInfo.configCheck.isValid
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {debugInfo.configCheck.isValid
                      ? "✅ 配置完整"
                      : "❌ 配置不完整"}
                  </div>
                  {debugInfo.configCheck.missingKeys.length > 0 && (
                    <div className="text-red-400 text-sm">
                      缺失的環境變數:{" "}
                      {debugInfo.configCheck.missingKeys.join(", ")}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    <pre className="bg-dark-700 p-2 rounded">
                      {JSON.stringify(debugInfo.configCheck.config, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Firestore 連接測試 */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              🔥 Firestore 連接測試
            </h2>
            <div className="space-y-2">
              {debugInfo.firestoreTest && (
                <div
                  className={`text-sm ${
                    debugInfo.firestoreTest.success
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {debugInfo.firestoreTest.success ? "✅" : "❌"}{" "}
                  {debugInfo.firestoreTest.message}
                  {debugInfo.firestoreTest.error && (
                    <div className="text-red-400 text-xs mt-1">
                      錯誤: {debugInfo.firestoreTest.error}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={async () => {
                  const result = await testFirestoreConnection();
                  setDebugInfo((prev: any) => ({
                    ...prev,
                    firestoreTest: result,
                  }));
                }}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {isLoading ? "測試中..." : "重新測試 Firestore"}
              </button>
            </div>
          </div>

          {/* 認證連接測試 */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              🔐 認證連接測試
            </h2>
            <div className="space-y-2">
              {debugInfo.authTest && (
                <div
                  className={`text-sm ${
                    debugInfo.authTest.success
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {debugInfo.authTest.success ? "✅" : "❌"}{" "}
                  {debugInfo.authTest.message}
                  {debugInfo.authTest.currentUser && (
                    <div className="text-gray-400 text-xs mt-1">
                      當前用戶: {debugInfo.authTest.currentUser}
                    </div>
                  )}
                  {debugInfo.authTest.error && (
                    <div className="text-red-400 text-xs mt-1">
                      錯誤: {debugInfo.authTest.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 用戶狀態 */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              👤 用戶狀態
            </h2>
            <div className="space-y-2">
              {user ? (
                <div className="text-green-400">✅ 已登入: {user.email}</div>
              ) : (
                <div className="text-gray-400">❌ 未登入</div>
              )}
              <div className="space-x-2">
                {user ? (
                  <button
                    onClick={signOut}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    登出
                  </button>
                ) : (
                  <button
                    onClick={signIn}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    登入
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 調試信息 */}
          <div className="bg-dark-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-300 mb-4">
              📊 完整調試信息
            </h2>
            <div className="text-xs text-gray-400">
              <pre className="bg-dark-700 p-4 rounded overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
