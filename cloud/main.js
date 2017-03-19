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

// internal/private functions
require("./funcs.js")();

// Barbers and Services
require("./barber.js");

// Messages Related
require("./message.js");

// Products and Cart Related
require("./product.js");

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


//////////////////////////////////////
//
// hello
//
//////////////////////////////////////
Parse.Cloud.define("hello", function(request, response)
{
    response.success("I am not really dreaming of being a website, instead I am dreaming of being the back end to an app... SUCCESS!");
});


///////////////////////////////////////
//
// status
//
///////////////////////////////////////
Parse.Cloud.define("status", function(request, response)
{
    var theRelease      = null;
    var hrv             = process.env.HEROKU_RELEASE_VERSION;

    if ( ( hrv === undefined ) || ( hrv === null ) )
    {
        theRelease      = "";
    }
    else
    {
        theRelease      = "XQ" + hrv.toUpperCase() + "4";
    }
    var theNickname     = process.env.SERVER_NICKNAME;

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
    conditionalLog("1");

    try
    {
        var theCreate   = CONST.ACTION_USER_CREATE;

        conditionalLog("2");

        var theVerify   = CONST.ACTION_USER_VERIFY;

        conditionalLog("3");
    }
    catch (e)
    {
        conditionalLog("4");
        conditionalLog(e);

        var theCreate   = ACTION_USER_ERROR;

        conditionalLog("5");

        var theVerify   = ACTION_USER_UNKNOWN;

        response.error(theVerify|theCreate);
    }
    finally
    {
        conditionalLog("6");

        response.success(theVerify|theCreate);
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
    conditionalLog("getTestDictionary");

    var theString   = "This is a string";
    var theNumber   = 420;
    var theStringArray = ["A","B","C","D"];
    var theNumberArray = [1,2,3,4,5];
    var trueEh = false;

    conditionalLog("Just before creating dictionary");

    var theResult = { aString: theString, aNumber: theNumber, anArray: theStringArray, secondArray: theNumberArray, aBool: trueEh };

    conditionalLog("Just after creating dictionary");

    response.success(theResult);
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

    conditionalLog("Starting convertUsernameBackToEmail");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;
    var passHash         = request.params.hashed;

    if ( ( emailAddress.length === 0 ) ||
         ( phoneNumber.length === 0  ) ||
         ( passHash.length === 0 ) )
    {
        response.error("missing information");
    }

    conditionalLog("emailAddress [" + emailAddress + "]");
    conditionalLog("phoneNumber [" + phoneNumber + "]");

    var query = new Parse.Query(Parse.User);

    query.equalTo("username", phoneNumber);
    query.equalTo("email", emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("find with phone number in username was successful.");
            conditionalLog(results.length + " records found");

            if ( results.length === 0 )
            {
                conditionalLog("No records found to convert");
                var theResponse =
                    {
                        'description' : 'No records found to convert'
                    };
                response.success(theResponse);
            }
            else
            {
                conditionalLog("convert only first user, remove the remaining");
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

                conditionalLog("Can update user:");

                conditionalLog("email:      " + fuEmailAddress);
                conditionalLog("firstName:  " + fuUserFirstName);
                conditionalLog("installoids:" + fuInstalloids);
                conditionalLog("lastName:   " + fuUserLastName);
                conditionalLog("staffId:    " + fuUserStaffId);
                conditionalLog("username:   " + fuTheUsername);

                //firstUser.set("verificationCode", random);
                firstUser.set("gbAssist","REVERTED");
                firstUser.set("username", emailAddress);
                firstUser.set("password", passHash);
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        conditionalLog("User saved CONVERTED.");
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
// convertUsernameToPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define("convertUsernameToPhoneNumber", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // depreciated, add:
    // useMasterKey: true,
    // above your success: lines.

    conditionalLog("Starting convertUsernameToPhoneNumber");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;

    conditionalLog("emailAddress [" + emailAddress + "]");
    conditionalLog("phoneNumber [" + phoneNumber + "]");

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);

    query.equalTo("username", emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("find with email address in username was successful.");
            conditionalLog(results.length + " records found");

            if ( results.length === 0 )
            {
                conditionalLog("No records found to convert");
                response.success( "{ 'description' : 'No records found to convert' }" );
            }
            else
            {
                conditionalLog("convert only first user, remove the remaining");
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

                conditionalLog("Can update user:");

                conditionalLog("email:      " + fuEmailAddress);
                conditionalLog("firstName:  " + fuUserFirstName);
                conditionalLog("installoids:" + fuInstalloids);
                conditionalLog("lastName:   " + fuUserLastName);
                conditionalLog("staffId:    " + fuUserStaffId);
                conditionalLog("username:   " + fuTheUsername);

                var userServiceToken    = process.env.USER_SERVICE_TOKEN;

                conditionalLog("token length: " + userServiceToken.length);

                var random  = randomNumberWithNumberOfDigits(5);

                //firstUser.set("verificationCode", random);
                firstUser.set("gbAssist","CONVERTED");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        conditionalLog("User saved CONVERTED.");
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

    conditionalLog("Starting resetUserToVersionOne");
    conditionalLog("emailAddress [" + request.params.emailAddress + "]");
    conditionalLog("phoneNumber [" + request.params.phoneNumber + "]");

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);

    query.equalTo("username", request.params.phoneNumber);
    query.equalTo("", request.params.emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("find with email address in username was successful.");
            conditionalLog(results.length + " records found");

            if ( results.length === 0 )
            {
                conditionalLog("No records found to convert");
                var theResult = { description : "No records found to convert" };

                response.success(theResult);
            }
            else
            {
                conditionalLog("convert only first user, remove the remaining");
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

                conditionalLog("Can update user:");

                conditionalLog("email:      " + emailAddress);
                conditionalLog("firstName:  " + userFirstName);
                conditionalLog("installoids:" + installoids);
                conditionalLog("lastName:   " + userLastName);
                conditionalLog("staffId:    " + userStaffId);
                conditionalLog("username:   " + theUsername);

                var userServiceToken = process.env.USER_SERVICE_TOKEN;

                conditionalLog("token length: " + userServiceToken.length);

                var random  = randomNumberWithNumberOfDigits(5);

                firstUser.set("gbAssist","CONVERTED");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        conditionalLog("User saved CONVERTED.");

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
    var verification    = randomNumberWithNumberOfDigits(5);
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

    conditionalLog("createMessageForUser called");
    conditionalLog("with params:");
    conditionalLog("senderID [" + msgSenderID + "], receiverID [" + msgReceiverID + "], title [" + msgTitle + "], subtitle [" + msgSubtitle + "], body [" + msgBody + "]");

    Parse.Cloud.run("userWithUserIdExists",
    {
        userId: msgReceiverID
    },
    {
        userMasterKey: true,
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
                        response.error(setError);
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

    conditionalLog("saveMessageForUserThenNotify called");
    conditionalLog("with params:");
    conditionalLog("senderID [" + pSenderID + "], receiverID [" + pReceiverID + "], title [" + pMsgTitle + "], subtitle [" + pMsgSubtitle + "], body [" + pMsgBody + "]");

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
function sendVerificationCodeBySmsToPhoneNumber(verificationCode, phoneNumber)
{
    conditionalLog("sendVerificationCodeBySmsToPhoneNumber()");
    conditionalLog("phoneNumber: " + phoneNumber + " vCode [" + verificationCode + "]");

    var tAccountSid     = process.env.TWILIO_ACCOUNT_SID;
    var tAccountToken   = process.env.TWILIO_ACCOUNT_TOKEN;
    var tSendingNumber  = process.env.TWILIO_PHONE_NUMBER;
    var twilio          = require("twilio")(tAccountSid,tAccountToken);

    var tas = tAccountSid.substring(1,5);
    var tat = tAccountToken.substring(1,5);

    conditionalLog("account sid starts " + tas);
    conditionalLog("account token starts " + tat);
    conditionalLog("from phone " + tSendingNumber);

    var message = "Your Verification Code for the Barbershop Deluxe app is " + os.EOL + verificationCode + os.EOL + "You may be able to tap this link: " + os.EOL + "fourxq.barbershop://verify?code=" + verificationCode;

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
    conditionalLog("about to send");

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
            conditionalLog("New Verification Code Sent");
            conditionalLog(responseData);

            response.success(responseData);
        }
    });
}


///////////////////////////////////////
//
// resetVerificationCodeThenSMSToUser
//
///////////////////////////////////////
Parse.Cloud.define("resetVerificationCodeThenSMSToUser", function(request, response)
{
    conditionalLog("resetVerificationCodeThenSMSToUser()");

    var os = require("os");

    var phoneNumber     = request.params.phoneNumber;
    var emailAddress    = request.params.emailAddress;
    var language        = request.params.language;
    var resend          = request.params.resend;

    conditionalLog("phoneNumber [" + phoneNumber + "]");
    conditionalLog("emailAddress [" + emailAddress + "]");
    conditionalLog("language [" + language + "]");
    conditionalLog("resend [" + resend + "]");

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
                    conditionalLog("Error sending message");
                    conditionalLog(errorResult);
                    response.error(errorResult);
                }
            });
        },
        error: function(errorResult)
        {
            conditionalLog("Unable to reset code");
            conditionalLog(errorResult);
        }
    });
});


///////////////////////////////////////
//
// ROLES AND PERMISSIONS
//
///////////////////////////////////////


///////////////////////////////////////
//
// getRoleNamesForCurrentUser
//
///////////////////////////////////////
Parse.Cloud.define("getRoleNamesForCurrentUser", function(request, response)
{
    conditionalLog("getRoleNamesForCurrentUser");

    var currentUser     = request.user;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");

    var userId          = request.user.id;

    conditionalLog("Checking [" + userId + "] " + first + " " + last + " (" + username + ")");
    if ( ( currentUser === null ) || ( currentUser === undefined ) )
    {
        response.error("missing user");
    }

    //var Role        = Parse.Object.extend("_Role");
    //var roleQuery   = new Parse.Query(Role);
    var roleQuery = new Parse.Query(Parse.Role);
    roleQuery.exists("name");
    roleQuery.find(
    {
        useMasterKey: true,
        success: function(roleResults)
        {
            var belongsToRoleNames = [];

            for ( rIdx = 0; rIdx < roleResults.length; rIdx += 1 )
            {
                var roleObject      = roleResults[rIdx];
                var roleName        = roleObject.get("name");

                conditionalLog("Checking role '" + roleName + "' for '" + userId + "'");

                var relationQuery = roleObject.relation("users").query();
                relationQuery.get(userId,
                {
                    useMasterKey: true,
                    success     : function(userResult)
                    {
                        conditionalLog("User belongs to role " + roleName);

                        belongsToRoleNames.push(roleName);

                        conditionalLog("Belongs to these roles:");
                        conditionalLog(belongsToRoleNames);
                    },
                    error       : function(userError)
                    {
                        conditionalLog("User does not belong to role " + roleName);
                        //conditionalLog(userError);
                    }
                });
            }

            conditionalLog("User belongs to:");
            conditionalLog(belongsToRoleNames);
            response.success(belongsToRoleNames);
        },
        error: function(roleError)
        {
            console.log("RoleError:");
            console.log(roleError);
            response.error(roleError);
        }
    });
});


///////////////////////////////////////
//
// afterSave
//
///////////////////////////////////////
/*
Parse.Cloud.afterSave(Parse.User, function(request, response)
{
    var user = request.user;
    query = new Parse.Query(Parse.Role);
    query.equalTo("name", "Alpha");
    query.first().then(function(object) {
        object.relation("users").add(user);
        return object.save();
    }).then(function() {
        query = new Parse.Query(Parse.Role);
        query.equalTo("name", "Free");
        return query.first();
    }).then(function(object) {
        object.relation("users").add(user);
        return object.save();
    }).then(function() {
        response.success("The user has been authorized.");
    }, function(error) {
        response.error("error: " + error.message);
    });
});
*/

Parse.Cloud.define("addCurrentUserToRoleWithRoleName", function(request, response)
{
    conditionalLog("addCurrentUserToRoleWithRoleName");

    var roleName        = request.params.roleName;
    var currentUser     = request.user;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");
    var userId          = currentUser.id;

    conditionalLog("Checking [" + userId + "] "+ first + " " + last + " (" + username + ")");

    if ( ( currentUser === null ) ||
         ( roleName === null    ) ||
         ( roleName.length === 0  ) )
    {
        response.error("missing user and or roleName");
    }

    var Role        = Parse.Object.extend("_Role");
    var roleQuery   = new Parse.Query(Role);
    roleQuery.equalTo("name", roleName);
    roleQuery.first(
    {
        useMasterKey: true,
        success: function(roleObject)
        {
            var fRoleName = roleObject.get("name");
            conditionalLog("Have role '" + fRoleName + "'");

            var relationQuery = roleObject.relation("users").query();
            relationQuery.equalTo("objectId", currentUser.id);
            relationQuery.count(
            {
                useMasterKey: true,
                success: function(userCount)
                {
                    var theResult = {};

                    if ( userCount === 1 )
                    {
                        theResult = { belongs: true };
                    }
                    else
                    {
                        roleObject.getUsers().add(currentUser);
                        roleObject.save();
                        theResult = { belongs : false, added : true };
                    }
                    response.success(theResult);
                },
                error: function(userError)
                {
                    response.error(userError);
                }
            });
        },
        error: function(roleError)
        {
            response.error(roleError);
        }
    });
});


///////////////////////////////////////
//
// doesCurrentUserBelongToRoleWithRoleName
//
///////////////////////////////////////
Parse.Cloud.define("doesCurrentUserBelongToRoleWithRoleName", function(request, response)
{
    conditionalLog("doesCurrentUserBelongToRoleWithRoleName");

    var roleName        = request.params.roleName;
    var currentUser     = request.user;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");
    var userId          = currentUser.id;

    conditionalLog("Checking [" + userId + "] "+ first + " " + last + " (" + username + ")");

    if ( ( currentUser === null ) ||
         ( roleName === null    ) ||
         ( roleName.length === 0  ) )
    {
        response.error("missing user and or roleName");
    }
    var Role        = Parse.Object.extend("_Role");
    var roleQuery   = new Parse.Query(Role);
    roleQuery.equalTo("name", roleName);
    roleQuery.first(
    {
        useMasterKey: true,
        success: function(roleObject)
        {
            var roleName = roleObject.get("name");
            conditionalLog("Have role '" + roleName + "'");

            var relationQuery = roleObject.relation("users").query();
            relationQuery.get(userId,
            {
                useMasterKey: true,
                success     : function(userResult)
                {
                    conditionalLog("User belongs to role " + roleName);

                    var theResult = { belongs: true };
                    response.success(theResult);
                },
                error       : function(userError)
                {
                    conditionalLog("User does not belong to role " + roleName);
                    var theResult = { belongs: false };
                    response.success(theResult);
                }
            });
        },
        error: function(roleError)
        {
            response.error(roleError);
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
    conditionalLog("Send Push 1");

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

    conditionalLog("Send Push 2");

    var phoneNumber     = request.params.phoneNumber;

    var userQuery       = new Parse.Query(Parse.User);
    userQuery.equalTo("phoneNumber", request.params.phoneNumber);
    userQuery.equalTo("email", request.params.emailAddress);

    conditionalLog("Send Push 3");

    var pushQuery       = new Parse.Query(Parse.Installation);
    pushQuery.include("currentUser");
    pushQuery.matchesQuery("currentUser", userQuery);
    pushQuery.equalTo("userId", "4QdhsyAE6f");

    conditionalLog("Send Push 4");

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

    conditionalLog("Send Push 5");
    conditionalLog("Send Push 6");

    Parse.Push.send(
    {
        where: pushQuery,
        data: pushData
    },
    {
        useMasterKey: true,
        success: function (pushResult)
        {
            conditionalLog("Send Push Success:");
            conditionalLog(pushResult);

            var theResult = pushResult["result"];

            conditionalLog("Push Sent (" + theResult.toString() + ")");
            var theResult =
            {
                success: true,
                result: theResult
            };
            response.success(theResult);
        },
        error: function (pushError)
        {
            conditionalLog("Send Push Error");
            conditionalLog(pushError);

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
    conditionalLog("getTwilioPhoneNumber");

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

    conditionalLog("emailAddress [" + emailAddress + "]");
    conditionalLog("phoneNumber [" + phoneNumber + "]");

    if ( theUser === null )
    {
        var query = new Parse.Query(Parse.User);

        query.equalTo("username",phoneNumber);
        query.equalTo("email",emailAddress);

        conditionalLog("starting query");

        query.find(
        {
            useMasterKey: true,
            success: function(results)
            {
                if ( results.length > 0 )
                {
                    conditionalLog("I have a user");
                    var qUser        = results[0];

                    conditionalLog(user.username);

                    var password    = qUser.get("password");

                    conditionalLog("pass length is ");
                    conditionalLog(password.length.toString);

                    if ( password.length > 0 )
                    {
                        var code        = password.substring(-5);
                        conditionalLog("I have a code ");
                        conditionalLog(code);
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
                    conditionalLog("I do not have a user");
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

            conditionalLog("user was in request");
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

    conditionalLog("sendSMS with:");
    conditionalLog("toNumber: " + request.params.toNumber);
    conditionalLog("message: " + request.params.message);
    conditionalLog("from: " + twilioSendingNumber);

    var tas = twilioAccountSid.substring(1,5);
    var tat = twilioAccountToken.substring(1,5);

    conditionalLog("account sid starts " + tas);
    conditionalLog("account token starts " + tat);

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
            conditionalLog("success with sendSMS:");
            conditionalLog(responseData);
            response.success(responseData);
        }
    });
});