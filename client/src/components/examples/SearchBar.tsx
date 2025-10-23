import { useState } from 'react';
import SearchBar from '../SearchBar';

export default function SearchBarExample() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState(['Vanilla', 'Chocolate']);

  return (
    <div className="p-8 bg-background">
      <div className="max-w-3xl">
        <SearchBar
          onSearch={setQuery}
          filters={filters}
          onFilterRemove={(filter) => setFilters(filters.filter(f => f !== filter))}
          onClearAll={() => setFilters([])}
        />
        {query && (
          <p className="mt-4 text-sm text-muted-foreground">Searching for: {query}</p>
        )}
      </div>
    </div>
  );
}
