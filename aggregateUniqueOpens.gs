function aggregateUniqueOpens(apiKey, metric_id) {
 let url = 'https://a.klaviyo.com/api/metric-aggregates';
  const headers = {
    accept: 'application/json',
    revision: '2023-02-22',
    'content-type': 'application/json',
    Authorization: 'Klaviyo-API-Key ' + apiKey
  };
  const data = {
    data: {
      type: 'metric-aggregate',
      attributes: {
        metric_id: metric_id,
        measurements: ['unique'],
        interval: 'month',
        page_size: 500, 
        by: ['$message'],
        filter: ['greater-or-equal(datetime,2023-04-01)', 'less-than(datetime,2023-05-31)'],
        timezone: 'UTC',
        sort: '$message'
      }
    }
  };

  const options = {
    method: 'POST',
    headers: headers,
    payload: JSON.stringify(data),
    'muteHttpExceptions': true
  };

  var retries = 0;
  var delay = 1000; // initial delay of 1 second
  var output = [];

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
      const jsonResponse = JSON.parse(response.getContentText());
      console.log(typeof jsonResponse.data);
      console.log('jsonResponse.data: ' + jsonResponse.data);

      output = output.concat(jsonResponse.data);
      console.log(typeof output + ' at ' + url);
      console.log(jsonResponse.links, jsonResponse.links.next)

      if (jsonResponse.links && jsonResponse.links.next) {
        url = jsonResponse.links.next;
      } else {
        url = null;
      }
    } else {
      throw new Error(`Invalid response from Klaviyo API: ${response.getResponseCode()} - ${response.getContentText()}`);
        return null;
    }

  }

  // Now we have an array `output` that contains all the data from all pages
  // We loop through this array to extract the data 
  //Logger.log('output: ' + JSON.stringify(output));
  //outputToSheet(output); - this was the test function to see the output

  // Parse the JSON string in the variable "output"
  //var data = JSON.parse(output); //was done above, wasn't it?

  // Create a new empty array to store the two-dimensional array for the Google Sheet
  var sheetData = [];

  // Loop through each element of the array
  output.forEach(function(element) {
  // Get the array "dates" under "attributes"
    var dates = element.attributes.dates;
    console.log('dates: ' + dates); //TODO: make these dates as header rows, unless we don't need them after all 

    // Get the array "data" under "attributes"
    var dataArray = element.attributes.data;

    // Create a new empty array to store the row names for this element
    var rowNames = [];

    // Create a new empty array to store the row values for this element
    var rowValues = [];

    // For each object in the "dataArray" array
    dataArray.forEach(function(object) {
      // Get the value of "dimensions"
      var dimensions = object.dimensions;
      console.log('dimensions: ' + dimensions); 

      // Push the "dimensions" array to the row names array
      rowNames.push(dimensions);

      // Get the object "measurements"
      var measurements = object.measurements;

      // Get the value of "unique"
      var unique = measurements.unique;
      console.log('unique: ' + unique); 

      // Append the "unique" array to the row values array
      rowValues.push(unique);
    });

  // Push the row names and row values arrays to the sheetData array
  sheetData.push(rowNames.flat(), rowValues.flat());
  });

  console.log('success!') 
  return sheetData;

}