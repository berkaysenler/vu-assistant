"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

interface SearchResult {
  id: string;
  chatId: string;
  text: string;
  sender: string;
  createdAt: string;
  chat: {
    id: string;
    name: string;
  };
}

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectResult: (chatId: string) => void;
}

export default function SearchDialog({
  open,
  onOpenChange,
  onSelectResult,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/chats/search?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Failed to search chats");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSelectResult = (chatId: string) => {
    onSelectResult(chatId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search Chats</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Search for messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="max-h-[400px] overflow-y-auto space-y-2">
            {results.length > 0 ? (
              results.map((result) => (
                <div
                  key={result.id}
                  className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectResult(result.chat.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{result.chat.name}</p>
                      <p className="text-gray-700 mt-1">
                        {result.sender === "user" ? "You: " : "AI: "}
                        {result.text.length > 100
                          ? `${result.text.substring(0, 100)}...`
                          : result.text}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(result.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : loading ? (
              <div className="text-center py-4">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="text-gray-500 mt-2">Searching...</p>
              </div>
            ) : (
              searchQuery && (
                <p className="text-center py-4 text-gray-500">
                  No results found for "{searchQuery}"
                </p>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
