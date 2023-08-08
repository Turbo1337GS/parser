

## Description

This code is written in TypeScript and is designed to fetch search results, images, and news related to a given query using the Bing search engine. The code is built as a Next.js API route, making it easy to deploy and use. This repository can be hosted on GitHub, and the code can be executed by installing the required dependencies and running the application.

## Installation

To install this code on your local machine, follow these steps:

1. Clone the GitHub repository: `git clone [repository_url]`
2. Navigate to the project directory: `cd [project_directory]`
3. Install the dependencies: `npm install`
4. Start the development server: `npm run dev`

The application will now be running on `localhost:3000/Parse`.

## Code Explanation

The code consists of several interfaces and functions:

### Interfaces

- `Topic` represents a search result with a title, description, and link.
- `News` represents a news article with a title, description, link, and image URL.
- `PageContent` is a dictionary-like object that stores page content for each search result.

### Functions

- `removeHTMLandCSS` is a utility function that removes HTML tags, CSS styles, and other unwanted elements from a given text.
- `getImages` fetches images related to the query from Bing and returns the result as a string.
- `modifyResolution` is a utility function to modify the resolution of image URLs.
- `getNews` fetches news articles related to the query from Bing and returns them as an array of `News` objects.
- `fetchPageContent` fetches the content of a web page given its URL and returns it as a string.
- `GetResults` fetches search results, page content, images, and news related to the query from Bing and returns them as an object.

### API Route

The code exports a default asynchronous handler function that serves as the API route. This function receives a request object (`NextApiRequest`) and a response object (`NextApiResponse`). It expects a `querys` parameter in the request body. If the parameter is missing, it returns a 400 error. Otherwise, it calls the `GetResults` function with the provided query and returns the results as a JSON response.

## Usage

To use this code, send an HTTP POST request to the API route endpoint with the query in the request body. The response will contain the fetched results, including search results, page content, images, and news.

Example request:

```bash
curl -X POST -H "Content-Type: application/json" -d '{"querys":"example query"}' localhost:3000/Parse/api/search
```

Example response:
```json
{
  "results": [
    {
      "title": "Result Title",
      "description": "Result description.",
      "link": "https://example.com"
    },
    ...
  ],
  "pages": [
    {
      "page_1": "Page content for result 1."
    },
    ...
  ],
  "images": [
    "https://example.com/image1.jpg",
    ...
  ],
  "news": [
    {
      "title": "News Title",
      "description": "News description.",
      "link": "https://example.com/news",
      "imageUrl": "https://example.com/news_image.jpg"
    },
    ...
  ]
}
```
