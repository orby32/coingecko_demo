"use client";

type FooterProps = {
  description: string;
  lastUpdated: string;
};

export function Footer({ description, lastUpdated }: FooterProps) {
  return (
    <div className="text-center text-sm text-gray-600 py-8 border-t">
      <p>{description}</p>
      <p className="mt-1 text-xs text-gray-400">Last updated: {lastUpdated}</p>
    </div>
  );
}
