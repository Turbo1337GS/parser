/**
 * This script implements a search API that retrieves search results, page content, images, and news related to a given query.
 * It uses the Next.js framework and the cheerio library for web scraping.
 */

import { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";

/**
 * The maximum number of results to return for each category.
 */
const MAX_RESULTS_COUNT = 5;
const MAX_IMAGES_COUNT = 5;
const MAX_NEWS_COUNT = 5;

/**
 * Represents a topic with its title, description, and link.
 */
interface Topic {
  title: string;
  description: string;
  link: string;
}

/**
 * Represents a news article with its title, description, link, and image URL.
 */
interface News {
  title: string;
  description: string;
  link: string;
  imageUrl: string;
}

/**
 * Represents the content of a page as key-value pairs.
 */
interface PageContent {
  [key: string]: string;
}

/**
 * Removes HTML tags and CSS styles from a given text.
 * @param text The text to remove HTML and CSS from.
 * @returns The text without HTML tags and CSS styles.
 */
function removeHTMLandCSS(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\s(class|id)="[^"]"/g, "")
    .replace(/&[^;]+;/g, "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/\n\s*\n/g, "\n");
}

/**
 * Retrieves images related to a given query from Bing image search.
 * @param query The query string to search for images.
 * @returns A promise that resolves to a string of image information.
 */
async function getImages(query: string): Promise<string> {
  const imageUrl = `https://www.bing.com/images/search?q=${query}`;
  const res = await fetch(imageUrl);
  const html = await res.text();

  const $ = cheerio.load(html);

  let images: string[] = [];
  let titles: string[] = [];

  $("li").each((index, element) => {
    const imgElement = $(element).find("img.mimg");
    const titleElement = $(element).find("a[title]");

    const imgSrc = imgElement.attr("src");
    const title = titleElement.attr("title");

    if (imgSrc && title && images.length < MAX_IMAGES_COUNT) {
      const modifiedUrl = modifyResolution(imgSrc);
      images.push(modifiedUrl);
      titles.push(title);
    }
  });

  let result = "";
  for (let i = 0; i < images.length; i++) {
    result += `Website: ${titles[i]} - Image: ${images[i]}\n`;
  }

  return result;
}

/**
 * Modifies the resolution of a given image URL.
 * @param url The URL of the image.
 * @returns The modified URL with higher resolution.
 */
function modifyResolution(url: string): string {
  return url
    .replace(/(w=)(\d+)/, (_, prefix, value) => `${prefix}${Number(value) * 3}`)
    .replace(
      /(h=)(\d+)/,
      (_, prefix, value) => `${prefix}${Number(value) * 3}`
    );
}

/**
 * Retrieves news articles related to a given query from Bing news search.
 * @param query The query string to search for news.
 * @returns A promise that resolves to an array of news articles.
 */
async function getNews(query: string): Promise<News[]> {
  const newsUrl = `https://www.bing.com/news/search?q=${query}`;
  const res = await fetch(newsUrl);
  const html = await res.text();

  const $ = cheerio.load(html);
  const newsItems: News[] = [];

  $(".news-card.newsitem.cardcommon").each((index, element) => {
    if (newsItems.length >= MAX_NEWS_COUNT) return;

    const titleElement = $(element).find("a.title");
    const descriptionElement = $(element).find("div.snippet");
    const imageUrlElement = $(element).find("img.rms_img");

    const news: News = {
      title: titleElement.text(),
      description: descriptionElement.attr("title") || "",
      link: titleElement.attr("href") || "",
      imageUrl: imageUrlElement.attr("src") || "",
    };

    newsItems.push(news);
  });

  return newsItems;
}

/**
 * Retrieves search results, page content, images, and news related to a given query from Bing search.
 * @param query The query string to search for.
 * @returns A promise that resolves to an object containing search results, page content, images, and news.
 */
async function GetResults(query: string): Promise<{
  results: Topic[];
  pages: PageContent[];
  images: string[];
  news: News[];
}> {
  const mainUrl = `https://www.bing.com/search?q=${query}`;
  const res1 = await fetch(mainUrl);
  const html1 = await res1.text();
  const titleRegex = /<h2><a href="([^"]+)"[^>]+>(.+?)<\/a><\/h2>/g;
  const descriptionRegex = /<p[^>]+>(.+?)<\/p>/g;
  let resultsbing: Topic[] = [];
  let match;
  let resultCount = 0;

  while (
    (match = titleRegex.exec(html1)) !== null &&
    resultCount < MAX_RESULTS_COUNT
  ) {
    const [, link, title] = match;
    const descriptionMatch = descriptionRegex.exec(html1);
    let description = descriptionMatch ? descriptionMatch[1] : "";
    description = removeHTMLandCSS(description.trim());
    resultsbing.push({
      title,
      description,
      link,
    });
    resultCount++;
  }

  const pageContentPromises: Promise<PageContent>[] = resultsbing.map(
    async (result, i) => {
      const pageContent = await fetchPageContent(result.link);
      return { [`page_${i + 1}`]: pageContent };
    }
  );

  const pages = await Promise.all(pageContentPromises);
  const imagesString = await getImages(query);
  const images = imagesString.split("\n").filter((img) => img);
  const news = await getNews(query);
  return {
    results: resultsbing,
    pages,
    images,
    news,
  };
}

/**
 * Fetches the content of a given URL by making a GET request.
 * @param url The URL of the page to fetch.
 * @returns A promise that resolves to the content of the page.
 */
async function fetchPageContent(url: string): Promise<string> {
  const res = await fetch(url);
  const html = await res.text();
  const $ = cheerio.load(html);

  $("script").remove();
  $("style").remove();

  let content = $("body").text().replace(/\s\s+/g, " ");

  return content.split("\n").reduce((longestText, paragraph) => {
    if (paragraph.length > longestText.length && paragraph.length <= 2000) {
      return paragraph;
    }
    return longestText;
  }, "");
}

/**
 * Handles incoming API requests.
 * @param req The Next.js API request object.
 * @param res The Next.js API response object.
 */
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { querys } = req.body;
  if (!querys) {
    return res.status(400).json({ error: "querys parameter is missing." });
  }

  const results = await GetResults(querys);
  res.status(200).json({ results });
};

export default handler;
