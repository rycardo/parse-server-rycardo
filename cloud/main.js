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

//do I need to require app.js?
//require("./cloud/app.js");

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
    response.success("Up, Fjord, Valid");
});


///////////////////////////////////////
//
// barberIdForBarberFirstNameLastName
//
///////////////////////////////////////
Parse.Cloud.define("barberIdForBarberFirstNameLastName", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    var pFirstName = request.params.firstName;
    var pLastName  = request.params.lastName;

    var query = new Parse.Query("Barbers");
    query.equalTo("firstName", pFirstName);
    query.equalTo("lastName", pLastName);
    query.equalTo("isActive", true);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            if ( results.length === 1 )
            {
                var barberId = results[0].id;
                response.success(barberId);
            }
            else if ( results.length > 1 )
            {
                response.error("more than one barber found");
            }
            else
            {
                response.error("no barbers found with that name");
            }
        },
        error: function(error)
        {
            console.log("barber name lookup failed!");
            console.log(error);
            response.error("barber name lookup failed: " + error);
        }
    });
});


///////////////////////////////////////
//
// barberIdForBarberName
//
///////////////////////////////////////
Parse.Cloud.define("barberIdForBarberName", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    var pBarberName = request.params.barberName;

    var query = new Parse.Query("Barbers");
    query.equalTo("barberName", pBarberName);
    query.equalTo("isActive", true);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            if ( results.length === 1 )
            {
                var barberId = results[0].id;
                response.success(barberId);
            }
            else if ( results.length > 1 )
            {
                response.error("more than one barber found");
            }
            else
            {
                response.error("no barbers found with that name");
            }
        },
        error: function(error)
        {
            console.log("barber name look up failed");
            console.log(error);
            response.error("barber name lookup failed: " + error);
        }
    });
});


///////////////////////////////////////
//
// userWithUserIdExists
//
///////////////////////////////////////
Parse.Cloud.define("userWithUserIdExists", function(request, response)
{
    var userId = request.params.userId;

    conditionalLog("userWithUserIdExists called");
    conditionalLog("with params:");
    conditionalLog("userId [" + userId + "]");

    if (userId === null || userId === "")
    {
        response.error("Must provide userId");
        return;
    }

    conditionalLog("continuing...");

    var User         = Parse.Object.extend("_User");
    var userQuery    = new Parse.Query(User);
    userQuery.equalTo("objectId", userId);
    userQuery.count(
    {
        useMasterKey: true,
        success: function(countResult)
        {
            if ( countResult > 0 )
            {
                response.success(true);
            }
            else
            {
                response.success(false);
            }
        },
        error: function(countError)
        {
            console.log("count error");
            console.log(countError);
            response.error(countError);
        }
    });
});


///////////////////////////////////////
//
// getUserWithUserId
//
///////////////////////////////////////
Parse.Cloud.define("getUserWithId", function(request, response)
{
    var userIdParam = request.params.userId;

    // Check if email exists and return associated user
    Parse.Cloud.run("userWithUserIdExists",
    {
        userId: userIdParam
    },
    {
        useMasterKey: true,
        success: function(existsResult)
        {
            if ( JSON.parse(existsResult) )
            {
                // Get user with id
                var User          = Parse.Object.extend("_User");
                var userQuery     = new Parse.Query(User);
                userQuery.get(userIdParam,
                {
                    useMasterKey: true,
                    success: function(userResult)
                    {
                        response.success(userResult);
                    },
                    error: function(userError)
                    {
                        console.log("user query error");
                        console.log(userError);
                        response.error(userError);
                    }
                });
            }
            else
            {
                response.error("no user found with that ID");
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
// getUserIdForUserWithPhoneNumberEmailAddress
//
///////////////////////////////////////
Parse.Cloud.define("getUserIdForUserWithPhoneNumberEmailAddress", function(request, response)
{
    // Get User's objectId (aka UserId)
    var User            = Parse.Object.extend("_User");
    var userQuery       = new Parse.Query(User);
    userQuery.equalTo("username", request.params.phoneNumber);
    userQuery.equalTo("email", request.params.emailAddress);
    userQuery.find(
    {
        useMasterKey: true,
        success: function(userResult)
        {
            var foundUser = userResult[0];
            response.success(foundUser.objectId);
        },
        error: function(userError)
        {
            conditionalLog("user query error");
            conditionalLog(userError);
            response.error(userError);
        }
    });
});


///////////////////////////////////////
//
// canReplyToUserWithId
//
///////////////////////////////////////
Parse.Cloud.define("canReplyToUserWithId", function(request, response)
{
    conditionalLog("canReplyToUserWithId " + request.params.userId);

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);
    query.equalTo("objectId", request.params.userId);
    query.get(
    {
        useMasterKey: true,
        success: function(result)
        {
            var canReply = result.get("allowsMessages");
            if ( canReply === null )
            {
                canReply = false;
            }
            response.success(canReply);
        },
        error: function(error)
        {
            console.log("ERROR querying user");
            console.log(error);
            response.error("user lookup failed");
        }
    });
});

Parse.Cloud.define("canReplyToUserWithId_B", function(request, response)
{
    conditionalLog("canReplyToUserWithId_B " + request.params.userId);

    var query = new Parse.Query("_User");
    conditionalLog("1");
    query.equalTo("objectId", request.params.userId);
    conditionalLog("2");
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("3");
            if ( results.length === 1 )
            {
                conditionalLog("4");
                var canReply = results[0].get("allowsMessages");
                if ( canReply === null )
                {
                    conditionalLog("5");
                    canReply = false;
                }
                conditionalLog("6 can reply:");
                conditionalLog(canReply);
                response.success(canReply);
            }
            else if ( results.length > 1 )
            {
                conditionalLog("more than one user found");
                response.error("more than one user found");
            }
            else
            {
                conditionalLog("no user found");
                response.error("no user found with that objectId");
            }
        },
        error: function(error)
        {
            console.log("error quering user " + request.params.userId);
            console.log(error);
            response.error("user lookup failed");
        }
    });
});

///////////////////////////////////////
//
// doesMessageToUserWithNoRepeatHashExist
//
///////////////////////////////////////
Parse.Cloud.define("doesMessageToUserWithNoRepeatHashExist", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    var userId = request.params.userId;
    var nrHash = request.params.noRepeat;

    var query = new Parse.Query("Messages");
    query.equalTo("userID", request.params.userId);
    query.equalTo("noRepeat", request.params.noRepeat);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            if ( results.length === 0 )
            {
                response.success(false);
            }
            else
            {
                response.success(true);
            }
        },
        error: function(error)
        {
            console.log("message lookup failed");
            console.log(error);
            response.error("message lookup failed: " + error);
        }
    });
});


///////////////////////////////////////
//
// nameForUserWithObjectId
//
///////////////////////////////////////
Parse.Cloud.define("nameForUserWithObjectId", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    var User = Parse.Object.extend("_User");
    var query = new Parse.Query(User);
    query.get(request.params.objectId,
    {
        useMasterKey: true,
        success: function(object)
        {
            // object is an instance of Parse.Object.
            var firstName = object.get("firstName");
            if ( firstName === null )
            {
                firstName = "";
            }
            var lastName = object.get("lastName");
            if ( lastName === null )
            {
                lastName = "";
            }
            var fullName = firstName.trim() + " " + lastName.trim();

            response.success(fullName.trim());
        },
        error: function(error)
        {
            console.log("unable to get user with object id");
            console.log(error);
            response.error("unable to get user with object id: " + error);
        }
    });
});

///////////////////////////////////////
//
// serviceIdForBarberNameAndServiceName
//
///////////////////////////////////////
Parse.Cloud.define("serviceIdForBarberNameAndServiceName", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    var query = new Parse.Query("Services");
    query.equalTo("barberName", request.params.barberName);
    query.equalTo("serviceName", request.params.serviceName);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            if ( results.length === 1 )
            {
                var service = results[0];
                var isActive = service.get("isActive");
                var serviceId = "";
                if ( isActive === true )
                {
                    serviceId = service.id;
                }
                else
                {
                    var replacement = service.get("replacement");
                    if ( replacement !== null )
                    {
                        serviceId = replacement.id;
                    }
                    else
                    {
                        serviceId = null;
                    }
                }
                response.success(serviceId);
            }
            else if ( results.length > 1 )
            {
                response.error("more than one service found");
            }
            else
            {
                response.error("no services found for barber name and service name");
            }
        },
        error: function(error)
        {
            console.log("service name lookup failed");
            console.log(error);
            response.error("service name lookup failed: " + error);
        }
    });
});


///////////////////////////////////////
//
// serviceIdForServiceIdReplacement
//
///////////////////////////////////////
Parse.Cloud.define("serviceIdForServiceIdReplacement", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // changed equalTo objectId to id 2016 11 07
    var query = new Parse.Query("Services");
    query.equalTo("id", request.params.serviceId);
    query.equalTo("isActive", false);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            if ( results.length === 0 )
            {
                response.success(request.params.serviceId);
            }
            else
            {
                var replacement = results[0].get("replacement");
                response.success(replacement.id);
            }
        },
        error: function(error)
        {
            console.log("service id replacement lookup failed");
            console.log(error);
            response.error("service id replacement lookup failed: " + error);
        }
    });
});

///////////////////////////////////////
//
// servicesForBarberId
//
///////////////////////////////////////
Parse.Cloud.define("servicesForBarberId", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // changed objectId to id
    var query = new Parse.Query("Barbers");
    query.equalTo("id", request.params.barber);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var relation = results[0].get("services");
            var relationQuery = relation.query;
            relationQuery.equalTo("isActive", true);
            relationQuery.find(
            {
                success: function(results)
                {
                    response.success(results);
                },
                error: function(error)
                {
                    console.log("services lookup failed");
                    console.log(error);
                    response.error("services lookup failed: " + error);
                }
            });
        },
        error: function(error2)
        {
            console.log("barber lookup failed");
            console.log(error2);
            response.error("barber lookup failed " + error2);
        }
    });
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
// getUnreadMessageCount
//
///////////////////////////////////////
Parse.Cloud.define("getUnreadMessageCount", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    // Unread Messages
    var query = new Parse.Query("Messages");
    query.equalTo("recipientID", request.params.installId);
    query.doesNotExist("readAt");

    conditionalLog("Getting Unread Messages Count for recipient [" + request.params.installId + "]");

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("SUCCESS: ");
            response.success(results.length);
        },
        error: function(error)
        {
            console.log("ERROR: ");
            console.log(error);
            response.error("unable to get unread messages: " + error);
        }
    });
});


///////////////////////////////////////
//
// getMessageCount
//
///////////////////////////////////////
Parse.Cloud.define("getMessageCount", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    //Parse.Cloud.useMasterKey();
    // Unread Messages

    var query = new Parse.Query("Messages");
    query.equalTo("recipientID", request.params.installId);

    conditionalLog("Getting Messages Count for recipient [" + request.params.installId + "]");

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("SUCCESS: ");
            response.success(results.length);
        },
        error: function(error)
        {
            console.log("ERROR: ");
            response.error("unable to get messages: " + error);
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
// getMessagesCount
//
///////////////////////////////////////
Parse.Cloud.define("getMessagesCount", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // Unread Messages
    var receiverID    = request.params.receiverID;

    var query         = new Parse.Query("Messages");
    query.equalTo("receiverID", receiverID);

    conditionalLog("Getting Messages Count for user [" + receiverID + "]");

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var allMessagesCount = results.length;
            var newMessagesCount = 0;

            var message = null;

            for ( mIdx = 0; mIdx < results.length; mIdx += 1 )
            {
                message = results[mIdx];
                if ( message.has("readAt") )
                {
                    // not new
                }
                else
                {
                    newMessagesCount += 1;
                }
            }
            conditionalLog("messages count: " + allMessagesCount.toString() );
            conditionalLog("unread count:   " + newMessagesCount.toString() );
            conditionalLog("SUCCESS");

            var theResult = { allCount: allMessagesCount, newCount: newMessagesCount };

            response.success(theResult);
        },
        error: function(error)
        {
            console.log("ERROR: ");
            console.log(error);
            response.error("unable to get messages: " + error);
        }
    });
});


///////////////////////////////////////
//
// loginUser
//
///////////////////////////////////////
Parse.Cloud.define("loginUser", function(request, response)
{
    // Phone Number
    var phoneNumber            = request.params.phoneNumber;
    phoneNumber                = phoneNumber.replace(/\D/g, "");

    // Verification Code
    var verificationCode    = request.params.verificationCode;
    verificationCode        = verificationCode.replace(/\D/g, "");

    // User Service Token
    var userServiceToken    = process.env.USER_SERVICE_TOKEN;

    if ( !phoneNumber || phoneNumber.length !== 10 )
    {
        return response.error("Phone Number missing or invalid length");
    }

    if ( !verificationCode || verificationCode.length < 4 || verificationCode.length > 6 )
    {
        return response.error("Verification Code missing or invalid length");
    }

    Parse.User.logIn(phoneNumber, userServiceToken + "-" + verificationCode).then(function (user)
    {
        response.success(user.getSessionToken());
    }
    ,function (loginError)
    {
    response.error(loginError);
    });
});


///////////////////////////////////////
//
// convertMessagesFromDeviceToUser
//
///////////////////////////////////////
Parse.Cloud.define("convertMessagesFromDeviceToUser", function(request, response)
{
response.error("depreciated function, with same params, use all 3 of these instead: convertMessagesFromDeviceRecipientToUserReceiver, convertMessagesFromUserRecipientToUserReceiver, convertMessagesFromUserUserToUserReceiver");
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    //var installId = request.params.installId;
    //var userId = request.params.userId;
    //
    //var query = new Parse.Query("Messages");
    //query.equalTo("recipientID", installId);
    //query.doesNotExist("userID");
    //query.find(
    //{
    //    useMasterKey: true,
    //    success: function(results)
    //    {
    //        console.log("Testing Converting");
    //        console.log("found: " + results.length);
    //        if ( results.length == 0 )
    //        {
    //            response.success("no messages to convert");
    //            //conditionalLog("none to convert");
    //        }
    //        else
    //        {
    //            for ( m = 0; m < results.length; m += 1 )
    //            {
    //                //conditionalLog(results[m].objectId);
    //                if ( m == 0 )
    //                {
    //                    results[m].set("userID", userId);
    //                    results[m].save();
    //                }
    //            }
    //            var count = results.length;
    //            var countStr  = count.toString();
    //            var reply = "converted " + countStr + " messages";
    //            response.success(reply);
    //        }
    //    },
    //    error: function(error)
    //    {
    //        response.error("unable to convert messages " + error);
    //    }
    //});
});


///////////////////////////////////////
//
// convertMessagesFromDeviceRecipientToUserReceiver
//
///////////////////////////////////////
Parse.Cloud.define("convertMessagesFromDeviceRecipientToUserReceiver", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    var installId    = request.params.installId;
    var userId        = request.params.userId;

    var query        = new Parse.Query("Messages");
    query.equalTo("recipientID", installId);
    query.doesNotExist("receiverID");
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var foundStr = results.length.toString();
            conditionalLog("Converting from Install ID In recipientID to User ID in receiverID");
            conditionalLog("found: " + foundStr);

            if ( results.length === 0 )
            {
                response.success("no messages to convert");
                //conditionalLog("none to convert");
            }
            else
            {
                var msgId = null;

                for ( mIdx = 0; mIdx < results.length; mIdx += 1 )
                {
                    msgId = results[mIdx].objectId;
                    conditionalLog("converting msg " + msgId);
                    results[mIdx].set("userID", "-not-used-");
                    results[mIdx].set("recipientID", "-not-used-");
                    results[mIdx].set("receiverID", userId);
                    results[mIdx].save();
                }
                var count        = results.length;
                var countStr    = count.toString();
                var reply        = "converted " + countStr + " messages";
                response.success(reply);
            }
        },
        error: function(error)
        {
            console.log("unable to convert messages:");
            console.log(error);
            response.error("unable to convert messages " + error);
        }
    });
});


///////////////////////////////////////
//
// convertMessagesFromUserRecipientToUserReceiver
//
///////////////////////////////////////
Parse.Cloud.define("convertMessagesFromUserRecipientToUserReceiver", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    var installId    = request.params.installId;
    var userId        = request.params.userId;

    var query        = new Parse.Query("Messages");
    query.equalTo("recipientID", userId);
    query.doesNotExist("receiverID");
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var foundStr = results.length.toString();
            conditionalLog("Converting from User ID in recipientID to receiverID");
            conditionalLog("found: " + foundStr);
            if ( results.length === 0 )
            {
                response.success("no messages to convert");
                //conditionalLog("none to convert");
            }
            else
            {
                for ( mIdx = 0; mIdx < results.length; mIdx += 1 )
                {
                    var msgId = results[mIdx].objectId;
                    conditionalLog("converting msg " + msgId);
                    results[mIdx].set("userID", "-not-used-");
                    results[mIdx].set("recipientID", "-not-used-");
                    results[mIdx].set("receiverID", userId);
                    results[mIdx].save();
                }

                var count        = results.length;
                var countStr    = count.toString();
                var reply        = "converted " + countStr + " messages";
                response.success(reply);
            }
        },
        error: function(error)
        {
            console.log("unable to convert messages");
            console.log(error);
            response.error("unable to convert messages " + error);
        }
    });
});


///////////////////////////////////////
//
// convertMessagesFromUserIDToReceiverID
//
///////////////////////////////////////
Parse.Cloud.define("convertMessagesFromUserUserToUserReceiver", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    var installId    = request.params.installId;
    var userId        = request.params.userId;

    var query        = new Parse.Query("Messages");
    query.equalTo("userID", userId);
    query.doesNotExist("receiverID");
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var foundStr = results.length.toString();
            conditionalLog("Converting from User ID in userID to receiverID");
            conditionalLog("found: " + foundStr);
            if ( results.length === 0 )
            {
                response.success("no messages to convert");
                //conditionalLog("none to convert");
            }
            else
            {
                for ( mIdx = 0; mIdx < results.length; mIdx += 1 )
                {
                    var msgId = results[mIdx].objectId;
                    conditionalLog("converting msg " + msgId);
                    results[mIdx].set("userID", "-not-used-");
                    results[mIdx].set("recipientID", "-not-used-");
                    results[mIdx].set("receiverID", userId);
                    results[mIdx].save();
                }

                var count        = results.length;
                var countStr    = count.toString();
                var reply        = "converted " + countStr + " messages";
                response.success(reply);
            }
        },
        error: function(error)
        {
            console.log("unable to convert messages");
            console.log(error);
            response.error("unable to convert messages " + error);
        }
    });
});


///////////////////////////////////////
//
// convertProductsCartToUserId
//
///////////////////////////////////////
Parse.Cloud.define("convertProductsCartToUserId", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    var installId    = request.params.installId;
    var userId        = request.params.userId;

    var query        = new Parse.Query("Carts");
    query.equalTo("installationId", installId);
    query.doesNotExist("userId");
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var foundStr = results.length.toString();
            conditionalLog("Converting Products Cart from Install ID to User ID");
            conditionalLog("found: " + foundStr);
            if ( results.length === 0 )
            {
                response.success("no carts to convert");
            }
            else
            {
                var cart = results[0];
                var notUsedArray = ["-not-used-"];

                cart.set("installationId", "-not-used-");
                cart.set("productIds",notUsedArray);
                cart.set("userId",userId);
                cart.save();

                for ( cIdx = 1; idx < results.length; idx += 1 )
                {
                    var delCart = results[cIdx];
                    delCart.destroy({});
                }
                var count        = results.length;
                var countStr    = count.toString();
                var reply         = "";
                if ( count === 1 )
                {
                    reply = "the products cart was converted.";
                }
                else
                {
                    reply = "the first of " + countStr + " products carts was converted, others deleted.";
                }
                response.success(reply);
            }
        },
        error: function(error)
        {
            console.log("unable to convert products cart");
            console.log(error);
            response.error("unable to convert products cart " + error);
        }
    });
});


///////////////////////////////////////
//
// resetVerificationCode
//
///////////////////////////////////////
Parse.Cloud.define("resetVerificationCode", function(request, response)
{
    conditionalLog("Starting resetVerificationCode");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;

    conditionalLog("emailAddress [" + emailAddress + "]");
    conditionalLog("phoneNumber [" + phoneNumber + "]");

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);

    query.equalTo("username", phoneNumber);
    query.equalTo("email", emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            conditionalLog("query successful.");
            conditionalLog(results.length + " users found");

            if ( results.length === 0 )
            {
                conditionalLog("No users found to reset");

                var theDesc   = "No users found to reset";
                var theResult = { description: theDesc };

                response.error(theResult);
            }
            else
            {
                conditionalLog("reset first user");

                var firstUser = results[0];

                var userServiceToken = process.env.USER_SERVICE_TOKEN;
                var random  = randomNumberWithNumberOfDigits(5);

                var newPassword = userServiceToken + "-" + random;

                firstUser.set("password", newPassword);
                firstUser.set("gbAssist","RESET");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        conditionalLog("User Verification Code Reset.");
                        //var theResult = { verificationCode: random };
                        response.success(random);
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
            console.log("Query find not successful! ");
            console.log(queryError);
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
                var firstUser = results[0];

                //var messaging    = firstUser.get("allowsMessages");
                //var barberName     = firstUser.get("barberName");
                var emailAddress= firstUser.get("email");
                var userFirstName  = firstUser.get("firstName");
                //var friends    = firstUser.get("friendsRelation");
                var installoids = firstUser.get("installoids");
                //var isStaff    = firstUser.get("isStaffMember");
                var userLastName     = firstUser.get("lastName");
                //var lastSeen    = firstUser.get("lastSeen");
                //var phoneNumber    = firstUser.get("phoneNumber");
                var userStaffId    = firstUser.get("staffID");
                //var userId     = firstUser.get("id");
                var theUsername    = firstUser.get("username");
                //var userRole    = firstUser.get("userRole);

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

                firstUser.set("verificationCode", random);
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

    var emailAddress     = request.params.emailAddress;
    var hashed             = request.params.hashed;
    var phoneNumber      = request.params.phoneNumber;

    conditionalLog("emailAddress [" + emailAddress + "]");
    conditionalLog("phoneNumber [" + phoneNumber + "]");

    var User  = Parse.Object.extend("_User");
    var query = new Parse.Query(User);

    query.equalTo("username", phoneNumber);
    query.equalTo("", emailAddress);
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

                //var messaging    = firstUser.get("allowsMessages");
                //var barberName     = firstUser.get("barberName");
                var emailAddress= firstUser.get("email");
                var userFirstName     = firstUser.get("firstName");
                //var friends    = firstUser.get("friendsRelation");
                var installoids = firstUser.get("installoids");
                //var isStaff    = firstUser.get("isStaffMember");
                var userLastName     = firstUser.get("lastName");
                //var lastSeen    = firstUser.get("lastSeen");
                //var phoneNumber    = firstUser.get("phoneNumber");
                var userStaffId    = firstUser.get("staffID");
                //var userId     = firstUser.get("id");
                var theUsername    = firstUser.get("username");
                //var userRole    = firstUser.get("userRole);

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
    var verification        = randomNumberWithNumberOfDigits(5);
    var token                 = process.env.USER_SERVICE_TOKEN;
    var newPassword            = token + "-" + verification;

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

    var receivingUser    = null;

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
///////////////////////////////////////
///////////////////////////////////////
//
// NOT PUBLIC - INTERNAL ONLY
//
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////


///////////////////////////////////////
//
// randomNumberWithNumberOfDigits - not public
//
///////////////////////////////////////
function randomNumberWithNumberOfDigits(numDigits)
{
    var num = "";

    for(d = 0; d < numDigits; d += 1)
    {
        var min = 0;
        var max = 9;
        var digit = Math.floor(Math.random() * (max - min + 1)) + min;

        num = num + digit.toString();
    }

    return num;
}


///////////////////////////////////////
//
// conditionalLog - not public
//
///////////////////////////////////////
function conditionalLog(logText)
{
    var doLog = process.env.DEBUG_LOG || true;

    if ( doLog === true || doLog === "True" )
    {
        console.log(logText);
    }
}


///////////////////////////////////////
//
// sendVerificationCodeBySmsToPhoneNumber
//
///////////////////////////////////////
function sendVerificationCodeBySmsToPhoneNumber(verificationCode,phoneNumber)
{
    conditionalLog("sendVerificationCodeBySmsToPhoneNumber()");
    conditionalLog("phoneNumber: " + phoneNumber + " vCode [" + verificationCode + "]");

    var tAccountSid     = process.env.TWILIO_ACCOUNT_SID;
    var tAccountToken  = process.env.TWILIO_ACCOUNT_TOKEN;
    var tSendingNumber    = process.env.TWILIO_PHONE_NUMBER;
    var twilio    = require("twilio")(tAccountSid,tAccountToken);

    var tas = tAccountSid.substring(1,5);
    var tat = tAccountToken.substring(1,5);

    conditionalLog("account sid starts " + tas);
    conditionalLog("account token starts " + tat);
    conditionalLog("from phone " + tSendingNumber);

    var message    = "Your Verification Code for the Barbershop Deluxe App is " + verificationCode + ".";

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
        }
        else
        {
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

    var os = require('os');

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
            var message = "Your Barbershop Deluxe app Verification Code is" + os.EOL + verificationCode + os.EOL + "You may be able to tap this link:" + os.EOL + "fourxq.barbershop://vc=" + verificationCode;
            var from    = twilioSendingNumber;

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
    var userId          = currentUser.objectId;

    conditionalLog("Checking [" + userId + "] "+ first + " " + last + " (" + username + ")");

    if ( currentUser === null )
    {
        response.error("missing user");
    }

    var Role        = Parse.Object.extend("_Role");
    var roleQuery   = new Parse.Query(Role);
    roleQuery.exists("name");
    roleQuery.find(
    {
        useMasterKey: true,
        success: function(roleResults)
        {
            var belongsToRoleNames = [];

            for ( rIdx = 0; rIdx < roleResults.length; rIdx += 1 )
            {
                var roleObject  = roleResults[rIdx];
                var roleName    = roleObject.get("name");

                conditionalLog("Checking role '" + roleName + "'");

                var relationQuery = roleObject.relation("users").query();
                relationQuery.equalTo("objectId", currentUser.objectId);
                relationQuery.count(
                {
                    useMasterKey: true,
                    success     : function(userCount)
                    {
                        if ( userCount === 1 )
                        {
                            belongsToRoleNames.push(roleName);
                        }
                    },
                    error: function(userError)
                    {
                        console.log("User Error:");
                        console.log(userError);
                        response.error(userError);
                    }
                });
            }

            conditionalLog("User belongs to:");
            belongsToRoleNames.forEach(function(roleName)
            {
                conditionalLog(roleName);
            });
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
    var userId          = currentUser.objectId;

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
            relationQuery.equalTo("objectId", currentUser.objectId);
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
    var userId          = currentUser.objectId;

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
            relationQuery.equalTo("objectId", currentUser.objectId);
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
                        theResult = { belongs : false };
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

    if ( theUser === null )
    {
        var emailAddress     = request.params.emailAddress;
        var phoneNumber      = request.params.phoneNumber;

        conditionalLog("emailAddress [" + emailAddress + "]");
        conditionalLog("phoneNumber [" + phoneNumber + "]");

        var User = Parse.Object.extend("_User");
        var query = new Parse.Query(User);

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
                    var password    = qUser.get("password");
                    conditionalLog("pass length is ");
                    conditionalLog(password.length.toString);
                    //conditionalLog("pass length is " + password.length.toString);
                    var code        = password.substring(-5);
                    conditionalLog("I have a code ");
                    conditionalLog(code);
                    sendVerificationCodeBySmsToPhoneNumber(code, phoneNumber);
                    response.success(true);
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

