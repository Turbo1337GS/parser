import { useState, useEffect, useCallback } from "react";

interface SearchResponse {
  results: string;
}

export function MainMenu() {
  const [results, setResults] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const query = url.searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (searchQuery) {
      url.searchParams.set("q", searchQuery);
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url.toString());
  }, [searchQuery]);

  const handleButtonClick = useCallback(async () => {
    const res = await fetch("Parse/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ platform: 2, querys: searchQuery }),
    });
    const data: SearchResponse = await res.json();
    setResults(data.results);
  }, [searchQuery]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-3xl font-bold text-gray-300">Search</h1>
        <input
          className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-black text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter your search query..."
        />
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-black text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
          onClick={handleButtonClick}
        >
          Search with Bing
        </button>
      </div>

      {results && (
        <div className="mt-4 bg-gray-900 text-white p-4 rounded-md w-full">
          <h2 className="text-xl mb-2">Results:</h2>
          <pre className="whitespace-pre overflow-x-auto break-all bg-gray-800 p-2 rounded-md">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </main>
  );
}
