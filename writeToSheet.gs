function writeToSheet(dataToWrite, sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (dataToWrite) {
    sheet.getRange(1, 1, dataToWrite.length, dataToWrite[0].length).setValues(dataToWrite);
  } else {
    console.error("Error getting data to write");
  }
}
