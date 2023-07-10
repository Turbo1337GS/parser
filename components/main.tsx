import { useState, useEffect, useCallback } from "react";

export function MainMenu() {
  const [results, setResults] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [ui, setUi] = useState<number>(1);
  const [platform, setPlatform] = useState<number>(2);

  const handleButtonClick = useCallback(
    async (platform: number) => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ platform, querys: searchQuery }),
      });
      const data = await res.json();
      setResults(data.results);
    },
    [searchQuery]
  );

  useEffect(() => {
    const url = new URL(window.location.href);
    const query = url.searchParams.get("q");

    if (query) {
      setSearchQuery(query);
    }

    if (ui === 0) {
      handleButtonClick(platform);
    } else {
      url.searchParams.set("q", searchQuery);
      window.history.replaceState(null, "", url.toString());
    }
  }, [searchQuery, ui, platform, handleButtonClick]);

  return ui === 1 ? (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          <span className="text-gray-900">Search</span>
        </h1>
        <input
          className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="flex justify-center">
        <button
          className="bg-black text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
          onClick={() => handleButtonClick(2)}
        >
          Bing
        </button>
      </div>
      {results && (
        <div>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </main>
  ) : (
    <pre>
      {
        <div>
          <pre>{JSON.stringify(results, null, 2)}</pre>
        </div>
      }
    </pre>
  );
}
