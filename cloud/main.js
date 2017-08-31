/*
 *    Parse Cloud Code
 *
 *    Documentation:
 *    https://www.parse.com/docs/js/guide#cloud-code
 *    This URL will probably change to a github url
 *
 *    FOLDERS:
 *
 *    config
 *    contains a JSON configuration file that you shouldn"t normally need to deal with
 *
 *    cloud
 *    stores your Cloud Code
 *
 *    public
 *    stores any static content that you want to host on the Parse Server
 *
 *    When you are done editing any of these files,
 *    deploy the changes using git/Git Hub/Git Desktop
 */

/*
 *    Barbershop Apps Methods
 *    These are to connect to and use Parse Server
 *
 *
 *    To use Parse Server you need the following:
 *
 *    Application ID
 *    in APP_ID
 *
 *    Database URI
 *    in DATABASE_URI
 *
 *    File Key
 *    in FILE_KEY
 *
 *    Master Key
 *    in MASTER_KEY
 *
 *    Parse Mount Path
 *    PARSE_MOUNT
 *
 *    The Server URL that the app will use
 *    in SERVER_URL
 *
 */

/*
 * Includes
 */
// Constants
const CONST = require("./const.js");
//const FUNCS = require("./funcs.js");

// Helper Functions
var funcs = require("./funcs.js");

// Appointments Related
require("./appointments.js");

// Barbers and Services
require("./barber.js");

// Messages Related
require("./message.js");

// Products and Cart Related
require("./product.js");

// Role and Permissions Related
require("./role.js");

// Sending Texts
require("./twilio.js");

// Users and User Related
require("./user.js");

// Twilio Code
//require("./twilio.js");

//imported from require("twilio.js");

var twilioAccountSid        = process.env.TWILIO_ACCOUNT_SID;
var twilioAccountToken      = process.env.TWILIO_ACCOUNT_TOKEN;
var twilioPort              = process.env.TWILIO_PORT           || 1338;
var twilioURL               = process.env.TWILIO_URL            || "127.0.0.1";
var twilioMount             = process.env.TWILIO_MOUNT          || "/";
var twilioSendingNumber     = process.env.TWILIO_PHONE_NUMBER;

// Prototypes
//
Date.prototype.atMidnight = Date.prototype.atMidnight || function()
{
    var dateMidnight    = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0);
    return dateMidnight;
};

Array.prototype.contains = Array.prototype.contains || function(lookFor)
{
    var index     = 0;
    var length    = this.length;

    for (index = 0; index < length; index += 1)
    {
        if (this[index] == lookFor)
        {
            return true;
        }
    }
    return false;
};

Array.prototype.doesNotContain = Array.prototype.doesNotContain || function(lookFor)
{
    var index     = 0;
    var length    = this.length;

    for (index = 0; index < length; index += 1)
    {
        if (this[index] == lookFor)
        {
            return false;
        }
    }
    return true;
};

//////////////////////////////////////
//
// hello
//
//////////////////////////////////////
Parse.Cloud.define("hello", function(request, response)
{
    var theResult   = "I am not really dreaming of being a website, instead I am dreaming of being the back end to an app... SUCCESS!";

    funcs.conditionalLog(theResult);
    response.success(theResult);
});


///////////////////////////////////////
//
// status
//
///////////////////////////////////////
Parse.Cloud.define("status", function(request, response)
{
    funcs.conditionalLog("status - check by app");

    var theRandom       = funcs.randomNumberWithNumberOfDigits(3);
    var randomText      = theRandom.toString();

    funcs.conditionalLog("status - The random number is " + randomText + "");

    var theRelease      = null;
    var hrv             = process.env.HEROKU_RELEASE_VERSION;

    funcs.conditionalLog("status - release " + hrv);

    if ( ( hrv === undefined ) || ( hrv === null ) )
    {
        theRelease      = "";
    }
    else
    {
        theRelease      = "XQ" + hrv.toUpperCase() + "4" + " " + theRandom.toString();
    }
    var theNickname     = process.env.SERVER_NICKNAME;

    funcs.conditionalLog("status - nickname " + theNickname);

    var theResponse     = "Up, " + theNickname + ", Valid, " + theRelease;

    response.success(theResponse);
});


///////////////////////////////////////
//
// testConstants
//
///////////////////////////////////////
Parse.Cloud.define("testConstants", function(request, response)
{
    funcs.conditionalLog("1");

    try
    {
        var theCreate   = CONST.ACTION_USER_CREATE;

        funcs.conditionalLog("2");

        var theVerify   = CONST.ACTION_USER_VERIFY;

        funcs.conditionalLog("3");

        response.success(theVerify|theCreate);
    }
    catch (e)
    {
        funcs.conditionalLog("4");
        funcs.conditionalLog(e);

        response.error(e);
    }
    finally
    {
        // Nothing here
    }
});

///////////////////////////////////////
//
// incrementNewAppointmentTally
//
///////////////////////////////////////
Parse.Cloud.define("incrementNewAppointmentTally", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    var query = new Parse.Query("GlobalSettings");
    query.equalTo("settingName", "newAppointmentTally");

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var resultObject = results[0];
            var tally = parseInt(resultObject.get("settingValue"));
            tally += 1;

            var tallyString = String.valueOf(tally);
            //resultObject.set("settingValue", tallyString);
            resultObject.save({"settingValue":tallyString});

            response.success(tally);
        },
        error: function(error)
        {
            console.log("query error");
            console.log(error);
            response.error(error);
        }
    });
});


///////////////////////////////////////
//
// getTestDictionary
//
///////////////////////////////////////
Parse.Cloud.define("getTestDictionary", function(request, response)
{
    funcs.conditionalLog("getTestDictionary");

    var theString   = "This is a string";
    var theNumber   = 420;
    var theStringArray = ["A","B","C","D"];
    var theNumberArray = [1,2,3,4,5];
    var trueEh = false;

    funcs.conditionalLog("Just before creating dictionary");

    var theResult = { aString: theString, aNumber: theNumber, anArray: theStringArray, secondArray: theNumberArray, aBool: trueEh };

    funcs.conditionalLog("Just after creating dictionary");

    response.success(theResult);
});


///////////////////////////////////////
//
// getTestArray
//
///////////////////////////////////////
Parse.Cloud.define("getTestArray", function(request, response)
{
    funcs.conditionalLog("getTestArray");

    var theStringArray = ["A","B","C","D"];

    if ( theStringArray.contains("A") )
    {
        theStringArray.add("Found A");
    }
    else
    {
        theStringArray.add("Didn't Find A");
    }
    if ( theStringArray.contains("Z") )
    {
        theStringArray.add("Found Z");
    }
    else
    {
        theStringArray.add("Didn't Find Z");
    }
    funcs.conditionalLog("Just before creating dictionary");

    theStringArray.addUnique("A");
    theStringArray.addUnique("C");

    funcs.conditionalLog("Just after creating array tests");

    response.success(theStringArray);
});


///////////////////////////////////////
//
// convertUsernameToBackToEmail
// Allows the app to convert again
// This should only be necesasary for me testing.
//
///////////////////////////////////////
Parse.Cloud.define("convertUsernameBackToEmail", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // depreciated, add:
    // useMasterKey: true,
    // above your success: lines.

    funcs.conditionalLog("Starting convertUsernameBackToEmail");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;
    var passHash         = request.params.hashed;

    if ( ( emailAddress.length === 0 ) ||
         ( phoneNumber.length === 0  ) ||
         ( passHash.length === 0 ) )
    {
        response.error("missing information");
    }

    funcs.conditionalLog("emailAddress [" + emailAddress + "]");
    funcs.conditionalLog("phoneNumber [" + phoneNumber + "]");

    var query = new Parse.Query(Parse.User);

    query.equalTo("username", phoneNumber);
    query.equalTo("email", emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("find with phone number in username was successful.");
            funcs.conditionalLog(results.length + " records found");

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No records found to convert");
                var theResponse =
                    {
                        description : "No records found to convert"
                    };
                // The above was 'description' : 'No r....ert'
                response.success(theResponse);
            }
            else
            {
                funcs.conditionalLog("convert only first user, remove the remaining");
                // Create New User copying from first
                // lastName, installoids, barberName, isStaffMember, lastSeen, friendsRelation,
                // username, allowsMessages, phoneNumber, language, firstname, password, staffID,
                // email, userRole (pointer)

                var firstUser       = results[0];
                var fuEmailAddress  = firstUser.get("email");
                var fuUserFirstName = firstUser.get("firstName");
                var fuInstalloids   = firstUser.get("installoids");
                var fuUserLastName  = firstUser.get("lastName");
                var fuUserStaffId   = firstUser.get("staffID");
                var fuTheUsername   = firstUser.get("username");

                funcs.conditionalLog("Can update user:");

                funcs.conditionalLog("email:      " + fuEmailAddress);
                funcs.conditionalLog("firstName:  " + fuUserFirstName);
                funcs.conditionalLog("installoids:" + fuInstalloids);
                funcs.conditionalLog("lastName:   " + fuUserLastName);
                funcs.conditionalLog("staffId:    " + fuUserStaffId);
                funcs.conditionalLog("username:   " + fuTheUsername);

                //firstUser.set("verificationCode", random);
                firstUser.set("gbAssist","REVERTED");
                firstUser.set("username", emailAddress);
                firstUser.set("password", passHash);
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        funcs.conditionalLog("User saved CONVERTED.");
                        var userResponse = { email : fuEmailAddress,
                                             firstName : fuUserFirstName,
                                             installoids : fuInstalloids,
                                             lastName : fuUserLastName,
                                             staffId : fuUserStaffId,
                                             username : fuTheUsername,
                                             confirmation : 0,
                                             transaction : 0,
                                             description : "confirmed" };

                        response.success(userResponse);
                    },
                    error: function(saveError)
                    {
                        console.log("unable to save user");
                        console.log(saveError);
                        response.error("Save was not successful: " + saveError);
                    }
                });
            }
        },
        error: function(queryError)
        {
            console.log("Query find not successful! " + queryError);
            response.error("Query find not successful: " + queryError);
        }
    });
});


///////////////////////////////////////
//
// convertUsernameToPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define("convertUsernameToPhoneNumber", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // depreciated, add:
    // useMasterKey: true,
    // above your success: lines.

    funcs.conditionalLog("Starting convertUsernameToPhoneNumber");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;

    funcs.conditionalLog("emailAddress [" + emailAddress + "]");
    funcs.conditionalLog("phoneNumber [" + phoneNumber + "]");

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);

    query.equalTo("username", emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("find with email address in username was successful.");
            funcs.conditionalLog(results.length + " records found");

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No records found to convert");
                response.success( "{ 'description' : 'No records found to convert' }" );
            }
            else
            {
                funcs.conditionalLog("convert only first user, remove the remaining");
                // Create New User copying from first
                // lastName, installoids, barberName, isStaffMember, lastSeen, friendsRelation,
                // username, allowsMessages, phoneNumber, language, firstname, password, staffID,
                // email, userRole (pointer)

                var firstUser       = results[0];
                var fuEmailAddress  = firstUser.get("email");
                var fuUserFirstName = firstUser.get("firstName");
                var fuInstalloids   = firstUser.get("installoids");
                var fuUserLastName  = firstUser.get("lastName");
                var fuUserStaffId   = firstUser.get("staffID");
                var fuTheUsername   = firstUser.get("username");

                funcs.conditionalLog("Can update user:");

                funcs.conditionalLog("email:      " + fuEmailAddress);
                funcs.conditionalLog("firstName:  " + fuUserFirstName);
                funcs.conditionalLog("installoids:" + fuInstalloids);
                funcs.conditionalLog("lastName:   " + fuUserLastName);
                funcs.conditionalLog("staffId:    " + fuUserStaffId);
                funcs.conditionalLog("username:   " + fuTheUsername);

                var userServiceToken    = process.env.USER_SERVICE_TOKEN;

                funcs.conditionalLog("token length: " + userServiceToken.length);

                var random  = funcs.randomNumberWithNumberOfDigits(5);

                //firstUser.set("verificationCode", random);
                firstUser.set("gbAssist","CONVERTED");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        funcs.conditionalLog("User saved CONVERTED.");
                        var userResponse = { email : fuEmailAddress,
                                             firstName : fuUserFirstName,
                                             installoids : fuInstalloids,
                                             lastName : fuUserLastName,
                                             staffId : fuUserStaffId,
                                             username : fuTheUsername,
                                             confirmation : random,
                                             transaction : userServiceToken,
                                             description : "confirmed" };

                        response.success(userResponse);
                    },
                    error: function(saveError)
                    {
                        console.log("unable to save user");
                        console.log(saveError);
                        response.error("Save was not successful: " + saveError);
                    }
                });
            }
        },
        error: function(queryError)
        {
            console.log("Query find not successful! " + queryError);
            response.error("Query find not successful: " + queryError);
        }
    });
});


///////////////////////////////////////
//
// resetUserToVersionOne
//
///////////////////////////////////////
Parse.Cloud.define("resetUserToVersionOne", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // depreciated, add:
    // useMasterKey: true,
    // above your success: lines.

    funcs.conditionalLog("Starting resetUserToVersionOne");
    funcs.conditionalLog("emailAddress [" + request.params.emailAddress + "]");
    funcs.conditionalLog("phoneNumber [" + request.params.phoneNumber + "]");

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);

    query.equalTo("username", request.params.phoneNumber);
    query.equalTo("", request.params.emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("find with email address in username was successful.");
            funcs.conditionalLog(results.length + " records found");

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No records found to convert");
                var theResult = { description : "No records found to convert" };

                response.success(theResult);
            }
            else
            {
                funcs.conditionalLog("convert only first user, remove the remaining");
                // Create New User copying from first
                // lastName, installoids, barberName, isStaffMember, lastSeen, friendsRelation,
                // username, allowsMessages, phoneNumber, language, firstname, password, staffID,
                // email, userRole (pointer)
                var firstUser = results[0];

                var emailAddress    = firstUser.get("email");
                var userFirstName   = firstUser.get("firstName");
                var installoids     = firstUser.get("installoids");
                var userLastName    = firstUser.get("lastName");
                var userStaffId     = firstUser.get("staffID");
                var theUsername     = firstUser.get("username");

                funcs.conditionalLog("Can update user:");

                funcs.conditionalLog("email:      " + emailAddress);
                funcs.conditionalLog("firstName:  " + userFirstName);
                funcs.conditionalLog("installoids:" + installoids);
                funcs.conditionalLog("lastName:   " + userLastName);
                funcs.conditionalLog("staffId:    " + userStaffId);
                funcs.conditionalLog("username:   " + theUsername);

                var userServiceToken = process.env.USER_SERVICE_TOKEN;

                funcs.conditionalLog("token length: " + userServiceToken.length);

                var random  = funcs.randomNumberWithNumberOfDigits(5);

                firstUser.set("gbAssist","CONVERTED");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        funcs.conditionalLog("User saved CONVERTED.");

                        var userResponse = { email : emailAddress,
                                             firstName : userFirstName,
                                             installoids : installoids,
                                             lastName : userLastName,
                                             staffId : userStaffId,
                                             username : theUsername,
                                             confirmation : random,
                                             transaction : userServiceToken,
                                             description : "confirmed" };

                        response.success(userResponse);
                    },
                    error: function(saveError)
                    {
                        console.log("unable to save user");
                        console.log(saveError);
                        response.error("Save was not successful: " + saveError);
                    }
                });
            }
        },
        error: function(queryError)
        {
            console.log("Query find not successful! " + queryError);
            response.error("Query find not successful: " + queryError);
        }
    });
});


///////////////////////////////////////
//
// getVerificationCode
//
///////////////////////////////////////
Parse.Cloud.define("getVerificationCode", function(request, response)
{
    var verification    = funcs.randomNumberWithNumberOfDigits(5);
    var token           = process.env.USER_SERVICE_TOKEN;
    var newPassword     = token + "-" + verification;

    response.success(newPassword);
});


///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
//
// PUSH RELATED
//
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////


///////////////////////////////////////
//
// saveMessageForUser
//
///////////////////////////////////////
Parse.Cloud.define("createMessageForUser", function(request, response)
{
    var msgSenderID        = request.params.senderID;
    var msgReceiverID    = request.params.receiverID;
    var msgTitle        = request.params.title;
    var msgSubtitle        = request.params.subtitle;
    var msgBody            = request.params.body;

    funcs.conditionalLog("createMessageForUser called");
    funcs.conditionalLog("with params:");
    funcs.conditionalLog("senderID [" + msgSenderID + "], receiverID [" + msgReceiverID + "], title [" + msgTitle + "], subtitle [" + msgSubtitle + "], body [" + msgBody + "]");

    Parse.Cloud.run("userWithUserIdExists",
    {
        userId: msgReceiverID
    },
    {
        useMasterKey: true,
        success: function(existsResult)
        {
            if ( JSON.parse(existsResult) )
            {
                // Create Message and Save
                var newMessage = new Parse.Object("Messages");
                var entireMessage = msgTitle + ". " + msgSubtitle + ". " + msgBody;
                newMessage.save(
                {
                    message:    entireMessage,
                    senderID:    msgSenderID,
                    receiverID: msgReceiverID
                },
                {
                    useMasterKey: true,
                    success: function(saveResult)
                    {
                        response.success(true);
                    },
                    error: function(saveError)
                    {
                        console.log("save error");
                        console.log(saveError);
                        response.error(saveError);
                    }
                });
            }
        },
        error: function(existsError)
        {
            console.log("exists error");
            console.log(existsError);
            response.error(existsError);
        }
    });
});


///////////////////////////////////////
//
// saveMessageForUserThenNotify
//
///////////////////////////////////////
Parse.Cloud.define("saveMessageForUserThenNotify", function(request, response)
{
    var pSenderID        = request.params.senderID;
    var pReceiverID        = request.params.receiverID;
    var pMsgTitle        = request.params.title;
    var pMsgSubtitle    = request.params.subtitle;
    var pMsgBody        = request.params.body;

    //var receivingUser    = null;

    funcs.conditionalLog("saveMessageForUserThenNotify called");
    funcs.conditionalLog("with params:");
    funcs.conditionalLog("senderID [" + pSenderID + "], receiverID [" + pReceiverID + "], title [" + pMsgTitle + "], subtitle [" + pMsgSubtitle + "], body [" + pMsgBody + "]");

    Parse.Cloud.run("createMessageForUser",
    {
        senderID:         pSenderID,
        receiverID:     pReceiverID,
        title:            pMsgTitle,
        subtitle:        pMsgSubtitle,
        body:            pMsgBody
    },
    {
        useMasterKey: true,
        success: function(createResult)
        {
            if ( JSON.parse(createResult) )
            {
                // Create User Query
                var User            = Parse.Object.extend("_User");
                var userQuery        = new Parse.Query(User);
                userQuery.equalTo("objectId", pReceiverID);

                //maybe:var pushQuery = new Parse.Query(Parse.Installation);
                var Installation    = Parse.Object.extend("_Installation");
                var pushQuery        = new Parse.Query(Installation);

                pushQuery.exists("currentUser");    // only include where currentUser exists
                pushQuery.include("currentUser"); // expand the currentUser pointer
                pushQuery.matchesQuery("currentUser", userQuery);

                var categoryId         = "ca.4xq.Barbershop8.Notification-Interface-Message.notification";
                var badgeNumber        = 1;
                var soundName        = "timbre3.caf";

                // Send Push to Query
                Parse.Push.send(
                {
                    where: pushQuery,
                    data:
                    {
                        category : categoryId,
                        alert:
                        {
                            title:        pMsgTitle,
                            subtitle:    pMsgSubtitle,
                            body:        pMsgBody
                        },
                        badge: badgeNumber,
                        sound : soundName
                    }
                },
                {
                    useMasterKey: true,
                    success: function(pushResult)
                    {
                        response.success("message sent");
                    },
                    error: function(pushError)
                    {
                        console.log("Push Error");
                        console.log(pushError);
                        response.error(pushError);
                    }
                });
            }
            else
            {
                response.error("No user with that ID");
            }
        },
        error: function(userError)
        {
            console.log("user error");
            console.log(userError);
            response.error(userError);
        }
    });
});


///////////////////////////////////////
//
// sendVerificationCodeBySmsToPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define("sendVerificationCodeBySmsToPhoneNumber", function(request, response)
{
    var verificationCode    = request.params.verificationCode;
    var phoneNumber         = request.params.phoneNumber;

    funcs.conditionalLog("sendVerificationCodeBySmsToPhoneNumber()");
    funcs.conditionalLog("phoneNumber: " + phoneNumber + " vCode [" + verificationCode + "]");

    var tAccountSid     = process.env.TWILIO_ACCOUNT_SID;
    var tAccountToken   = process.env.TWILIO_ACCOUNT_TOKEN;
    var tSendingNumber  = process.env.TWILIO_PHONE_NUMBER;
    var twilio          = require("twilio")(tAccountSid,tAccountToken);

    var tas = tAccountSid.substring(1,5);
    var tat = tAccountToken.substring(1,5);

    funcs.conditionalLog("account sid starts " + tas);
    funcs.conditionalLog("account token starts " + tat);
    funcs.conditionalLog("from phone " + tSendingNumber);

    var message = "Your Verification Code for the Barbershop Deluxe app is " + verificationCode + ". You may be able to tap this link: " + "fourxq.barbershop://verify?code=" + verificationCode;

    var toNumber = "";
    if ( phoneNumber.length === 10 )
    {
        toNumber = "+1" + phoneNumber;
    }
    else if ( phoneNumber.length === 11 )
    {
        toNumber = "+" + phoneNumber;
    }
    else
    {
        toNumber = phoneNumber;
    }
    funcs.conditionalLog("about to send");

    twilio.sendMessage(
    {
        to: toNumber,
        from: tSendingNumber,
        body: message

    }, function(error, responseData)
    {
        if (error)
        {
            console.log("error sending twilio message:");
            console.log(error);
            response.error(error);
        }
        else
        {
            funcs.conditionalLog("New Verification Code Sent");
            funcs.conditionalLog(responseData);

            response.success(responseData);
        }
    });
});


///////////////////////////////////////
//
// resetVerificationCodeThenSMSToUser
//
///////////////////////////////////////
Parse.Cloud.define("resetVerificationCodeThenSMSToUser", function(request, response)
{
    funcs.conditionalLog("resetVerificationCodeThenSMSToUser()");

    var os = require("os");

    var phoneNumber     = request.params.phoneNumber;
    var emailAddress    = request.params.emailAddress;
    var language        = request.params.language;
    var resend          = request.params.resend;

    funcs.conditionalLog("phoneNumber [" + phoneNumber + "]");
    funcs.conditionalLog("emailAddress [" + emailAddress + "]");
    funcs.conditionalLog("language [" + language + "]");
    funcs.conditionalLog("resend [" + resend + "]");

    /*
     *  1.  Get New Verification Code
     *  2.  Update User Record With New Code
     *  3.  Send User new code
     *  4.  User logs in
     */

    Parse.Cloud.run("resetVerificationCode",
    {
        emailAddress:   emailAddress,
        phoneNumber:    phoneNumber
    },
    {
        useMasterKey: true,
        success: function(resetResult)
        {
            var verificationCode = JSON.parse(resetResult);
            var message = "Your Barbershop Deluxe app verification code is" + os.EOL + verificationCode + os.EOL + "You may be able to tap this link:" + os.EOL + "fourxq.barbershop://verify?code=" + verificationCode;
            //var from    = twilioSendingNumber;

            Parse.Cloud.run("sendSMS",
            {
                toNumber :  phoneNumber,
                from:       twilioSendingNumber,
                message:    message
            },
            {
                success: function(sendResult)
                {
                    response.success(true);
                },
                error: function(errorResult)
                {
                    funcs.conditionalLog("Error sending message");
                    funcs.conditionalLog(errorResult);
                    response.error(errorResult);
                }
            });
        },
        error: function(errorResult)
        {
            funcs.conditionalLog("Unable to reset code");
            funcs.conditionalLog(errorResult);
        }
    });
});


///////////////////////////////////////
//
// sendPushMessageToUserWithInfo
//
// REQUIRED PARAMETERS:
//
// firstName            The first name of the user receiving the push
// lastName             The last name of the user receiving the push
// emailAddress         The email address of user receiving the push
// phoneNumber          The phone number of the user receiving the push
//
// title                The title of the push
// subtitle             The subtitle of the push
// body                 The body of the push
//
// categoryIdentifier   This indicates which action buttons should be shown
//                      with the push.
//
// RESULT:
//
// Successful:
// success          true
// result           the number of devices the push sent to
//
// Error:
// success          false
// error            the error from the server
//
///////////////////////////////////////
Parse.Cloud.define("sendPushMessageToUserWithInfo", function(request, response)
{
    funcs.conditionalLog("Send Push 1");

    if ( ( request.params.firstName.length === 0    ) ||
         ( request.params.lastName.length === 0     ) ||
         ( request.params.emailAddress.length === 0 ) ||
         ( request.params.phoneNumber.length === 0  ) ||
         ( request.params.title.length       === 0  ) ||
         ( request.params.subtitle.length    === 0  ) ||
         ( request.params.body.length        === 0  ) )
    {
        var theResult =
            {
                code: 4001,
                message: "missing one or more required parameters"
            };
        response.error(theResult);
    }

    funcs.conditionalLog("Send Push 2");

    var phoneNumber     = request.params.phoneNumber;

    var userQuery       = new Parse.Query(Parse.User);
    userQuery.equalTo("phoneNumber", request.params.phoneNumber);
    userQuery.equalTo("email", request.params.emailAddress);

    funcs.conditionalLog("Send Push 3");

    var pushQuery       = new Parse.Query(Parse.Installation);
    pushQuery.include("currentUser");
    pushQuery.matchesQuery("currentUser", userQuery);
    pushQuery.equalTo("userId", "4QdhsyAE6f");

    funcs.conditionalLog("Send Push 4");

    var categoryIdentifier = "ca.4xq.Barbershop8.Notification-Interface-Message.notification";

    if ( request.params.categoryIdentifier.length > 0 )
    {
        categoryIdentifier = request.params.categoryIdentifier;
    }

    var pushData =
    {
        "aps" :
        {
            "category" : categoryIdentifier,
            "alert" :
            {
                "title" : request.params.title,
                "subtitle" : request.params.subtitle,
                "body": request.params.body
            },
            "badge" : 3,
            "sound" : "timbre3.caf"
        },
        "badge" : "Increment"
    };

    funcs.conditionalLog("Send Push 5");
    funcs.conditionalLog("Send Push 6");

    Parse.Push.send(
    {
        where: pushQuery,
        data: pushData
    },
    {
        useMasterKey: true,
        success: function (pushResult)
        {
            funcs.conditionalLog("Send Push Success:");
            funcs.conditionalLog(pushResult);

            var theResult = pushResult["result"];

            funcs.conditionalLog("Push Sent (" + theResult.toString() + ")");
            var theResult =
            {
                success: true,
                result: theResult
            };
            response.success(theResult);
        },
        error: function (pushError)
        {
            funcs.conditionalLog("Send Push Error");
            funcs.conditionalLog(pushError);

            var theResult =
            {
                success: false,
                error: pushError
            };
            response.error(theResult);
        }
    });
});


///////////////////////////////////////
//
// pushNotificationTest
//
// REQUIRED PARAMETERS:
//
// none
//
// OPTIONAL PARAMTERS:
//
// none
//
//
//
// RESULT:
//
// Successful:
// success          true
// result           the number of devices the push sent to
//
// Error:
// success          false
// error            the error from the server
//
///////////////////////////////////////
Parse.Cloud.define("pushNotificationTest", function(request, response)
{
    var user = request.user;

    var title       = "Barbershop Deluxe app";
    var subtitle    = "Local Database Updated.";
    var body        = "Your copy of the Barbershop Deluxe database has been updated.";

    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo("userId", user.id);

    Parse.Push.send(
    {
        where: pushQuery, // Set our Installation query
        data:
        {
            alert:
            {
                "title" : title,
                "subtitle" : subtitle,
                "body" : body
            }
        }
    },
    {
        success: function()
        {
            console.log("#### PUSH OK");
        },
        error: function(error)
        {
            console.log("#### PUSH ERROR" + error.message);
        },
        useMasterKey: true
    });
    response.success("success");
});

///////////////////////////////////////
//
// sendPushNotificationWithParams
//
// REQUIRED PARAMETERS:
//
// queryClass           The name of the class for the objectId (User | Installation)
// payload              The entire Push Payload
//
//
// ATLEAST ONE REQUIRED PARAMETER:
//
// channels             The PFInstallation channel(s)
//                      If you use channels, you can not use any of the below three.
//                      However, they can be combined.
// startObjectId        The first characters of the objectId
// userIds              The PFUser objectIds
// versionsMatching     The Versions Matching Dictionary
//                      KEY one of: <,<<, <=, ==, >=, >,>>,!=
//                      VALUE: Version Number to compare #.##?.##?#?#?#?#?
//                      NOTE: < and << are both Less Than
//                            > and >> are both Greater Than
//                            use the one that makes sense to you.
//
//
// OPTIONAL PARAMTERS:
//
// pseudoSend           Any Object Value, will run a query count instead of
//                      sending the push.
//
//
// RESULT:
//
// Successful:
// success          true
// result           the number of devices the push sent to
//
// Error:
// success          false
// error            the error from the server
//
///////////////////////////////////////
Parse.Cloud.define("sendPushNotificationWithParams", function(request, response)
{
    funcs.conditionalLog("sendPushNotificationWithParams started");

    var sendToChannels  = false;
    var checkVersionsEh = false;

    var message         = undefined;
    var theResult       = undefined;
    var sendChannels    = undefined;
    var versionsMatching= undefined;

    if ( ( request.params.queryClass.length    === 0 ) ||
         ( request.params.payload.length       === 0 ) ||
         ( request.params.queryClass           === undefined ) ||
         ( request.params.payload              === undefined ) )
    {
        message = "missing one or more required parameters";
    }

    if ( ( request.params.startObjectId === undefined ) &&
         ( request.params.userIds === undefined ) &&
         ( request.params.channels === undefined ) &&
         ( request.params.versionsMatching === undefined ) )
    {
        message = "missing matching parameters";
    }

    if ( ( request.params.startObjectId !== undefined ) &&
         ( request.params.startObjectId.length === 0 ) )
    {
         message = "missing support code";
    }

    if ( ( request.params.userIds !== undefined ) &&
         ( request.params.userIds.length === 0 ) )
    {
        message = "missing user ids";
    }

    if ( request.params.channels !== undefined )
    {
        if ( request.params.channels.length === 0 )
        {
            message = "missing channels";
        }
        else
        {
            sendChannels    = request.params.channels;
            sendToChannels  = true;
        }
    }

    if ( request.params.versionsMatching !== undefined )
    {
        if ( request.params.versionsMatching.length === 0 )
        {
            message = "missing version matching parameter(s)";
        }
        else
        {
            versionsMatching    = request.params.versionsMatching;
            checkVersionsEh     = true;
        }
    }

    if ( message !== undefined )
    {
        theResult =
            {
                "code": 4001,
                "message": message
            };
        response.error(theResult);
    }

    funcs.conditionalLog("Send Push 1");

    var sendThePush = true;

    if ( request.params.pseudoSend !== undefined )
    {
        sendThePush = false;
    }

    funcs.conditionalLog("Send Push 2");

    var payload     = request.params.payload;

    var User        = Parse.Object.extend(Parse.User);
    var Installation= Parse.Object.extend(Parse.Installation);

    var userQuery   = null;
    var installQuery= new Parse.Query(Installation);

    funcs.conditionalLog("Send Push 2.1");

    if ( request.params.queryClass === "User" )
    {
        userQuery   = new Parse.Query(User);

        if ( request.params.startObjectId !== undefined )
        {
            userQuery.startsWith("objectId", request.params.startObjectId);
            funcs.conditionalLog("Send Push 2.2");
        }

        installQuery.matchesQuery("currentUser", userQuery);

        funcs.conditionalLog("Send Push 2.3");
    }
    else if ( request.params.queryClass === "Installation" )
    {
        funcs.conditionalLog("Send Push 2.4");

        if ( request.params.userIds !== undefined )
        {
            installQuery.containedIn( "userId", request.params.userIds );
            funcs.conditionalLog("Send Push 2.5");
        }
        else if ( request.params.startObjectId !== undefined )
        {
            installQuery.startsWith("objectId", request.params.startObjectId);
            funcs.conditionalLog("Send Push 2.6");
        }
        else if ( checkVersionsEh === true )
        {
            funcs.conditionalLog("Send Push 2.6.1 about to iterate through versionsMatching");

            var compareKey;
            for ( compareKey in versionsMatching )
            {
                if ( versionsMatching.hasOwnProperty(compareKey) )
                {
                    // this will check if key is owned by data object and not by any of it's ancestors
                    var compareVer = versionsMatching[compareKey];

                    funcs.conditionalLog("CompareKey [" + compareKey + "] compareVer [" + compareVer + "]");
                    if ( ( compareKey === ">" ) || ( compareKey === ">>" ) )
                    {
                        funcs.conditionalLog("Greater Than");
                        installQuery.greaterThan("appVersion", compareVer);
                    }
                    else if ( compareKey === ">=" )
                    {
                        funcs.conditionalLog("Greater Than Or Equal To");
                        installQuery.greaterThanOrEqualTo("appVersion", compareVer);
                    }
                    else if ( compareKey === "==" )
                    {
                        funcs.conditionalLog("Equal To");
                        installQuery.equalTo("appVersion", compareVer);
                    }
                    else if ( compareKey === "<=" )
                    {
                        funcs.conditionalLog("Less Than Or Equal To");
                        installQuery.lessThanOrEqualTo("appVersion", compareVer);
                    }
                    else if ( ( compareKey === "<" )  || ( compareKey === "<<" ) )
                    {
                        funcs.conditionalLog("Less Than");
                        installQuery.lessThan("appVersion", compareVer);
                    }
                    else if ( compareKey === "!=" )
                    {
                        funcs.conditionalLog("Not Equal To");
                        installQuery.notEqualTo("appVersion", compareVer);
                    }
                    else
                    {
                        funcs.conditionalLog("INVALID COMPARATOR!");
                        response.error("Invalid Comparator '" + compareKey + "' For '" + compareVer + "'");
                    }
                }
            }
        }
        funcs.conditionalLog("Send Push 2.7");
    }
    else
    {
        funcs.conditionalLog("Send Push 2.8");
        theResult =
            {
                "code": 4002,
                "message": "queryClass parameter was not User or Installation"
            };
        response.error(theResult);
    }

    funcs.conditionalLog("Send Push 2.9");

    //TODO: Remove next line when I know this works
    //installQuery.equalTo("userId","4QdhsyAE6f");

    funcs.conditionalLog("Send Push 3");

    //var pushQuery       = new Parse.Query(Parse.Installation);
    //if ( userQuery !== null )
    //{
    //    installQuery.include("currentUser");
    //    installQuery.matchesQuery("currentUser", userQuery);
    //}

    funcs.conditionalLog("Send Push 4");

    var pushData = payload;
    /*
    {
        "aps" :
        {
            "category" : categoryIdentifier,
            "alert" :
            {
                "title" : request.params.title,
                "subtitle" : request.params.subtitle,
                "body": request.params.body
            },
            "badge" : 3,
            "sound" : "timbre3.caf"
        },
        "badge" : "Increment"
    };


    {
        aps:
        {
            alert:
            {
                title: 'App Support Message',
                subtitle: 'Response To Support Enquiry',
                body: 'App Support has responded to your support enquiry by email.'
            },
            category: 'ca.4xq.Barbershop8.Notification-Interface-Message.notification',
            sound: 'timbre.caf'
        },
        badge: 'Increment'
    }

    */

    funcs.conditionalLog("Send Push 5");

    funcs.conditionalLog("Push Data (payload):");

    funcs.conditionalLog(payload);

    funcs.conditionalLog("Send Push 6");

    if ( sendThePush === true )
    {
        if ( ( sendToChannels === true ) &&
             ( sendChannels.length > 0 ) )
        {
            Parse.Push.send(
            {
                channels: sendChannels,
                data: payload
            },
            {
                useMasterKey: true,
                success: function (pushResult)
                {
                    funcs.conditionalLog("Send Push Success:");
                    funcs.conditionalLog(pushResult);

                    var pResult = pushResult["result"];

                    funcs.conditionalLog("Push Sent (" + pResult.toString() + ")");
                    theResult =
                    {
                        success: true,
                        result: pResult
                    };
                    response.success(theResult);
                },
                error: function (pushError)
                {
                    funcs.conditionalLog("Send Push Error");
                    funcs.conditionalLog(pushError);

                    theResult =
                    {
                        success: false,
                        error: pushError
                    };
                    response.error(theResult);
                }
            });
        }
        else
        {
            Parse.Push.send(
            {
                where: installQuery,
                data: payload
            },
            {
                useMasterKey: true,
                success: function (pushResult)
                {
                    funcs.conditionalLog("Send Push Success:");
                    funcs.conditionalLog(pushResult);

                    var pResult = pushResult["result"];

                    funcs.conditionalLog("Push Sent (" + pResult.toString() + ")");
                    theResult =
                    {
                        success: true,
                        result: pResult
                    };
                    response.success(theResult);
                },
                error: function (pushError)
                {
                    funcs.conditionalLog("Send Push Error");
                    funcs.conditionalLog(pushError);

                    theResult =
                    {
                        success: false,
                        error: pushError
                    };
                    response.error(theResult);
                }
            });
        }
    }
    else
    {
        // sendThePush is false
        // parameter 'pseudoSend' was sent
        // So instead, send the count of query results
        installQuery.count(
        {
            useMasterKey: true,
            success: function(countResult)
            {
                funcs.conditionalLog("Count Query Result: ");

                theResult =
                {
                    success: true,
                    result: countResult,
                    payload: pushData
                };
                response.success(theResult);
            },
            error: function(countError)
            {
                console.log("Count Query ERROR: ");
                console.log(countError);
                response.error("unable to get count: " + countError);
            }
        });
    }
});


///////////////////////////////////////
//
// Twilio Functions
//
///////////////////////////////////////

// Non Parse functions can be found in twilio.js


///////////////////////////////////////
//
// getTwilioPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define("getTwilioPhoneNumber", function(request, response)
{
    funcs.conditionalLog("getTwilioPhoneNumber");

    response.success(twilioSendingNumber);
});


///////////////////////////////////////
//
// sendVerificationCodeToUserWithPhoneNumberEmailAddress
//
///////////////////////////////////////
Parse.Cloud.define("sendVerificationCodeToUserWithPhoneNumberEmailAddress", function(request, response)
{
    var theUser        = request.user;

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;

    funcs.conditionalLog("emailAddress [" + emailAddress + "]");
    funcs.conditionalLog("phoneNumber [" + phoneNumber + "]");

    if ( theUser === null )
    {
        var query = new Parse.Query(Parse.User);

        query.equalTo("username",phoneNumber);
        query.equalTo("email",emailAddress);

        funcs.conditionalLog("starting query");

        query.find(
        {
            useMasterKey: true,
            success: function(results)
            {
                if ( results.length > 0 )
                {
                    funcs.conditionalLog("I have a user");
                    var qUser        = results[0];

                    funcs.conditionalLog(qUser.username);

                    var password    = qUser.get("password");
                    var passLength  = password.length.toString();

                    funcs.conditionalLog("pass length is " + passLength);
                    //funcs.conditionalLog(password.length.toString);

                    if ( password.length > 0 )
                    {
                        var code        = password.substring(-5);
                        funcs.conditionalLog("I have a code ");
                        funcs.conditionalLog(code);
                        sendVerificationCodeBySmsToPhoneNumber(code, phoneNumber);
                        response.success(true);
                    }
                    else
                    {
                        response.error("no code-check cloud P L E 0");

                    }
                }
                else
                {
                    funcs.conditionalLog("I do not have a user");
                    response.success(false);
                }
            },
            error: function(queryError)
            {
                console.log("error with query:");
                console.log(queryError);
                response.error(queryError);
            }
        });
    }
    else
    {
        var reqUsername     = theUser.get("username");
        var reqPhoneNumber  = theUser.get("phoneNumber");
        var reqEmailAddress = theUser.get ("email");

        if ( ( ( reqUsername === phoneNumber ) ||
               ( reqPhoneNumber === phoneNumber ) ) &&
             ( reqEmailAddress === emailAddress ) )
        {

            funcs.conditionalLog("user was in request");
            var password    = theUser.get("password");
            var code        = password.substring(-5);
            sendVerificationCodeBySmsToPhoneNumber(code, phoneNumber);
            response.success(true);
        }
        else
        {
            response.error("not current user");
        }
    }
});


///////////////////////////////////////
//
// sendSMS
//
///////////////////////////////////////
Parse.Cloud.define("sendSMS", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    funcs.conditionalLog("sendSMS with:");
    funcs.conditionalLog("toNumber: " + request.params.toNumber);
    funcs.conditionalLog("message: " + request.params.message);
    funcs.conditionalLog("from: " + twilioSendingNumber);

    var tas = twilioAccountSid.substring(1,5);
    var tat = twilioAccountToken.substring(1,5);

    funcs.conditionalLog("account sid starts " + tas);
    funcs.conditionalLog("account token starts " + tat);

    var twilio      = require("twilio")(twilioAccountSid,twilioAccountToken);
    var to          = request.params.toNumber;
    var message     = request.params.message;

    twilio.sendMessage(
    {
        to: to,
        from: twilioSendingNumber,
        body: message

    }, function(error, responseData)
    {
        if (error)
        {
            console.log("error with sendSMS:");
            console.log(error);
            response.error(error);
        }
        else
        {
            funcs.conditionalLog("success with sendSMS:");
            funcs.conditionalLog(responseData);
            response.success(responseData);
        }
    });
});