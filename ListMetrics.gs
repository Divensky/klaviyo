function ListMetrics(API_Key) {
   const API_URL = "https://a.klaviyo.com/api";
   const DATA_ENDPOINT = "/v1/metrics";
   const API_KEY = API_Key;
   const response = UrlFetchApp.fetch(API_URL + DATA_ENDPOINT + "?api_key=" + API_KEY);
   const content = JSON.parse(response.getContentText());
   console.log(content);
   const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("KlaviyoMetrics"); // The name of your sheet

   // Create the header row 
   var headerValues = ["ID", "Name"]; // the header row values
   sheet.getRange(1, 1, 1, headerValues.length).setValues([headerValues]); // add the new header row
   
   // Get existing data in sheet
   const dataRange = sheet.getDataRange();
   const values = dataRange.getValues();

   // Loop through Klaviyo data and update sheet
   for (let i = 0; i < content.data.length; i++) {
       const id = content.data[i].id;
       
       // Check if id already exists in sheet
       let existingRowIndex = -1;
       for (let j = 1; j < values.length; j++) { // Start at 1 to skip header row
           if (values[j][0] == id) { // Column 1 contains the id
               existingRowIndex = j + 1; // Add 1 to account for header row
               break;
           }
       }
       
       // If id exists, update other details in same row
       if (existingRowIndex > 0) {
           const rowToUpdate = sheet.getRange(existingRowIndex, 1, 1, 2);
           rowToUpdate.setValues([[id, content.data[i].name]]);
       }
       
       // If id doesn't exist, add new row
       else {
           sheet.appendRow([id, content.data[i].name]);
       }
   }
}