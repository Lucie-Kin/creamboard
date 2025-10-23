import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  filters?: string[];
  onFilterRemove?: (filter: string) => void;
  onClearAll?: () => void;
}

export default function SearchBar({ 
  placeholder = "Search batch number or product...", 
  onSearch,
  filters = [],
  onFilterRemove,
  onClearAll 
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="sticky top-0 z-10 bg-background border-b pb-4 space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch(e.target.value);
            }}
            className="pl-10"
            data-testid="input-search"
          />
        </div>
        {query && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              setQuery("");
              onSearch("");
            }}
            data-testid="button-clear-search"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </form>

      {filters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {filters.map((filter) => (
            <Badge key={filter} variant="secondary" className="gap-1">
              {filter}
              {onFilterRemove && (
                <button
                  onClick={() => onFilterRemove(filter)}
                  className="ml-1 hover:bg-destructive/20 rounded-full"
                  data-testid={`button-remove-filter-${filter}`}
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </Badge>
          ))}
          {onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              data-testid="button-clear-all-filters"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
