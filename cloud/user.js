const CONST = require("./const.js");
var funcs = require("./funcs.js");

///////////////////////////////////////
//
// determineHowToHandleUserWith
//
// Params:
// emailAddress
// phoneNumber
// verificationCode
// firstName
// lastName
//
// Success Response:
// Dictionary:
// action       Action Responses, see constants
// description  A description (non-static text) of action
// error        If a non-fatal error happened, it may be included
//
// sessionToken is include when CONST.ACTION_USER_LOGGED_IN
///////////////////////////////////////
Parse.Cloud.define("determineHowToHandleUserWith", function(request, response)
{
/*
                                    EmailAddress:(NSString *)emailAddress
									 phoneNumber:(NSString *)phoneNumber
								verificationCode:(NSString *)verificationCode
									   firstName:(NSString *)firstName
										lastName:(NSString *)lastName
*/
    funcs.conditionalLog("*");
    funcs.conditionalLog("*");
    funcs.conditionalLog("determineHowToHandleUserWith has begun.");
    funcs.conditionalLog("*");
    funcs.conditionalLog("*");

    if ( ( request.params.emailAddress === undefined ) ||
         ( request.params.phoneNumber === undefined  ) ||
         ( request.params.firstName === undefined    ) ||
         ( request.params.lastName === undefined     ) )
    {
        response.error("Missing Required Parameters.");
    }

    funcs.conditionalLog("1");

    var verificationCode    = "";
    if ( request.params.verificationCode.length > 0 )
    {
        verificationCode    = request.params.verificationCode;
        verificationCode    = verificationCode.replace(/\D/g, "");
    }

    funcs.conditionalLog("2");

    var pmPhoneNumber       = request.params.phoneNumber;
    pmPhoneNumber           = pmPhoneNumber.replace(/\D/g, "");

    var pmEmailAddress      = request.params.emailAddress;
    var pmFirstName         = request.params.firstName;
    var pmLastName          = request.params.lastName;

    var theResult           = {};

    funcs.conditionalLog("3");

    if ( request.user )
    {
        // Current User Passed
        funcs.conditionalLog("Current User Passed");

        var cuFirstName     = request.user.get("firstName");
        var cuLastName      = request.user.get("lastName");

        // Current User Exists, compare information
        if ( request.user.username === pmEmailAddress )
        {
            funcs.conditionalLog("Username is email address");

            if ( ( cuFirstName === pmFirstName ) &&
                 ( cuLastName === pmLastName ) )
            {
                // First and Last Names match
                funcs.conditionalLog("First and Last names match");
                funcs.conditionalLog("Convert User to Version 2");

                theResult   = {
                                action : ( CONST.ACTION_USER_CONVERT ),
                                description: "Convert user to version 2"
                              };
            }
            else
            {
                // First and Last Names don't match
                funcs.conditionalLog("First and Last names don't match");
                funcs.conditionalLog("Convert User after Verifying");

                theResult   = {
                                action : ( CONST.ACTION_USER_CONVERT | CONST.ACTION_USER_VERIFY ),
                                description: "Convert user to version 1; Verify user"
                              };
            }
            response.success(theResult);
        }
        else if ( request.user.username === pmPhoneNumber )
        {
            // Username is Phone Number
            if ( ( cuFirstName === pmFirstName  ) &&
                 ( cuLastName === pmLastName    ) )
            {
                // First and Last Names match
                funcs.conditionalLog("First and Last names match");

                if ( verificationCode.length > 0 )
                {
                    // Have a verification code, attempt to login
                    funcs.conditionalLog("Have a Verification Code");

                    var username    = pmPhoneNumber;
                    var token       = process.env.USER_SERVICE_TOKEN;
                    var password    = token + "-" + verificationCode;

                    Parse.User.logIn(username, password,
                    {
                        success: function(tempUser)
                        {
                            // Was able to login with the passed verification code, so have the correct user
                            theResult   = {
                                            action : ( CONST.ACTION_USER_ACTIVE | CONST.ACTION_USER_LOGGED_IN ),
                                            description : "Current User Verified",
                                            sessionToken : tempUser.getSessionToken()
                                          };
                            response.success(theResult);
                        },
                        error: function(tempUser, error)
                        {
                            // The login failed. Check error to see why.
                            theResult   = {
                                            action: ( CONST.ACTION_USER_VERIFY |
                                                      CONST.ACTION_USER_INVALID_VCODE ),
                                            description: "Verify User",
                                            parseError: error
                                          };
                            response.success(theResult);
                        }
                    });
                }
                else
                {
                    // No Verification Code
                    try
                    {
                        funcs.conditionalLog("Verify User:");
                        funcs.conditionalLog(CONST.ACTION_USER_VERIFY.toString);
                        theResult   = {
                                    action : ( CONST.ACTION_USER_VERIFY ),
                                    description: "Verify User"
                                      };
                        response.success(theResult);
                    }
                    catch (e)
                    {
                        funcs.conditionalLog("Error with CONST.ACTION_USER_VERIFY");
                        response.error(e);
                    }
                    finally {}
                    /*
                    theResult   = {
                                    action : ( CONST.ACTION_USER_VERIFY ),
                                    description: "Verify User"
                                  };
                    */
                }
            }
            else
            {
                // First and Last Names don't match
                theResult   = {
                                action : ( CONST.ACTION_USER_VERIFY ),
                                description: "Verify User"
                              };
                response.success(theResult);
            }
        }
    }

    funcs.conditionalLog("4");

    // Either
    // No Current User Passed
    // Or Current User Doesn't Match Passed Info
    // Check Passed Info

    var phoneQuery          = new Parse.Query(Parse.User);
    phoneQuery.equalTo("phoneNumber", pmPhoneNumber);

    funcs.conditionalLog("5");

    var emailQuery          = new Parse.Query(Parse.User);
    emailQuery.equalTo("email", pmEmailAddress);

    funcs.conditionalLog("6");

    var orQuery             = Parse.Query.or(phoneQuery, emailQuery);
    orQuery.find(
    {
        useMasterKey: true,
        success: function(usersResults)
        {
            funcs.conditionalLog("or S 1");
            funcs.conditionalLog(usersResults.length.toString + " users found");

            if ( usersResults.length === 0 )
            {
                funcs.conditionalLog("or S 1.1");

                theResult   = {
                                action : ( CONST.ACTION_USER_CREATE ),
                                description : "No user found with username as email address or phone number"
                              };
                funcs.conditionalLog("or S 1.2");

                response.success(theResult);
            }
            else
            {
                // query found one or more users

                funcs.conditionalLog("or S 2");

                var foundUser       = null;
                var userVersion     = 0;

                funcs.conditionalLog("Comparing To:");
                funcs.conditionalLog("email [" + pmEmailAddress + "]");
                funcs.conditionalLog("phone [" + pmPhoneNumber + "]");
                funcs.conditionalLog("first [" + pmFirstName + "]");
                funcs.conditionalLog("last [" + pmLastName + "]");

                for ( uIdx = 0; uIdx < usersResults.length; uIdx = (uIdx + 1) )
                {
                    // Loop through matching users (should only be 0, 1, or 2)
                    var thisUser    = usersResults[uIdx];
                    var tuUsername  = thisUser.get("username");
                    var tuFirstname = thisUser.get("firstName");
                    var tuLastName  = thisUser.get("lastName");

                    funcs.conditionalLog("tuF [" + tuFirstname + "]");
                    funcs.conditionalLog("tuL [" + tuLastName + "]");
                    funcs.conditionalLog("tuU [" + tuUsername + "]");

                    if ( tuUsername === pmPhoneNumber )
                    {
                        // Username matches phone Number
                        funcs.conditionalLog("Username matches phone number");

                        if ( ( tuFirstname === pmFirstName ) &&
                             ( tuLastName  === pmLastName  ) )
                        {
                            funcs.conditionalLog("Found User");
                            // First and Last Names match, and have Verification Code
                            // Assign to foundUser, then verify credentials
                            foundUser   = thisUser;
                            userVersion = 2;
                            break;
                        }
                    }
                    else if ( tuUsername === pmEmailAddress )
                    {
                        // Username matches emailAddress
                        funcs.conditionalLog("username matches email address");

                        if ( ( tuFirstname === pmFirstName ) &&
                             ( tuLastName  === pmLastName ) )
                        {
                            // First and Last Names match,
                            // Assign to foundUser, then verify credentials
                            funcs.conditionalLog("Found User");

                            foundUser   = thisUser;
                            userVersion = 1;
                            break;
                        }
                    }
                    else
                    {
                        // Nothing to do if email and phone don't match
                        // Although should never get here since the orQuery is for them
                        console.log("Check This Function, shouldn't get this code");
                    }
                }

                funcs.conditionalLog("7");

                if ( foundUser !== null )
                {
                    funcs.conditionalLog("Have a user");

                    if ( userVersion === 1 )
                    {
                        // User found, with email address as username
                        funcs.conditionalLog("Version 1 User");

                        theResult   = {
                                        action : ( CONST.ACTION_USER_CONVERT | CONST.ACTION_USER_VERIFY ),
                                        description : "Found user matching email address, first, and last names, verify and convert."
                                      };
                        response.success(theResult);
                    }
                    else if ( userVersion === 2 )
                    {
                        // User found, with phone number as username
                        funcs.conditionalLog("Version 2 User");

                        if ( verificationCode.length > 0 )
                        {
                            funcs.conditionalLog("Have a Verification Code");

                            var username    = pmPhoneNumber;
                            var token       = process.env.USER_SERVICE_TOKEN;
                            var password    = token + "-" + verificationCode;

                            Parse.User.logIn(username, password,
                            {
                                success: function(tempUser)
                                {
                                    // Was able to login with the passed verification code, so have the correct user
                                    theResult   = {
                                                    action : ( CONST.ACTION_USER_LOGGED_IN ),
                                                    description : "Current User Verified",
                                                    sessionToken : tempUser.getSessionToken()
                                                  };
                                    response.success(theResult);
                                },
                                error: function(tempUser, tempError)
                                {
                                    // The login failed. Check error to see why.
                                    theResult   = {
                                                    action: ( CONST.ACTION_USER_VERIFY ),
                                                    description: "Verify User",
                                                    error: tempError
                                                  };
                                    response.success(theResult);
                                }
                            });
                        }
                        else
                        {
                            // No Verification Code
                            funcs.conditionalLog("No Verification Code");

                            theResult   = {
                                            action : ( CONST.ACTION_USER_VERIFY ),
                                            description: "Verify User"
                                          };
                            response.success(theResult);
                        }
                    }
                }
                else
                {
                    // No User Found,
                    // Think I can advise to createResult
                    funcs.conditionalLog("No User Found");

                    theResult   = {
                                    action: ( CONST.ACTION_USER_CREATE ),
                                    description: "No User Found"
                                  };
                    response.success(theResult);
                }
            }
        },
        error: function(usersError)
        {
            console.log("Error in orQuery");
            console.log(usersError);

            response.error(usersError);
        }
    });
});


///////////////////////////////////////
//
// getUserIdForUserWithPhoneNumberEmailAddress
//
// Params:
// phoneNumber (10 digit for North America)
// emailAddress
//
// Response:
// STRING PFUser objectId
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
            response.success(foundUser.id);
            // above was foundUser.objectId
        },
        error: function(userError)
        {
            funcs.conditionalLog("user query error");
            funcs.conditionalLog(userError);
            response.error(userError);
        }
    });
});


///////////////////////////////////////
//
// getUserWithUserId
//
// Params:
// userId
//
// Response:
// PFUser object
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
            response.success(foundUser.id);
            // above was foundUser.objectId
        },
        error: function(userError)
        {
            funcs.conditionalLog("user query error");
            funcs.conditionalLog(userError);
            response.error(userError);
        }
    });
});



///////////////////////////////////////
//
// getUsernameAndIdForUserWithPhoneNumberEmailAddress
//
// Params:
// phoneNumber
// emailAddress
//
// Response:
// Dictionary
// userCount            NUMBER  Number of users that match
// foundPhoneNumber     BOOL    whether a user with this phone number exists
// foundEmailAddress    BOOL    whether a user with this email address exists
// matchedBoth          BOOL    whether a user with both exists
// description          STRING
// username             STRING
// userId               STRING  User's objectId
//
///////////////////////////////////////
Parse.Cloud.define("getUsernameAndIdForUserWithPhoneNumberEmailAddress", function(request, response)
{
    // Get User's objectId (aka UserId)
    //var User            = Parse.Object.extend("_User");
    //var userQuery       = new Parse.Query(User);
    var phoneNumber     = request.params.phoneNumber;
    var emailAddress    = request.params.emailAddress;

    var phoneQuery      = new Parse.Query(Parse.User);
    phoneQuery.equalTo("phoneNumber", request.params.phoneNumber);

    var emailQuery      = new Parse.Query(Parse.User);
    emailQuery.equalTo("email", request.params.emailAddress);

    var orQuery         = Parse.Query.or(phoneQuery, emailQuery);
    orQuery.find(
    {
        useMasterKey: true,
        success: function(userResults)
        {
            var theResult   = null;

            if ( userResults.length === 0 )
            {
                theResult =
                {
                    userCount : 0,
                    foundPhoneNumber : false,
                    foundEmailAddress : false,
                    matchedBoth : false,
                    description : "No user found with passed phoneNumber or passed emailAddress"
                };
                response.success(theResult);
            }
            else
            {
                var foundPhone  = false;
                var foundEmail  = false;
                var count       = userResults.length;

                for ( uIdx = 0; uIdx < userResults.length; uIdx += 1 )
                {
                    var thisUser    = userResults[uIdx];
                    var thisPhone   = thisUser.get("phoneNumber");
                    var thisEmail   = thisUser.get("email");

                    if ( ( thisEmail === request.params.emailAddress ) &&
                         ( thisPhone === request.params.phoneNumber  ) )
                    {
                        theResult   =
                        {
                            userCount : count,
                            foundPhoneNumber : true,
                            foundEmailAddress : true,
                            matchedBoth : true,
                            description : "Found user with passed phoneNumber and passed emailAddress",
                            username : thisUser.get("username"),
                            userId : thisUser.id
                        };

                        response.success(theResult);
                    }
                    else if ( thisEmail === request.params.emailAddress )
                    {
                        foundEmail = true;
                    }
                    else if ( thisPhone === request.params.phoneNumber )
                    {
                        foundPhone = true;
                    }
                // End of For Loop
                }

                theResult =
                {
                    userCount : count,
                    foundPhoneNumber : foundPhone,
                    foundEmailAddress : foundEmail,
                    matchedBoth : false,
                    description: "No user found with both passed phoneNumber and passed emailAddress"
                };
                response.success(theResult);
            }
        },
        error: function(userError)
        {
            funcs.conditionalLog("user query error");
            funcs.conditionalLog(userError);
            response.error(userError);
        }
    });
});


///////////////////////////////////////
//
// loginUser
//
// Params:
// phoneNumber      STRING (North America 10 digits)
// verificationCode STRING  verification code (4 - 6 digits)
//
// Response:
// STRING   The user's session token
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
// nameForUserWithObjectId
//
// Params:
// objectId STRING PFUser objectId
//
// Reponse:
// STRING   User's full name
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
// resetVerificationCode
//
// NOTE:
// May not use this, look at StepOne and StepTwo instead
// The problem with this, someone else could trigger your account
// To be reset, intentionally or not, then you are locked out
//
// Params:
// emailAddress
// phoneNumber
//
// Response:
// STRING   new Verification Code
//
///////////////////////////////////////
Parse.Cloud.define("resetVerificationCode", function(request, response)
{
    funcs.conditionalLog("Starting resetVerificationCode");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;

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
            funcs.conditionalLog("query successful.");
            funcs.conditionalLog(results.length + " users found");

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No users found to reset");

                var theDesc   = "No users found to reset";
                var theResult = { description: theDesc };

                response.error(theResult);
            }
            else
            {
                funcs.conditionalLog("reset first user");

                var firstUser = results[0];

                var userServiceToken = process.env.USER_SERVICE_TOKEN;
                var random  = funcs.randomNumberWithNumberOfDigits(5);

                var newPassword = userServiceToken + "-" + random;

                firstUser.set("password", newPassword);
                firstUser.set("gbAssist","RESET");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        funcs.conditionalLog("User Verification Code Reset.");
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
// resetVerificationCodeStepOne
//
///////////////////////////////////////
Parse.Cloud.define("resetVerificationCodeStepOne", function(request, response)
{
    funcs.conditionalLog("Starting resetVerificationCodeStepOne");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;

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
            funcs.conditionalLog("query successful.");
            funcs.conditionalLog(results.length + " users found");

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No users found to reset");

                var theDesc   = "No users found to reset";
                response.error(theDesc);
            }
            else
            {
                funcs.conditionalLog("reset first user");

                var firstUser = results[0];

                var vcode  = funcs.randomNumberWithNumberOfDigits(5);

                firstUser.set("verificationCode", vcode);
                firstUser.set("gbAssist","RESET1");
                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        funcs.conditionalLog("User Verification Code Saved, sending text.");
                        // Send Text
                        Parse.Cloud.run("sendVerificationCodeBySmsToPhoneNumber",
                        {
                            phoneNumber: phoneNumber,
                            verificationCode: vcode
                        },
                        {
                            useMasterKey: true,
                            success: function(smsResult)
                            {
                                funcs.conditionalLog("SMS Sent");
                                funcs.conditionalLog(smsResult);
                                response.success(true);
                            },
                            error: function(smsError)
                            {
                                console.log("Error sending SMS");
                                console.log(smsError);
                                response.error(smsError);
                            }
                        });
                    },
                    error: function(saveError)
                    {
                        console.log("unable to save user");
                        console.log(saveError);
                        response.error(saveError);
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
// resetVerificationCodeStepTwo
//
///////////////////////////////////////
Parse.Cloud.define("resetVerificationCodeStepTwo", function(request, response)
{
    funcs.conditionalLog("Starting resetVerificationCode");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;
    var verificationCode = request.params.verificationCode;

    funcs.conditionalLog("emailAddress [" + emailAddress + "]");
    funcs.conditionalLog("phoneNumber [" + phoneNumber + "]");
    funcs.conditionalLog("verificationCode [" + verificationCode + "]");

    var query = new Parse.Query(Parse.User);

    query.equalTo("username", phoneNumber);
    query.equalTo("email", emailAddress);
    query.equalTo("verificationCode", verificationCode);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("query successful.");
            funcs.conditionalLog(results.length + " users found");

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No users found to reset");

                var theDesc   = "No users found to reset";
                var theResult = { description: theDesc };

                response.error(theResult);
            }
            else
            {
                funcs.conditionalLog("reset first user");

                var firstUser           = results[0];

                var userServiceToken    = process.env.USER_SERVICE_TOKEN;
                var newPassword         = userServiceToken + "-" + verificationCode;

                firstUser.set("password", newPassword);
                firstUser.set("gbAssist","RESET");
                firstUser.set("verificationCode","");

                firstUser.save(null,
                {
                    useMasterKey: true,
                    success: function(savedUser)
                    {
                        funcs.conditionalLog("User Verification Reset Finished.");
                        var theResult = { success: true };
                        response.success(theResult);
                    },
                    error: function(saveError)
                    {
                        console.log("unable to save user");
                        console.log(saveError);
                        response.error(saveError);
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
// verifyVerificationCode
//
///////////////////////////////////////
Parse.Cloud.define("verifyVerificationCode", function(request, response)
{
    funcs.conditionalLog("Starting verifyVerificationCode");

    var emailAddress     = request.params.emailAddress;
    var phoneNumber      = request.params.phoneNumber;
    var verificationCode = request.params.verificationCode;

    var mask             = "XXXXXXXX";
    mask                 = mask.substr(0,verificationCode.length);

    funcs.conditionalLog("emailAddress     [" + emailAddress + "]");
    funcs.conditionalLog("phoneNumber      [" + phoneNumber + "]");
    funcs.conditionalLog("verificationCode [" + mask + "]");

    var query = new Parse.Query(Parse.User);

    query.equalTo("username", phoneNumber);
    query.equalTo("email", emailAddress);
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("query successful.");
            funcs.conditionalLog(results.length + " users found");

            var theDesc;
            var theResult;

            if ( results.length === 0 )
            {
                funcs.conditionalLog("No users found to verify");

                theDesc             = "No users found to verify";
                theResult           = { description : theDesc };

                response.error(theResult);
            }
            else
            {
                funcs.conditionalLog("verify first user");

                var firstUser           = results[0];

                var userToken           = process.env.USER_SERVICE_TOKEN;

                funcs.conditionalLog("vVC-1");

                var tokenLength         = userToken.length;

                funcs.conditionalLog("the token's length is:");
                funcs.conditionalLog(tokenLength.toString());

                funcs.conditionalLog("vVC-1.1");

                var fup                 = firstUser.get("password");

                funcs.conditionalLog("vVC-1.2");

                funcs.conditionalLog("fup length is:");
                var fl  = fup.length;

                funcs.conditionalLog(fup.length.toString());

                var idx                 = fup.search(userToken);

                funcs.conditionalLog("user index is:");
                funcs.conditionalLog(idx.toString());

                if ( idx === -1 )
                {
                    funcs.conditionalLog("vVC-2");

                    theDesc          = "User Token not found.";
                    theResult        = { description : theDesc };

                    funcs.conditionalLog(theDesc);
                    response.error(theResult);
                }
                else
                {
                    funcs.conditionalLog("vVC-3");

                    idx             = (idx + tokenLength);
                    funcs.conditionalLog("New User Index is:");
                    funcs.conditionalLog(idx.toString());

                    var code        = firstUser.password.substr(idx);

                    funcs.conditionalLog("REMOVE THESE LINES");
                    funcs.conditionalLog("error code [" + code + "]");
                    funcs.conditionalLog("REMOVE THESE LINES");

                    var isValid     = ( verificationCode === code );

                    theDesc         = "Verification Successful";
                    theResult       = { description : theDesc,
                                        valid : isValid
                                      };

                    response.success(theResult);
                }
            }
        },
        error: function(queryError)
        {
            console.log("Query find not successful!");
            console.log(queryError);
            response.error(queryError);
        }
    });
});


///////////////////////////////////////
//
// userWithUserIdExists
//
// Params:
// userId
//
// Response:
// BOOL whether user exists or not
//
///////////////////////////////////////
Parse.Cloud.define("userWithUserIdExists", function(request, response)
{
    var userId = request.params.userId;

    funcs.conditionalLog("userWithUserIdExists called");
    funcs.conditionalLog("with params:");
    funcs.conditionalLog("userId [" + userId + "]");

    if (userId === null || userId === "")
    {
        response.error("Must provide userId");
        return;
    }

    funcs.conditionalLog("continuing...");

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
// ROLES SECTION
//
///////////////////////////////////////

///////////////////////////////////////
//
// getNamesOfRolesCurrentUserBelongsTo
//
// Params:
// Current User
//
// Response:
// ARRAY the role names
//
///////////////////////////////////////
Parse.Cloud.define("getNamesOfRolesCurrentUserBelongsTo", function(request, response)
{
    funcs.conditionalLog("getNamesOfRolesCurrentUserBelongsTo started");
    //response.error("The method is not functional yet, needs to be debugged.");

    var Role        = Parse.Object.extend(Parse.Role);
    var roleQuery   = new Parse.Query(Role);
    var namesResult = [];

    funcs.conditionalLog("1");

    roleQuery.each(function(roleObject)
    {
        // Base Role
        funcs.conditionalLog("2");

        var theName = roleObject.get("name");

        namesResult.push(theName);

        funcs.conditionalLog("3 pushed " + theName);

        var roleRelation = roleObject.relation("roles");

        funcs.conditionalLog("4 have relatedRoles");

        relatedRole.query().find().then(
        function(roleList)
        {
            // do stuff
            // push the foos to an array to have them acessable later

            if ( roleList.length == 0 )
            {
                funcs.conditionalLog("no related roles");
            }
            else
            {
                roleList.forEach(function (relRole)
                {
                    funcs.conditionalLog("5 in forEach function relRole,");
                    funcs.conditionalLog("with relRole:");
                    funcs.conditionalLog(relRole);

                    funcs.conditionalLog("5.5");

                    var rrObjectId  = relRole.objectId;

                    funcs.conditionalLog("5.6 " + rrObjectId);

                    var rrName      = relRole.get("name");

                    funcs.conditionalLog("5.7 " + rrName);

                    namesResult.push(rrName);

                     funcs.conditionalLog("7 pushed the name");

                    // just to return something successfully.
                    // The iteration will only continue
                    // if a promise is returned successfully
                    // https://parse.com/docs/js/api/classes/Parse.Query.html#methods_each

                    funcs.conditionalLog("8 returning the promise as role");
                });
            }
            return Parse.Promise.as(role);
        },
        function( promiseError)
        {
            funcs.conditionalLog("9 Promise Error:");
            console.log(promiseError);

            response.error(promiseError);
        });
    },
    function( promiseError )
    {
        funcs.conditionalLog("10 Promise Error:");
        console.log(promiseError);

        response.error(promiseError);
    }).
    then(function ()
    {
        funcs.conditionalLog("11 Success ?");
        funcs.conditionalLog(namesResult.length());
        funcs.conditionalLog(namesResult);

        response.success(namesResult);
    },
    function(responseError)
    {
        funcs.conditionalLog("12 Response Error");
        funcs.conditionalLog(responseError);

        response.error(responseError);
    });

});
/*
Parse.Cloud.define("getNamesOfRolesCurrentUserBelongsTo", function(request, response)
{
    funcs.conditionalLog("In getNamesOfRolesCurrentUserBelongsTo");

    if ( request.user === undefined || request.user === null )
    {
        funcs.conditionalLog("No User passed, unable to continue");
        response.error("No User passed");
        return;
    }

    funcs.conditionalLog("1");

    var roleNamesResult = new Array();

    var Role        = Parse.Role.extend();
    var roleQuery   = new Parse.Query(Role);

    roleQuery.includeKey("users");

    funcs.conditionalLog("2");

    roleQuery.find().then(function(roleResults)
    {
        funcs.conditionalLog("3");

        var cbCallBack      = _.after(roleResults.length, function()
        {
            // Call Back Data
            funcs.conditionalLog("4");

            return roleNamesResult;
        });

        _.each(roleResults, function(role)
        {
            // Get the relations
            funcs.conditionalLog("5");

            roleNamesResult.push(
            {
                role.get("name")
            });

            var innerRoles    = role.relation("roles");

            funcs.conditionalLog("6");

            innerRoles.query().find().then(function(innerRoles)
            {
                funcs.conditionalLog("7");

                roleNamesResult.push(
                {
                    role.get("name")
                });

                funcs.conditionalLog("8");

                cbCallBack();

                funcs.conditionalLog("9");

            });
        });
    });
});
*/

/*
	// Using PFQuery
	[roleQuery whereKey:@"users"
				equalTo:[PFUser objectWithoutDataWithObjectId:PFUser.currentUser.objectId]];
	[roleQuery findObjectsInBackgroundWithBlock:^(NSArray<PFRole *>* _Nullable objects,
												  NSError * _Nullable error)
	{
		if ( error )
		{
			XQLog(@"Error with my query:\n%@\n%@", error.description, error.userInfo);
		}

		for (PFObject *role in objects)
		{
			[role fetchIfNeeded];
			NSString *roleName	= role[@"name"];
			XQLog(@"Main Role: %@", roleName);
			[belongsTo addObject:roleName];

			PFRelation *rolesRelation	= role[@"roles"];
			PFQuery *innerQuery = [rolesRelation query];

			[innerQuery findObjectsInBackgroundWithBlock:^(NSArray<PFRole *> * _Nullable objects,
														   NSError * _Nullable error)
			{
				for (PFRole *inRole in objects)
				{
					[inRole fetchIfNeeded];
					NSString *inRoleName	= inRole[@"name"];
					XQLog(@"\tInner Role: %@", inRoleName);
					[belongsTo addObject:inRoleName];
				}
			}];
		}
	}];

});
*/