# InApp Billing Verification Handler
InApp Purchase and Subscription for Apple, Google Play, Amazon Store, Roku, and Windows Verification Handler in Firebase Functions using popular node in-app-purchase module https://github.com/voltrue2/in-app-purchase

## Resources Required
* Firebase Functions - https://firebase.google.com/docs/functions
* Firebase Firestore - https://firebase.google.com/docs/firestore

## Setup Guide
### Setup for Android
To set up purchase verification, follow these steps. 
1. Log in to the [Google API console](https://console.developers.google.com/) with your credentials
2. Under Select a project find your app's project
3. Select your organization, application, then OPEN
4. Select API Credentials > Credentials > Create credentials
5. From the drop-down menu, select Service account key
6. Select an existing service account or create a new one
7. Select JSON as your Key type
8. Select Project > Viewer as your Role from the drop-down menu 
9. Select Create

Now, a JSON key will be downloaded to your computer. Next, follow these steps to complete the setup. 
1. Go to the [Google Play Store](https://play.google.com/apps/publish/) and log in
2. Select Settings 
3. Select Developer account > API access
4. Find your application project and select LINK
5. Under Service Accounts, on the relevant email address, select GRANT ACCESS
6. In the Add a new user dialogue, select Finance from the Role drop-down menu
    * If you want this user to have global access, select ADD USER
    * If you want this user to have access only to one app, select Add an app, then ADD USER
7. Navigate to Developer account > Users & permissions to view information on your users and access permissions

Great job! Purchase verification is now active for Android.

### Setup for iOS
Nothing Special Need to be Done For iOS.

### Setup Other Platforms
Refer https://github.com/voltrue2/in-app-purchase for other platform setup

## Integration Guide
### Integration Google IAP
1. Copy Base64 public key string from the Developer Console account for your application in file _./functions/google/iap-live_ and _./functions/google/iap-sandbox_
2. replace _./functions/google/api-test.json_ with you private key (created in the setup process)
3. Open _./function/index.js_ and replace 
  
    ``` let serviceAccount = require("./google/api-test.json"); ```
  
    with
  
    ``` let serviceAccount = require("./google/<your_private_key_name>.json"); ```

### Integration Google Subscription
provide following credentails that you have acquired in setup process
  * googleAccToken
  * googleRefToken
  * googleClientID
  * googleClientSecret

### Integration iOS IAP
Nothing Special Need to be Done For iOS.

### Integration iOS Subscription
provide following credentails that you have acquired in setup process
  * applePassword (this comes from [iTunes Connect](https://itunesconnect.apple.com/))

### Integration Other Platforms
Refer https://github.com/voltrue2/in-app-purchase for other platform setup

## Project Setup
You have two option here
1. Setup a new Firebase Project and replace functions folder content
2. Project Firebase Application Id in _.firebaserc_ json under _'default'_ key

### That is it! Deploy on Firebase Function
## Happy Coding