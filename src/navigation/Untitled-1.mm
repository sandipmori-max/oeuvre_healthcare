------------------------------------
SEND - MESSAGE C#HttpClient
------------------------------------

var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.Post, "https://messagingapi.charteredinfo.com/v19.0/907661512423522/messages");
request.Headers.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3N0SWQiOiIxMDciLCJDbGllbnRJZCI6IjM0ODIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iml0QHN1bnJheS5jby5pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IldhYmEiLCJleHAiOjc3NjY3Mjk3NjAsIm5iZiI6MTc2NjcyOTgyMH0.qirp5kfdDFJZkOC7BTtew5VNOC8zT97sxrjwa8mPnk8");
var content = new StringContent("    {\n        \"messaging_product\": \"whatsapp\",\n        \"recipient_type\": \"individual\",\n        \"to\": \"918154877969\",\n        \"type\": \"template\",\n        \"template\": \n        {\n            \"name\": \"kosol\",\n            \"language\": { \"code\": \"en\" },\n            \"components\": [\n                {\n                    \"type\": \"header\",\n                    \"parameters\": [\n                        {\n                            \"type\": \"document\",\n                            \"document\": { \"id\": \"741460258992989\"},\n                            \"filename\": \"dummy\"\n                        }\n                    ]\n                },\n                {\n                    \"type\": \"body\",\n                    \"parameters\": [\n                        {\n                            \"type\": \"text\",\n                            \"text\": \"50Off\"\n                        },\n                        {\n                            \"type\": \"text\",\n                            \"text\": \"TDS\"\n                        }\n                    ]\n                }\n            ]\n        }\n    }\n", null, "application/json");
request.Content = content;
var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());

------------------------------------
SEND - MESSAGE - C#RestSharp
------------------------------------

var options = new RestClientOptions("https://messagingapi.charteredinfo.com")
{
  MaxTimeout = -1,
};
var client = new RestClient(options);
var request = new RestRequest("/v19.0/907661512423522/messages", Method.Post);
request.AddHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3N0SWQiOiIxMDciLCJDbGllbnRJZCI6IjM0ODIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iml0QHN1bnJheS5jby5pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IldhYmEiLCJleHAiOjc3NjY3Mjk3NjAsIm5iZiI6MTc2NjcyOTgyMH0.qirp5kfdDFJZkOC7BTtew5VNOC8zT97sxrjwa8mPnk8");
request.AddHeader("Content-Type", "application/json");
var body = @"    {" + "\n" +
@"        ""messaging_product"": ""whatsapp""," + "\n" +
@"        ""recipient_type"": ""individual""," + "\n" +
@"        ""to"": ""918154877969""," + "\n" +
@"        ""type"": ""template""," + "\n" +
@"        ""template"": " + "\n" +
@"        {" + "\n" +
@"            ""name"": ""kosol""," + "\n" +
@"            ""language"": { ""code"": ""en"" }," + "\n" +
@"            ""components"": [" + "\n" +
@"                {" + "\n" +
@"                    ""type"": ""header""," + "\n" +
@"                    ""parameters"": [" + "\n" +
@"                        {" + "\n" +
@"                            ""type"": ""document""," + "\n" +
@"                            ""document"": { ""id"": ""741460258992989""}," + "\n" +
@"                            ""filename"": ""dummy""" + "\n" +
@"                        }" + "\n" +
@"                    ]" + "\n" +
@"                }," + "\n" +
@"                {" + "\n" +
@"                    ""type"": ""body""," + "\n" +
@"                    ""parameters"": [" + "\n" +
@"                        {" + "\n" +
@"                            ""type"": ""text""," + "\n" +
@"                            ""text"": ""50Off""" + "\n" +
@"                        }," + "\n" +
@"                        {" + "\n" +
@"                            ""type"": ""text""," + "\n" +
@"                            ""text"": ""TDS""" + "\n" +
@"                        }" + "\n" +
@"                    ]" + "\n" +
@"                }" + "\n" +
@"            ]" + "\n" +
@"        }" + "\n" +
@"    }" + "\n" +
@"";
request.AddStringBody(body, DataFormat.Json);
RestResponse response = await client.ExecuteAsync(request);
Console.WriteLine(response.Content);


------------------------------------------------------
Simple Marketing Template ---- C#HttpClient
------------------------------------------------------


var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.Post, "https://messagingapi.charteredinfo.com/v19.0/907661512423522/messages");
request.Headers.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3N0SWQiOiIxMDciLCJDbGllbnRJZCI6IjM0ODIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iml0QHN1bnJheS5jby5pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IldhYmEiLCJleHAiOjc3NjY3Mjk3NjAsIm5iZiI6MTc2NjcyOTgyMH0.qirp5kfdDFJZkOC7BTtew5VNOC8zT97sxrjwa8mPnk8");
var content = new StringContent("    {\n        \"messaging_product\": \"whatsapp\",\n        \"recipient_type\": \"individual\",\n        \"to\": \"918154877969\",\n        \"type\": \"template\",\n        \"template\": \n        {\n            \"name\": \"16_dec_trans\",\n            \"language\": { \"code\": \"en\" },\n            \"components\": [\n               \n                {\n                    \"type\": \"body\",\n                    \"parameters\": [\n                        {\n                            \"type\": \"text\",\n                            \"text\": \"50Off\"\n                        },\n                        {\n                            \"type\": \"text\",\n                            \"text\": \"TDS\"\n                        }\n                    ]\n                }\n            ]\n        }\n    }\n", null, "application/json");
request.Content = content;
var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());

------------------------------------------------------
Simple Marketing Template ---- C#RestSharp
------------------------------------------------------

var options = new RestClientOptions("https://messagingapi.charteredinfo.com")
{
  MaxTimeout = -1,
};
var client = new RestClient(options);
var request = new RestRequest("/v19.0/907661512423522/messages", Method.Post);
request.AddHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3N0SWQiOiIxMDciLCJDbGllbnRJZCI6IjM0ODIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iml0QHN1bnJheS5jby5pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IldhYmEiLCJleHAiOjc3NjY3Mjk3NjAsIm5iZiI6MTc2NjcyOTgyMH0.qirp5kfdDFJZkOC7BTtew5VNOC8zT97sxrjwa8mPnk8");
request.AddHeader("Content-Type", "application/json");
var body = @"    {" + "\n" +
@"        ""messaging_product"": ""whatsapp""," + "\n" +
@"        ""recipient_type"": ""individual""," + "\n" +
@"        ""to"": ""918154877969""," + "\n" +
@"        ""type"": ""template""," + "\n" +
@"        ""template"": " + "\n" +
@"        {" + "\n" +
@"            ""name"": ""16_dec_trans""," + "\n" +
@"            ""language"": { ""code"": ""en"" }," + "\n" +
@"            ""components"": [" + "\n" +
@"               " + "\n" +
@"                {" + "\n" +
@"                    ""type"": ""body""," + "\n" +
@"                    ""parameters"": [" + "\n" +
@"                        {" + "\n" +
@"                            ""type"": ""text""," + "\n" +
@"                            ""text"": ""50Off""" + "\n" +
@"                        }," + "\n" +
@"                        {" + "\n" +
@"                            ""type"": ""text""," + "\n" +
@"                            ""text"": ""TDS""" + "\n" +
@"                        }" + "\n" +
@"                    ]" + "\n" +
@"                }" + "\n" +
@"            ]" + "\n" +
@"        }" + "\n" +
@"    }" + "\n" +
@"";
request.AddStringBody(body, DataFormat.Json);
RestResponse response = await client.ExecuteAsync(request);
Console.WriteLine(response.Content);

------------------------------------------------------
Upload Documents --- C#HttpClient
------------------------------------------------------

var client = new HttpClient();
var request = new HttpRequestMessage(HttpMethod.Post, "https://messagingapi.charteredinfo.com/v19.0/907661512423522/media");
request.Headers.Add("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3N0SWQiOiIxMDciLCJDbGllbnRJZCI6IjM0ODIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iml0QHN1bnJheS5jby5pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IldhYmEiLCJleHAiOjc3NjY3Mjk3NjAsIm5iZiI6MTc2NjcyOTgyMH0.qirp5kfdDFJZkOC7BTtew5VNOC8zT97sxrjwa8mPnk8");
var content = new MultipartFormDataContent();
content.Add(new StringContent("whatsapp"), "messaging_product");
content.Add(new StringContent("dummy"), "fileName");
content.Add(new StreamContent(File.OpenRead("")), "file", "");
request.Content = content;
var response = await client.SendAsync(request);
response.EnsureSuccessStatusCode();
Console.WriteLine(await response.Content.ReadAsStringAsync());



------------------------------------------------------
Upload Documents --- C#RestSharp
------------------------------------------------------

var options = new RestClientOptions("https://messagingapi.charteredinfo.com")
{
  MaxTimeout = -1,
};
var client = new RestClient(options);
var request = new RestRequest("/v19.0/907661512423522/media", Method.Post);
request.AddHeader("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJIb3N0SWQiOiIxMDciLCJDbGllbnRJZCI6IjM0ODIyIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6Iml0QHN1bnJheS5jby5pbiIsImh0dHA6Ly9zY2hlbWFzLm1pY3Jvc29mdC5jb20vd3MvMjAwOC8wNi9pZGVudGl0eS9jbGFpbXMvcm9sZSI6IldhYmEiLCJleHAiOjc3NjY3Mjk3NjAsIm5iZiI6MTc2NjcyOTgyMH0.qirp5kfdDFJZkOC7BTtew5VNOC8zT97sxrjwa8mPnk8");
request.AlwaysMultipartFormData = true;
request.AddParameter("messaging_product", "whatsapp");
request.AddParameter("fileName", "dummy");
request.AddFile("file", "/path/to/file");
RestResponse response = await client.ExecuteAsync(request);
Console.WriteLine(response.Content);