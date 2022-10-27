
function onOpen(e){
  openSidebar();
}

function onInstall(e){
  onOpen(e);
}

function showHome(){
  var ui = HtmlService.createTemplateFromFile('Home')
  .evaluate()
  .setTitle('Workflow Approval')
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  FormApp.getUi().showSidebar(ui);
 
}
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .getContent();
}

function showAbout(){
  var ui = HtmlService.createHtmlOutputFromFile('about')
  .setWidth(420)
  .setHeight(270);
  FormApp.getUi().showModalDialog(ui, 'About Workflow Approval');
  
}

function showConfiguration() {
   var ui = HtmlService.createTemplateFromFile('configuration')
  .evaluate()
  .setTitle('Workflow Approval')
  .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  FormApp.getUi().showSidebar(ui);
}

function openSidebar() {
  var propertiesService = PropertiesService.getScriptProperties();
  propertiesService.setProperty("sidebar", "open");
  FormApp.getUi()
  .createAddonMenu()
  .addItem('Home','showHome')
  .addItem('About','showAbout')
  .addItem('Configuration','showConfiguration')
  .addToUi();
}

function closeSidebar() {
  var propertiesService = PropertiesService.getScriptProperties();
  if (propertiesService.getProperty("sidebar") == "open") {
    var html = HtmlService.createHtmlOutput("<script>google.script.host.close();</script>");
    FormApp.getUi().showSidebar(html);
    propertiesService.setProperty("sidebar", "close");
  }
}

function getUserName(){
  email = Session.getActiveUser().getEmail();
  var result = AdminDirectory.Users.get(email, {fields:'name'});
  var fullname = result.name.fullName;
  Logger.log(fullname + " user");
  return fullname;
  
}










