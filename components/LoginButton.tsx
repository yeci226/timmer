"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn, LogOut, User } from "lucide-react";

const LoginButton: React.FC = () => {
  const { user, loading, signIn, signOut } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (error) {
      console.error("登入失敗:", error);
      alert("登入失敗，請重試");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("登出失敗:", error);
      alert("登出失敗，請重試");
    }
  };

  if (loading) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-dark-800 px-2 py-1 rounded-lg border border-gray-600">
          <div className="text-xs text-gray-400">載入中...</div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-dark-800 px-2 py-1 rounded-lg border border-gray-600 flex items-center gap-1">
          <div className="flex items-center gap-1">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "用戶"}
                className="w-4 h-4 rounded-full"
              />
            ) : (
              <User
                size={12}
                className="text-gray-400"
                width={12}
                height={12}
              />
            )}
            <span className="text-xs text-gray-300 max-w-20 truncate">
              {user.displayName || user.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
            title="登出"
          >
            <LogOut size={10} width={10} height={10} />
            <span className="hidden sm:inline">登出</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={handleSignIn}
        className="bg-primary-600 hover:bg-primary-700 text-white px-2 py-1 rounded-lg flex items-center gap-1 transition-colors"
        title="使用 Google 登入"
      >
        <LogIn size={12} width={12} height={12} />
        <span className="text-xs">登入</span>
      </button>
    </div>
  );
};

export default LoginButton;
