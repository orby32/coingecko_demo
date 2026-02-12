"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Coin, SortField, SortOrder } from "@/types/coin";
import { CoinsToolbar } from "./CoinsToolbar";
import { CoinsTable } from "./CoinsTable";
import { EmptyState } from "./EmptyState";

export interface CoinsSectionProps {
  coins: Coin[];
  searchTerm: string;
  sortBy: SortField;
  sortOrder: SortOrder;

  onSearchTermChange: (term: string) => void;
  onSortFieldChange: (field: SortField) => void;
  onToggleSortOrder: () => void;

  onCoinClick: (coin: Coin) => void;
}

export function CoinsSection({
  coins,
  searchTerm,
  sortBy,
  sortOrder,
  onSearchTermChange,
  onSortFieldChange,
  onToggleSortOrder,
  onCoinClick,
}: CoinsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Cryptocurrencies</CardTitle>
        <CardDescription>
          Browse and search through the top 50 cryptocurrencies
        </CardDescription>
      </CardHeader>

      <CardContent>
        <CoinsToolbar
          searchTerm={searchTerm}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSearchTermChange={onSearchTermChange}
          onSortFieldChange={onSortFieldChange}
          onToggleSortOrder={onToggleSortOrder}
        />

        {coins.length === 0 ? (
          <EmptyState searchTerm={searchTerm} />
        ) : (
          <CoinsTable coins={coins} onCoinClick={onCoinClick} />
        )}
      </CardContent>
    </Card>
  );
}
