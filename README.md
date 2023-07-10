# Search App

Version: 0.0.3

The Search App is a simple web application that allows users to search for information on the web using the Bing search engine. It provides search results along with the content of the web pages matching the search query. The app is built using Next.js, TypeScript, and React.

## Installation

To install the Search App, follow these steps:
1. Make sure you have Node.js and npm installed on your machine.
2. Clone the project repository from GitHub.
3. Open a terminal and navigate to the project directory.
4. Run `npm install` to install the project dependencies.
5. Run `npm run dev` to start the development server.

## Output Examples

### Console Output

When running the app, you will see output in the console from the `pages/api/search.ts` file. Here are examples of the output:

```javascript
console.log(resultsbing);
// Output: [
//   {
//     title: "Example Title 1",
//     description: "Example Description 1",
//     link: "https://example.com/1"
//   },
//   {
//     title: "Example Title 2",
//     description: "Example Description 2",
//     link: "https://example.com/2"
//   },
//   ...
// ]

console.log(pages);
// Output: [
//   {
//     page_1: "Example page content 1"
//   },
//   {
//     page_2: "Example page content 2"
//   },
//   ...
// ]
```

These outputs represent the search results obtained from the Bing search engine and the content of the corresponding web pages.

### Web Page Output

When using the Search App on the web page, you will see search results displayed along with an input field for entering the search query. Here is an example of how the output appears on the web page:

```html
<main class="flex min-h-screen flex-col items-center justify-between p-24">
  <div>
    <h1 class="text-3xl font-bold text-gray-900">
      <span class="text-gray-900">Search</span>
    </h1>
    <input
      class="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-black"
      value="example search query"
    />
  </div>

  <div class="flex justify-center">
    <button
      class="bg-black text-white font-bold py-2 px-4 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
    >
      Bing
    </button>
  </div>

  <div>
    <pre>
      {
        // Here goes the search results as a JSON object
      }
    </pre>
  </div>
</main>
```

This represents the main UI of the Search App, including the search input field and the Bing search button. The search results are displayed as a JSON object within the `<pre>` element.

Please note that the appearance of the web page output might vary depending on the CSS styles applied to the Search App.


* This is currently a simple version of a parser for the Bing search engine, but in the future, it will also include image search, news search, shopping items, and much more!
