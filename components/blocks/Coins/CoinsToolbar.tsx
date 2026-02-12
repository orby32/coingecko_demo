"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUpDown, Search } from "lucide-react";
import type { SortField, SortOrder } from "@/types/coin";

export interface CoinsToolbarProps {
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;

  onSearchTermChange: (term: string) => void;
  onSortFieldChange: (field: SortField) => void;
  onToggleSortOrder: () => void;
}

export function CoinsToolbar({
  searchTerm,
  sortBy,
  sortOrder,
  onSearchTermChange,
  onSortFieldChange,
  onToggleSortOrder,
}: CoinsToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search by name or symbol..."
          value={searchTerm}
          onChange={(e) => onSearchTermChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex gap-2">
        <Select
          value={sortBy}
          onValueChange={(v) => onSortFieldChange(v as SortField)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rank">Rank</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="change">24h Change</SelectItem>
            <SelectItem value="marketCap">Market Cap</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={onToggleSortOrder}
          aria-label={`Toggle sort order (currently ${sortOrder})`}
          title={`Sort order: ${sortOrder}`}
        >
          <ArrowUpDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
