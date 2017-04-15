const CONST = require("./const.js");
var funcs = require("./funcs.js");

///////////////////////////////////////
//
// ROLES AND PERMISSIONS
//
///////////////////////////////////////


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


///////////////////////////////////////
//
// addCurrentUserToRoleWithName
//
// request.user is required
// (just means to be signed in)
//
// Params:
// roleName
//
// Response:
// ARRAY the role names
//
///////////////////////////////////////
Parse.Cloud.define("addCurrentUserToRoleWithName", function(request, response)
{
    funcs.conditionalLog("addCurrentUserToRoleWithName started");

    if ( ( request.user === undefined ) || ( request.user === null ) )
    {
        response.error("Missing Required Parameters");
        return;
    }

    funcs.conditionalLog("Getting params.");

    var roleName    = request.params.roleName;
    var currentUser = request.user;

    var userId      = currentUser.id;

    funcs.conditionalLog("0 userId: " + userId + ", roleName: " + roleName);

    var Role        = Parse.Object.extend(Parse.Role);
    var roleQuery   = new Parse.Query(Role);

    funcs.conditionalLog("0.5");

    roleQuery.equalTo("name", roleName);
    roleQuery.include("users");

    funcs.conditionalLog("1 about to find");

    roleQuery.first(
    {
        userMasterKey: true,
        success: function(roleResult)
        {
            funcs.conditionalLog("2 success getting role result");

            var usersRelation = roleResult.get("users");

            funcs.conditionalLog("2.1");

            var relationQuery = usersRelation.query;
            relationQuery.contains("users",request.user);

            funcs.conditionalLog("2.2");

            relationQuery.find(
            {
                success: function(relationResults)
                {

                    funcs.conditionalLog("2.3");

                    if ( relationResults.length === 0 )
                    {
                        usersRelation.push(request.user);
                        roleResult.save(null,
                        {
                            userMasterKey: true,
                            success: function(saveObject)
                            {
                                // The save was successful.
                                funcs.conditionalLog("3 success saving user to role");
                                response.success(true);
                            },
                            error: function(saveError)
                            {
                                // The save failed.
                                funcs.conditionalLog("4 error saving role");
                                funcs.conditionalLog("it might be if the user was already included");
                                funcs.conditionalLog("the save wouldn't success, because the user");
                                funcs.conditionalLog("wasn't added, therefor the role not changed.");
                                funcs.conditionalLog("check this.");
                                response.error(saveError);
                            }
                        });
                    }
                    else
                    {
                        funcs.conditionalLog("2.4");
                        response.success(true);
                    }
                },
                error: function(relationError)
                {
                    console.log("Error getting relation query");
                    console.log(relationError);

                    response.error(relationError);
                }
            });
        },
        error: function(queryError)
        {
            // Query Failed
            funcs.conditionalLog("Query Failed");
            funcs.conditionalLog(queryError);
            response.error(queryError);
        }
    });
});


Parse.Cloud.define("addCurrentUserToRoleWithRoleName", function(request, response)
{
    funcs.conditionalLog("addCurrentUserToRoleWithRoleName");

    response.error("Depreciated, use 'addCurrentUserToRoleWithName' Instead.");
/*
    var roleName        = request.params.roleName;
    var currentUser     = request.user;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");
    var userId          = currentUser.id;

    funcs.conditionalLog("Checking [" + userId + "] "+ first + " " + last + " (" + username + ")");

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
            funcs.conditionalLog("Have role '" + fRoleName + "'");

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
    */
});


///////////////////////////////////////
//
// doesCurrentUserBelongToRoleWithRoleName
//
///////////////////////////////////////
Parse.Cloud.define("doesCurrentUserBelongToRoleWithRoleName", function(request, response)
{
    funcs.conditionalLog("doesCurrentUserBelongToRoleWithRoleName");

    var roleName        = request.params.roleName;
    var currentUser     = request.user;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");
    var userId          = currentUser.id;

    funcs.conditionalLog("Checking [" + userId + "] "+ first + " " + last + " (" + username + ")");

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
            funcs.conditionalLog("Have role '" + roleName + "'");

            var relationQuery = roleObject.relation("users").query();
            relationQuery.get(userId,
            {
                useMasterKey: true,
                success     : function(userResult)
                {
                    funcs.conditionalLog("User belongs to role " + roleName);

                    var theResult = { belongs: true };
                    response.success(theResult);
                },
                error       : function(userError)
                {
                    funcs.conditionalLog("User does not belong to role " + roleName);
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
// getRoleNamesForCurrentUser
//
///////////////////////////////////////
Parse.Cloud.define("getRoleNamesForCurrentUser", function(request, response)
{
    funcs.conditionalLog("getRoleNamesForCurrentUser");

    var currentUser     = request.user;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");

    var userId          = request.user.id;

    funcs.conditionalLog("Checking [" + userId + "] " + first + " " + last + " (" + username + ")");
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

                funcs.conditionalLog("Checking role '" + roleName + "' for '" + userId + "'");

                var relationQuery = roleObject.relation("users").query();
                relationQuery.get(userId,
                {
                    useMasterKey: true,
                    success     : function(userResult)
                    {
                        funcs.conditionalLog("User belongs to role " + roleName);

                        belongsToRoleNames.push(roleName);

                        funcs.conditionalLog("Belongs to these roles:");
                        funcs.conditionalLog(belongsToRoleNames);
                    },
                    error       : function(userError)
                    {
                        funcs.conditionalLog("User does not belong to role " + roleName);
                        //funcs.conditionalLog(userError);
                    }
                });
            }

            funcs.conditionalLog("User belongs to:");
            funcs.conditionalLog(belongsToRoleNames);
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
