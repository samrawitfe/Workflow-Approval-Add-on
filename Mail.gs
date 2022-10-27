var ADDON_TITLE = "Google form Workflow Approval";
function sendReauthorizationRequest() {
  var documentProperties = PropertiesService.getDocumentProperties();
  var authInfo = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
  var emailAddress = documentProperties.getProperty('creatorEmail');
  var subject = "Authorization needed";
  var message = HtmlService.createHtmlOutputFromFile('reauthorizationMail');
  
  MailApp.sendEmail(emailAddress,
          form.getTitle() + subject,
          message.getContent(), {
            name: ADDON_TITLE,
            htmlBody: message.getContent()});
 
}
function sendApprovalEmail(address)
{
  var form = FormApp.getActiveForm();
  var documentProperties = PropertiesService.getDocumentProperties();
  var responses = JSON.parse(documentProperties.getProperty('responses'));
  var questions = JSON.parse(documentProperties.getProperty('questions'));
  var responseName = documentProperties.getProperty('responseName');
  

  try{
    
      var emailAddress = address;
      var subject = "Approval needed";
      var template = HtmlService.createTemplateFromFile('approvalMail');
      template.responseName = form.getTitle();
      template.responses = responses;
      template.questions = questions;
      var message = template.evaluate();

      
      MailApp.sendEmail(emailAddress,
              subject,
              message.getContent(), {
                name: ADDON_TITLE,
                htmlBody: message.getContent()});

      }catch(e){
        Logger.log("can't send mail "+ e);
      }
}

function sendNotification(address){
  var form = FormApp.getActiveForm();
  var documentProperties = PropertiesService.getDocumentProperties();
  var responses = JSON.parse(documentProperties.getProperty('responses'));
  var questions = JSON.parse(documentProperties.getProperty('questions'));

  try{
      var emailAddress = address;
      var subject = "Google form workflow Approval Notification ";
      var template = HtmlService.createTemplateFromFile('notifyMail');
      template.responseName = form.getTitle();
      template.header = ' Google form workflow approval is set to run to send mail when a form is submitted.';
      template.responses = responses;
      template.questions = questions;
      var message = template.evaluate();
      
      MailApp.sendEmail(emailAddress,
              subject,
              message.getContent(), {
                name: ADDON_TITLE,
                htmlBody: message.getContent()});

      }catch(e){
        Logger.log("can't send mail "+ e);
      }
}
