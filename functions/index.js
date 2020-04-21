const functions = require('firebase-functions');
const admin = require('firebase-admin');
const iap = require('in-app-purchase');
let serviceAccount = require("./google/api-test.json");
const ZS_PACKAGE_NAME = 'zs.test.app';
const ZS_COLLECTION_IAP = 'zs_iap';

admin.initializeApp(functions.config().firebase);

iap.config({
    /* Configurations for Amazon Store */
    amazonAPIVersion: 2, // tells the module to use API version 2
    secret: '<amazon_secret>', // this comes from Amazon
    // amazonValidationHost: http://localhost:8080/RVSSandbox, // Local sandbox URL for testing amazon sandbox receipts.
 
    /* Configurations for Apple */
    appleExcludeOldTransactions: true, // if you want to exclude old transaction, set this to true. Default is false
    applePassword: '<apple_password>', // this comes from iTunes Connect (You need this to valiate subscriptions)
 
    /* Configurations for Google Service Account validation: You can validate with just packageName, productId, and purchaseToken */
    googleServiceAccount: {
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key
    },
 
    /* Optional Configurations for Google Play IAP subscriptions*/
    googleAccToken: '<google_access_token>', 
    googleRefToken: '<google_ref_token>',
    googleClientID: '<google_client_id>', 
    googleClientSecret: '<google_client_secret>', 
 
    /* Configurations for Roku */
    rokuApiKey: '<roku_api_key>', // this comes from Roku Developer Dashboard
 
    /* Configurations all platforms */
    test: true, // For Apple and Googl Play to force Sandbox validation only
    verbose: true // Output debug logs to stdout stream
});

function validateResponse(validatedData, transactionId) {
    var options = {
        ignoreCanceled: true, // Apple ONLY (for now...): purchaseData will NOT contain cancceled items
        ignoreExpired: true // purchaseData will NOT contain exipired subscription items
    };
    // validatedData contains sandbox: true/false for Apple and Amazon
    var purchaseData = iap.getPurchaseData(validatedData, options);
    if(purchaseData === null || purchaseData.length === 0) {
        return Promise.reject(new Error("Invalid Receipt"));
    }

    let purchasedItem = purchaseData[0];
    if (purchasedItem.cancellationDate) {
        return Promise.reject(new Error("Item is Canelled"));
    }
    if(purchasedItem.bundleId !== ZS_PACKAGE_NAME && purchasedItem.packageName !== ZS_PACKAGE_NAME) {
        return Promise.reject(new Error("Invalid Receipt"));
    }
    if(purchasedItem.transactionId !== transactionId) {
        return Promise.reject(new Error("Invalid TransactionId"));
    } 
    
    return Promise.resolve();
}

function checkTranscationId(transactionId) {
    return new Promise((resolve, reject) => {
        admin.firestore()
        .collection(ZS_COLLECTION_IAP)
        .doc(transactionId)
        .get()
        .then(doc => {
            if (doc.exists) {
                reject(new Error("Duplicate Transaction"));
            }
            else {
                resolve();
            }
            return Promise.resolve();
        })
        .catch((error) => {
            reject(error)
        });
    });
}

function saveTransactionId(transactionId) {
    admin.firestore()
    .collection(ZS_COLLECTION_IAP)
    .doc(transactionId)
    .set({"exist": true});

    return Promise.resolve();
}

function validateRequest(body) {
    let serviceType;
    switch(body.type) {
        case "google":
            serviceType = iap.GOOGLE;
            break;
        case "apple":
            serviceType = iap.APPLE
            break;
        default:
            return Promise.reject(new Error("Invalid Request"));
    }

    return iap.setup()
    .then(() => iap.validate(serviceType, body.receipt));
}

exports.verifyInappPurchase = functions.https.onRequest((request, response)  => {
    let transactionId = request.body.transactionId;
    checkTranscationId(transactionId)
    .then(() => saveTransactionId(transactionId))
    .then(() => validateRequest(request.body))
    .then((validatedData) => validateResponse(validatedData, transactionId))
    .then(() => response.send("Verified"))
    .catch((error) => response.status(400).send(error.message));
});