"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

type HeaderProps = {
  title: string;
  subtitle?: string;
  onRefresh: () => void;
  isLoading?: boolean;
};

export function Header({
  title,
  subtitle,
  onRefresh,
  isLoading = false,
}: HeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {title}
        </h1>
        {subtitle ? <p className="text-gray-600 mt-2">{subtitle}</p> : null}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>
    </div>
  );
}
