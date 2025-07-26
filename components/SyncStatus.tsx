"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Cloud, CloudOff, CheckCircle, AlertCircle } from "lucide-react";

interface SyncStatusProps {
  lastSyncTime?: string;
  isOnline?: boolean;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  lastSyncTime,
  isOnline = true,
}) => {
  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");

  useEffect(() => {
    if (syncStatus === "success") {
      const timer = setTimeout(() => {
        setSyncStatus("idle");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus]);

  if (!user) {
    return null;
  }

  const getStatusIcon = () => {
    if (!isOnline) {
      return <CloudOff size={14} className="text-red-400" />;
    }

    switch (syncStatus) {
      case "syncing":
        return <Cloud size={14} className="text-blue-400 animate-pulse" />;
      case "success":
        return <CheckCircle size={14} className="text-green-400" />;
      case "error":
        return <AlertCircle size={14} className="text-red-400" />;
      default:
        return <Cloud size={14} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) {
      return "离线";
    }

    switch (syncStatus) {
      case "syncing":
        return "同步中...";
      case "success":
        return "已同步";
      case "error":
        return "同步失敗";
      default:
        return lastSyncTime ? "已同步" : "未同步";
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <div className="bg-dark-800 px-2 py-1 rounded border border-gray-600 flex items-center gap-1">
        {getStatusIcon()}
        <span className="text-xs text-gray-400">{getStatusText()}</span>
        {lastSyncTime && syncStatus === "idle" && (
          <span className="text-xs text-gray-500 ml-1">
            {new Date(lastSyncTime).toLocaleTimeString("zh-TW", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
};

export default SyncStatus;
