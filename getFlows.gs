// 1A - Retrieve from Klaviyo a list of all Flows (name and ID) for a time period set by the user. Let the user configure the API_KEY:
function getFlows(API_KEY, startDate, endDate) {
  var headers = {'Authorization': 'Klaviyo-API-Key ' + API_KEY,
                  'Content-Type': 'application/json',
                  'Revision': '2023-05-25'};

  var options = {
    'method' : 'get',
    'headers': headers,
    'muteHttpExceptions': true
  };

  var url = "https://a.klaviyo.com/api/flows/?page[size]=40&sort=created";
  var campaigns = [];
  var retries = 0;
  var delay = 1000; // initial delay of 1 second
  
  //Fetching the data page by page until there are no more pages and builiding up "campaigns" array.
  while (url) {
    var response = UrlFetchApp.fetch(url, options);
    console.log(typeof response);
  
    if (response.getResponseCode() === 429 || response.getResponseCode() === 503) {
      // Rate limit reached or Server busy
      var retryAfter = response.getHeaders()["Retry-After"];
      if (retryAfter) {
        Utilities.sleep(retryAfter * 1000);
      } else {
        // Retry after a delay using exponential backoff
        Utilities.sleep(delay);
        delay *= 2; // double the delay for the next retry
      }
      retries++;
      if (retries > 5) {
        // Max retries reached, log an error and exit
        console.log("Error fetching the data: " + response.getResponseCode());
        return;
      }
      continue;
    }

    if (response.getResponseCode() === 200) {
    var data = JSON.parse(response.getContentText());
      campaigns = campaigns.concat(data.data);
      console.log(typeof campaigns + ' at ' + url);
      console.log(data.links, data.links.next)
      
      if (data.links && data.links.next) {
        url = data.links.next;
      } else {
        url = null;
      }

    } else {
    console.error(`Error: ${response.getResponseCode()} - ${response.getContentText()}`);
    return null;
   }
  }

  // Now we have an array `campaigns` that contains all the flows 
  //TODO: rename variable to 'flows' or create a sub-function 
  // We loop through this array to extract the data on each flow
  var campaignData = campaigns.map(campaign => [campaign.attributes.name, campaign.id, campaign.attributes.created]);
  console.log(campaignData);
  return campaignData;

}