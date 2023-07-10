import { NextApiRequest, NextApiResponse } from "next";
const cheerio = require("cheerio");

/**
 * An interface representing the structure of a topic.
 */
interface Topic {
  title: string; // The title of the topic
  description: string; // The description of the topic
  link: string; // The link to the topic
}

/**
 * An interface representing the content of a page.
 */
interface PageContent {
  [key: string]: string; // The key-value mapping of page content
}

/**
 * Removes HTML and CSS tags from the given text.
 *
 * @param text - The text to remove HTML and CSS tags from
 * @returns The text with HTML and CSS tags removed
 */
function removeHTMLandCSS(text: string): string {
  // Regex patterns to match HTML tags, CSS code, script tags, class and id attributes,
  // HTML entities, line breaks, and remaining HTML tags
  const htmlTagsRegex = /<[^>]*>/g;
  const cssRegex = /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi;
  const scriptRegex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  const classAndIdRegex = /\s*(class|id)="[^"]*"/g;
  const htmlEntitiesRegex = /&[^;]*;/g;
  const lineBreakRegex = /<br\s*\/?>/gi;
  const remainingTagsRegex = /<[^>]+>/g;

  // Remove HTML tags, CSS code, script tags, class and id attributes,
  // HTML entities, line breaks, and remaining HTML tags from the text
  text = text.replace(htmlTagsRegex, "");
  text = text.replace(cssRegex, "");
  text = text.replace(scriptRegex, "");
  text = text.replace(classAndIdRegex, "");
  text = text.replace(htmlEntitiesRegex, "");
  text = text.replace(lineBreakRegex, " ");
  text = text.replace(remainingTagsRegex, "");
  text = text.replace(/\n\s*\n/g, "\n"); // Remove multiple new lines

  return text;
}

/**
 * Retrieves search results and page contents from Bing for the given query.
 *
 * @param query - The search query
 * @returns A promise that resolves to an object containing search results and page contents
 */
async function GetResults(
  query: string
): Promise<{ results: Topic[]; pages: PageContent[] }> {
  console.clear();
  const mainUrl = `https://www.bing.com/search?q=${query}`;

  const res1 = await fetch(mainUrl);
  let html1 = await res1.text();
  const titleRegex = /<h2><a href="([^"]+)"[^>]+>(.*?)<\/a><\/h2>/g;
  const descriptionRegex = /<p[^>]*>(.*?)<\/p>/g;
  let resultsbing: Topic[] = [];
  let match;

  // Extract titles, descriptions, and links from the HTML and populate the resultsbing array
  while ((match = titleRegex.exec(html1)) !== null) {
    const [, link, title] = match;
    const descriptionMatch = descriptionRegex.exec(html1);
    let description = descriptionMatch ? descriptionMatch[1] : "";
    description = description.trim();
    description = removeHTMLandCSS(description);
    resultsbing.push({
      title,
      description,
      link,
    });
  }
  console.log(resultsbing);

  let pages: PageContent[] = [];

  // Fetch page contents for the first 3 search results and store them in the pages array
  for (let i = 0; i < 3; i++) {
    const pageContent = await fetchPageContent(resultsbing[i].link);
    const pageObj: PageContent = {};
    pageObj[`page_${i + 1}`] = pageContent;
    pages.push(pageObj);
  }
  console.log(pages);
  if (resultsbing.length > 10 && pages.length > 10) {
    return {
      results: resultsbing,
      pages: pages,
    };
  } else {
    let error: any = "not found results";
    return error;
  }
}

/**
 * Fetches the content of a web page from the given URL.
 *
 * @param url - The URL of the web page
 * @returns A promise that resolves to the content of the web page
 */
let removeDuplicates = 1;
async function fetchPageContent(url: string): Promise<string> {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  // Remove script and style tags from the HTML
  $("script").remove();
  $("style").remove();

  // Get the text content of the body element
  let content = $("body").text();

  // Remove extra white spaces
  content = content.replace(/\s\s+/g, " ");

  if (removeDuplicates) {
    content = removeDuplicateStrings(content);
  }

  // Find the longest text paragraph
  let longestText = "";
  const paragraphs = content.split("\n");
  for (const paragraph of paragraphs) {
    if (paragraph.length > longestText.length && paragraph.length <= 2000) {
      longestText = paragraph;
    }
  }

  return longestText;
}

/**
 * Removes duplicate strings from the input string.
 *
 * @param input - The input string
 * @returns The string with duplicate sentences removed
 */
function removeDuplicateStrings(input: string): string {
  const sentences = input.split(". ");
  const uniqueSentences = Array.from(new Set(sentences));
  return uniqueSentences.join(". ");
}

/**
 * Request handler function for the API endpoint.
 *
 * @param req - The HTTP request
 * @param res - The HTTP response
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { querys } = req.body;
  const results = await GetResults(querys);
  res.status(200).json({ results });
};

export default handler;
