public with sharing class UserSession {
    @AuraEnabled
    public static String getSessionId() {
        if(Test.isRunningTest()) {
            return 'TEST_SESSION_ID';
        }

        return Page.UserSession.getContent().toString().trim();
    }
}
