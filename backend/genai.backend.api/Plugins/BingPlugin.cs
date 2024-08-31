using Microsoft.SemanticKernel;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net;
using static System.Net.WebRequestMethods;
using Newtonsoft.Json;

namespace genai.backend.api.Plugins
{
    public class BingPlugin
    {
        private readonly IConfiguration config;
        public BingPlugin()
        {
            config = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json")
            .Build();
        }


        [KernelFunction("web_search")]
        [Description("Searches the web for a given query and returns the results")]
        [return: Description("The result of the search")]
        public async Task<string> GetResultsAsync([Description("Search Query")] string query)
        {
            string subscriptionKey = config["Bing:Key"];
            string endpoint = config["Bing:Endpoint"];

            if (string.IsNullOrEmpty(subscriptionKey) || string.IsNullOrEmpty(endpoint))
            {
                return "Bing Search configuration is missing or invalid.";
            }

            try
            {
                // Construct the URI of the search request
                var uriQuery = $"{endpoint}?q={Uri.EscapeDataString(query)}";

                // Perform the Web request and get the response
                WebRequest request = HttpWebRequest.Create(uriQuery);
                request.Headers["Ocp-Apim-Subscription-Key"] = subscriptionKey;

                using (HttpWebResponse response = (HttpWebResponse)await request.GetResponseAsync())
                {
                    if (response.StatusCode != HttpStatusCode.OK)
                    {
                        return $"Bing Search failed with status code: {response.StatusCode}";
                    }

                    using (var streamReader = new System.IO.StreamReader(response.GetResponseStream()))
                    {
                        string json = await streamReader.ReadToEndAsync();
                        Console.WriteLine("Bing Search Used");
                        Rootobject parsedJson = JsonConvert.DeserializeObject<Rootobject>(json);

                        if (parsedJson?.webPages?.value == null)
                        {
                            return "No search results found.";
                        }

                        // Extract snippets from main results
                        var mainSnippets = parsedJson.webPages.value.Select(item => item.snippet);

                        // Safely extract snippets from deep links if they exist
                        var deepLinkSnippets = parsedJson.webPages.value
                            .Where(item => item.deepLinks != null)
                            .SelectMany(item => item.deepLinks)
                            .Select(dl => $"{dl.name}: {dl.snippet}");

                        string[] result = mainSnippets.Concat(deepLinkSnippets).ToArray();
                        string formattedResult = JsonConvert.SerializeObject(result);

                        return formattedResult;
                    }
                }
            }
            catch (WebException webEx)
            {
                // Handle WebException (e.g., network errors, invalid response, etc.)
                using (var streamReader = new System.IO.StreamReader(webEx.Response.GetResponseStream()))
                {
                    string errorResponse = await streamReader.ReadToEndAsync();
                    return $"WebException occurred: {webEx.Message}. Response: {errorResponse}";
                }
            }
            catch (Exception ex)
            {
                // Handle general exceptions
                return $"An error occurred: {ex.Message}";
            }
        }


        public class Rootobject
        {
            public string _type { get; set; }
            public Querycontext queryContext { get; set; }
            public Webpages webPages { get; set; }
            public Relatedsearches relatedSearches { get; set; }
            public Rankingresponse rankingResponse { get; set; }
        }

        public class Querycontext
        {
            public string originalQuery { get; set; }
        }

        public class Webpages
        {
            public string webSearchUrl { get; set; }
            public int totalEstimatedMatches { get; set; }
            public Value[] value { get; set; }
        }

        public class Value
        {
            public string id { get; set; }
            public string name { get; set; }
            public string url { get; set; }
            public bool isFamilyFriendly { get; set; }
            public string displayUrl { get; set; }
            public string snippet { get; set; }
            public Deeplink[] deepLinks { get; set; }
            public DateTime dateLastCrawled { get; set; }
            public string cachedPageUrl { get; set; }
            public string language { get; set; }
            public bool isNavigational { get; set; }
            public bool noCache { get; set; }
            public string siteName { get; set; }
            public string thumbnailUrl { get; set; }
            public DateTime datePublished { get; set; }
            public string datePublishedFreshnessText { get; set; }
            public Primaryimageofpage primaryImageOfPage { get; set; }
        }

        public class Primaryimageofpage
        {
            public string thumbnailUrl { get; set; }
            public int width { get; set; }
            public int height { get; set; }
            public int sourceWidth { get; set; }
            public int sourceHeight { get; set; }
            public string imageId { get; set; }
        }

        public class Deeplink
        {
            public string name { get; set; }
            public string url { get; set; }
            public string snippet { get; set; }
        }

        public class Relatedsearches
        {
            public string id { get; set; }
            public Value1[] value { get; set; }
        }

        public class Value1
        {
            public string text { get; set; }
            public string displayText { get; set; }
            public string webSearchUrl { get; set; }
        }

        public class Rankingresponse
        {
            public Mainline mainline { get; set; }
        }

        public class Mainline
        {
            public Item[] items { get; set; }
        }

        public class Item
        {
            public string answerType { get; set; }
            public int resultIndex { get; set; }
            public Value2 value { get; set; }
        }

        public class Value2
        {
            public string id { get; set; }
        }


    }

}

