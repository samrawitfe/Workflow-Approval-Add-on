var documentProperties = PropertiesService.getDocumentProperties();
//Setup properties
function workflow(receipents,keyNameArray){
  var noOfapprovers = receipents.pop();
  var notifyRespondentChanges = receipents.pop();
  var workflowLevel = receipents.pop();
  var notifyRespondent = receipents.pop();
  var notifyMe = receipents.pop();
  var creator = Session.getActiveUser().getEmail();
  

  var properties = {
    creatorEmail : creator, 
    notifyMe : notifyMe, 
    notifyRespondent : notifyRespondent,
    workflowlevel : workflowLevel,
    notifyRespondentChanges, notifyRespondentChanges,
    noOfapprovers : noOfapprovers
    };

  var propertiesOfApproval = {};

  for(var i = 0; i < receipents.length; i++){
    var keyName = keyNameArray[i];
    propertiesOfApproval[keyName] = receipents[i];
  }
  documentProperties.deleteAllProperties();
  documentProperties.setProperties(properties);
  documentProperties.setProperties(propertiesOfApproval);

  triggerSetup();
}

function triggerSetup()
{
  var form = FormApp.getActiveForm();
  form.setCollectEmail(true);
  form.setDescription('Description of form')
     .setConfirmationMessage('Thanks for responding!')
     .setAllowResponseEdits(true)
     .setAcceptingResponses(true);

  setupDestination();
  var triggers = ScriptApp.getUserTriggers(form);
  var existingTrigger = null;
   
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getEventType() == ScriptApp.EventType.ON_FORM_SUBMIT) {
      existingTrigger = triggers[i];
        try {
          ScriptApp.deleteTrigger(existingTrigger);
      
      }catch(e){
        Logger.log("can't delete trigger " + e);
      }
      
    }
  }
  setApprovalProcess();
  try{
     ScriptApp.newTrigger('setTrigger')
        .forForm(form)
        .onFormSubmit()
        .create();
        
  }catch(e){
    Logger.log("can't create trigger " + e);
  }
}
function authorization(){
  Logger.log("deleted trigger");
}
function setApprovalProcess(){
  var documentProperties = PropertiesService.getDocumentProperties();
      
    var requestsSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/13BydN8SC0i55ShJkSEV1GUkhogWYMGKJXcR4W0s7C6w/edit#gid=0";
    
    
    
    var timeStamp = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
    var spreadSheet = SpreadsheetApp.openByUrl(requestsSpreadsheetUrl);
    var approvalProcessSheet = spreadSheet.getSheetByName('approval process');
    var idInt = approvalProcessSheet.getRange(approvalProcessSheet.getLastRow(),2).getValue();

    idInt = +idInt;
    idInt += 1;
    id = idInt.toString();
    if(approvalProcessSheet.getLastRow() == 1){
      id = 1;
    }
    documentProperties.setProperty('id',id);
    
    var workflowType = documentProperties.getProperty('workflowlevel');
    var workflowLevel = 'single';
    if(workflowType.toLocaleLowerCase() == 'true'){
      workflowLevel = 'multi';
    }
    
    var requestor = documentProperties.getProperty('creatorEmail');
    var respondent = Session.getActiveUser().getEmail();
    var responseUrlLink = documentProperties.getProperty('responseLink');
    var responseRow = documentProperties.getProperty('responseRow');
    var responseName = documentProperties.getProperty('responseName');
    var notifyRespondentChange = documentProperties.getProperty("notifyRespondentChanges");
    var noOfApprovers = documentProperties.getProperty("noOfapprovers");
    var approversArray = [];
    var privilegeArray = [];
    var notify = notifyResult();

    //get approvers list
  for(var i = 1; i <= noOfApprovers; i++){
      var approver = 'approver_' + i;
      var privilege = 'privilege_' + i;
      approversArray.push(documentProperties.getProperty(approver));
      privilegeArray.push(documentProperties.getProperty(privilege));
    }

  var approvalProcessArray = [];
  approvalProcessArray.push(timeStamp,id,responseUrlLink,responseName,requestor,respondent,notify,workflowLevel,notifyRespondentChange);
  approversArray.unshift(timeStamp,id);
  privilegeArray.unshift(timeStamp,id);

  writeToSpreadsheet(approvalProcessArray,requestsSpreadsheetUrl,'approval process');
  writeToSpreadsheet(approversArray,requestsSpreadsheetUrl,'approvers');
  writeToSpreadsheet(privilegeArray,requestsSpreadsheetUrl,'privileges of approvers');
  
  
  }
  
//get all data and setup a trigger 
//write all data to spreadsheet
function setTrigger(e) {
  var documentProperties = PropertiesService.getDocumentProperties();

  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);

  if (authInfo.getAuthorizationStatus() ==
      ScriptApp.AuthorizationStatus.REQUIRED) {
    sendReauthorizationRequest();
  } 
  else {

    // Get response data and save to properties
    var timeStamp = Utilities.formatDate(new Date(), "GMT", "yyyy-MM-dd'T'HH:mm:ss'Z'");
    var requestsSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/13BydN8SC0i55ShJkSEV1GUkhogWYMGKJXcR4W0s7C6w/edit#gid=0";
   
    var id = documentProperties.getProperty('id');
    var spreadSheet = SpreadsheetApp.openByUrl(requestsSpreadsheetUrl);
    var approversArray = [];
    var privilegeArray = [];
    var approversSheet = spreadSheet.getSheetByName('approvers'); 
    var privilegeSheet = spreadSheet.getSheetByName('privileges of approvers'); 

    var approvers = approversSheet.getDataRange().getValues();
    for(var i = 0; i < approvers.length; i++){
      if(approvers[i][1] == id){
        var approversArray = approvers[i];
      }
    }

    var privileges = privilegeSheet.getDataRange().getValues();
    for(var i = 0; i < privileges.length; i++){
      if(privileges[i][1] == id){
        var privilegeArray = privileges[i];
    }
    } 
    
    var workflowLevelProp = documentProperties.getProperty('workflowlevel');
    var statusArray = [];
    var responseDataVal = [];
    responseDataVal = responseData();

    var respondent = responseDataVal.pop();
    var responseSheet = responseDataVal.pop();
    var responseUrl = responseDataVal.pop();
    var responseArray = responseDataVal.pop();
    var statusRow = setStatusRow(requestsSpreadsheetUrl,'status');
    
    
     
    documentProperties.setProperty('responses',JSON.stringify(responseArray));
    responseArray.unshift(timeStamp,id,'no','','',statusRow,respondent);
    var noOfApprovers = documentProperties.getProperty("noOfapprovers");
   
  if(workflowLevelProp.toLocaleLowerCase() == "true"){  
    workflowType = "multi";
    for(var i = 2; i < noOfApprovers + 2; i++){
      if(privilegeArray[i].localeCompare('Can Approve') == 0){
       
        sendApprovalEmail(approversArray[i]);
        statusArray.push('pending');
        break;
      }
      else {
        sendNotification(approversArray[i]);
        statusArray.push('notified');
      }
    } 
  }    
  else{
    workflowType = "single";
    for(var i = 2; i < noOfApprovers + 2; i++){
      if(privilegeArray[i].localeCompare('Can Approve') == 0){
        sendApprovalEmail(approversArray[i]);
        statusArray.push('pending');
      }
      else {
        sendNotification(approversArray[i]);
        statusArray.push('notified');
      }
    } 
  }
    var len = approversArray.length;
    while(len--){
      if(approversArray[i] == ''){
        approversArray.splice(i, 1);
      }
    }
  var difference = (approversArray.length - 2)- statusArray.length;
  if(difference != 0){
    for(var i = 0; i < difference; i++){
      statusArray.push('pending');
    }
  }
  let responseSpreadSheet = SpreadsheetApp.openByUrl(responseUrl);
  let responseRow = responseSpreadSheet.getSheetByName(responseSheet).getLastRow();
  statusArray.unshift(timeStamp,id,responseRow + 1);
  
  
  writeToSpreadsheet(statusArray,requestsSpreadsheetUrl,'status');
  writeToSpreadsheet(responseArray,responseUrl,responseSheet);
  }
}
function notifyResult()
{
  var documentProperties = PropertiesService.getDocumentProperties();
  var notify = 'none';
    if(documentProperties.getProperty('notifyMe').toLocaleLowerCase() == "true"){
      if(documentProperties.getProperty('notifyRespondent').toLocaleLowerCase() == "true"){
        notify = "both";
      }
      else{
        notify = "requestor";
      }
    }
    else if(documentProperties.getProperty('notifyRespondent').toLocaleLowerCase() == "true"){
      notify = "respondent";
    }
    else{
      notify = "none";
    }

    return notify;

}
function writeToSpreadsheet(data,url,sheetName){
  try{
    
    var spreadSheet = SpreadsheetApp.openByUrl(url);
    var workingSpreadSheet = spreadSheet.getSheetByName(sheetName);
    
    if(workingSpreadSheet != null){
      workingSpreadSheet.appendRow(data);
    }
  }
  catch(e){
      Logger.log(e);
  } 
}
function setStatusRow(url,sheetName){
  var documentProperties = PropertiesService.getDocumentProperties();
  var spreadSheet = SpreadsheetApp.openByUrl(url);
  var workingSheet = spreadSheet.getSheetByName(sheetName);

  var status = workingSheet.getLastRow()+1;

  documentProperties.setProperty('statusRow',status);
  return status;
  

}



function setupDestination(){
  var form = FormApp.getActiveForm();
  var responseSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/14BrPIfwtRGXLVaewPaZlekpK9yYeKP-_mpqbBMkh7w4/edit#gid=0";
  var documentProperties = PropertiesService.getDocumentProperties();
  var spreadSheet = SpreadsheetApp.openByUrl(responseSpreadsheetUrl); 

  var formName = DriveApp.getFileById(form.getId()).getName();
  var formQuestions = form.getItems();
  var questions = [];

  for(var i = 0; i < formQuestions.length; i++){
       questions.push(formQuestions[i].getTitle());
    }   

  var workingSpreadSheet = spreadSheet.getSheetByName(formName +' responses');
  questions.unshift('timestamp','id','modification','old response path', 'line','Status row','Respondent');
  if(workingSpreadSheet == null){
    workingSpreadSheet = spreadSheet.insertSheet();
    workingSpreadSheet.setName(formName + ' responses');
    workingSpreadSheet.appendRow(questions);
  }
  
  documentProperties.setProperty('questions',JSON.stringify(questions.slice(5))); 
if(typeof workingSpreadSheet != 'undefined'){
  
documentProperties.setProperty('responseLink',responseSpreadsheetUrl);
documentProperties.setProperty('responseRow',workingSpreadSheet.getLastRow()+1);
documentProperties.setProperty('responseName',workingSpreadSheet.getSheetName());

}

}

function responseData(){
  var documentProperties = PropertiesService.getDocumentProperties();
  var sheetName = documentProperties.getProperty('responseName');
  var url = documentProperties.getProperty('responseLink');
  var formResponses = FormApp.getActiveForm().getResponses();
  var formResponse = formResponses[formResponses.length-1];
  var itemResponses = formResponse.getItemResponses();
  var responseArray = [];
  for (var j = 0; j < itemResponses.length; j++) {
    responseArray.push(itemResponses[j].getResponse());
  }



  var respondent = formResponses[formResponses.length - 1].getRespondentEmail();
  var responseDataResponse = [];
  responseDataResponse.push(responseArray,url,sheetName, respondent) ;
  
  return responseDataResponse;
}




