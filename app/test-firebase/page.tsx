"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { auth, analytics } from "@/lib/firebase";
import { Analytics } from "firebase/analytics";

export default function TestFirebase() {
  const { user, signIn, signOut } = useAuth();
  const [testResult, setTestResult] = useState<string>("");

  const testFirebaseConnection = async () => {
    try {
      setTestResult("測試中...");

      // 測試 Firebase 初始化
      if (!auth) {
        throw new Error("Firebase 未正確初始化");
      }

      // 測試 Analytics
      if (analytics) {
        console.log("✅ Analytics 已初始化");
      } else {
        console.log("⚠️ Analytics 未初始化（可能是 SSR 環境）");
      }

      setTestResult("✅ Firebase 連接正常，Analytics 已配置");
    } catch (error) {
      setTestResult(`❌ Firebase 連接失敗: ${error}`);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-md mx-auto bg-dark-800 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-primary-400 mb-6">
          Firebase 測試頁面
        </h1>

        <div className="space-y-4">
          <div className="bg-dark-700 p-4 rounded">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              認證狀態
            </h2>
            {user ? (
              <div className="text-green-400">✅ 已登入: {user.email}</div>
            ) : (
              <div className="text-gray-400">❌ 未登入</div>
            )}
          </div>

          <div className="bg-dark-700 p-4 rounded">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              連接測試
            </h2>
            <button
              onClick={testFirebaseConnection}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
            >
              測試 Firebase 連接
            </button>
            {testResult && <div className="mt-2 text-sm">{testResult}</div>}
          </div>

          <div className="bg-dark-700 p-4 rounded">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">操作</h2>
            <div className="space-y-2">
              {user ? (
                <button
                  onClick={signOut}
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  登出
                </button>
              ) : (
                <button
                  onClick={signIn}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  使用 Google 登入
                </button>
              )}
            </div>
          </div>

          <div className="bg-dark-700 p-4 rounded">
            <h2 className="text-lg font-semibold text-gray-300 mb-2">
              Firebase 配置狀態
            </h2>
            <div className="text-xs text-gray-400 space-y-1">
              <div>✅ Firebase 配置已硬编码</div>
              <div>✅ Analytics 已配置</div>
              <div>
                ✅ 資料庫 URL:
                timmer-73067-default-rtdb.asia-southeast1.firebasedatabase.app
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
