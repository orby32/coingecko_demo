"use client";

export function EmptyState({ searchTerm }: { searchTerm: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      No cryptocurrencies found matching &quot;{searchTerm}&quot;
    </div>
  );
}
