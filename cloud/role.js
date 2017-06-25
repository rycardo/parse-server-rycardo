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

    if ( ( request.user === undefined ) ||
         ( request.user === null ) ||
         ( request.params.roleName === undefined ) ||
         ( request.params.roleName === null ) )
    {
        response.error("Missing Required Parameters");
        return;
    }

    /*
     * var roleName    = request.params.roleName;
     * var userId      = request.params.userId;
     */

    Parse.Cloud.run("addUserWithIdToRoleWithName",
    {
        userId: request.user.id,
        roleName: request.params.roleName

    },
    {
        useMasterKey: true,
        success: function(addResult)
        {
            response.success(true);
        },
        error: function(addError)
        {
            response.error(addError);
        }
    });
    /*
    funcs.conditionalLog("Getting params.");

    var roleName    = request.params.roleName;
    var currentUser = request.user;
    var userId      = currentUser.id;

    funcs.conditionalLog("0 userId: " + userId + ", roleName: " + roleName);

    var Role        = Parse.Object.extend("_Role");
    var roleQuery   = new Parse.Query(Role);

    funcs.conditionalLog("0.1");

    var userQuery   = new Parse.Query(Parse.User);
    userQuery.equalTo("id", userId);

    funcs.conditionalLog("0.2");

    roleQuery.equalTo("name", roleName);
    roleQuery.include("users");

    funcs.conditionalLog("0.3");

    roleQuery.doesNotMatchQuery("users", userQuery);

    funcs.conditionalLog("1 about to find");

    roleQuery.first(
    {
        useMasterKey: true,
        success: function(roleResult)
        {
            funcs.conditionalLog("2 success getting role result");

            var usersRelation   = roleResult.get("users");

            funcs.conditionalLog("2.1");

            usersRelation.push(request.user);

            roleResult.save(null,
            {
                useMasterKey: true,
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
        },
        error: function(queryError)
        {
            // Query Failed
            funcs.conditionalLog("Query Failed");
            funcs.conditionalLog(queryError);
            response.error(queryError);
        }
    });
    */
});


///////////////////////////////////////
//
// addUserWithIdToRoleWithName
//
// Params:
// userId
// roleName
//
// Response:
// BOOL sucessful
//
///////////////////////////////////////
Parse.Cloud.define("addUserWithIdToRoleWithName", function(request, response)
{
    funcs.conditionalLog("addUserWithIdToRoleWithName started");

    if ( ( request.params.userId === undefined ) || ( request.params.userId === null ) )
    {
        response.error("Missing Required Parameters");
        return;
    }

    funcs.conditionalLog("Getting params.");

    var roleName    = request.params.roleName;
    var userId      = request.params.userId;

    funcs.conditionalLog("0 userId: " + userId + ", roleName: " + roleName);

    var Role        = Parse.Object.extend("_Role");
    var roleQuery   = new Parse.Query(Role);

    funcs.conditionalLog("0.1");

    var userQuery   = new Parse.Query(Parse.User);
    userQuery.equalTo("id", userId);

    funcs.conditionalLog("0.2");

    roleQuery.equalTo("name", roleName);
    roleQuery.include("users");

    funcs.conditionalLog("0.3");

    roleQuery.doesNotMatchQuery("users", userQuery);

    funcs.conditionalLog("1 about to find");

    roleQuery.first(
    {
        useMasterKey: true,
        success: function(roleResult)
        {
            funcs.conditionalLog("2 success getting role result");

            var usersRelation   = roleResult.get("users");

            funcs.conditionalLog("2.1");

            usersRelation.push(request.user);

            roleResult.save(null,
            {
                useMasterKey: true,
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


///////////////////////////////////////
//
// getRoleNamesForUserWithId
//
// Params:
// userId
//
// Response:
// ARRAY the role names
//
///////////////////////////////////////
Parse.Cloud.define("getRoleNamesForUserWithId", function(request, response)
{
    funcs.conditionalLog("getRoleNamesForUserWithId");

    var userId          = request.params.userId;

    var first           = currentUser.get("firstName");
    var last            = currentUser.get("lastName");
    var username        = currentUser.get("username");

    funcs.conditionalLog("Checking [" + userId + "]");
    if ( ( userId === null ) || ( userId === undefined ) )
    {
        response.error("missing user id");
    }

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

///////////////////////////////////////
//
// modifyRolesOfUserWithUserId
//
// Params:
// userId         String PFUser.objectId
// addRoles       Array Roles to add
// removeRoles    Array Roles to remove
//
// NOTE:
// addRoles or removeRoles is required
// both can be included as well
//
// Response:
// ARRAY the roles after modified
//
///////////////////////////////////////
Parse.Cloud.define("modifyRolesOfUserWithUserId", function(request, response)
{
    funcs.conditionalLog("modifyRolesOfUserWithUserId");

    if ( ( ( request.params.addRoles === undefined ) &&
         ( request.params.removeRoles === undefined ) ) ||
       ( request.params.userId === undefined ) )
    {
        response.error("missing required parameters");
    }

    var addRolesEh      = false;
    var removeRolesEh   = false;

    if ( request.params.addRoles !== undefined )
    {
        addRolesEh      = true;
    }
    if ( request.params.removeRoles !== undefined )
    {
        removeRolesEh   = true;
    }

    var userId          = request.params.userId;
    funcs.conditionalLog("0 with userId [" + userId + "]");

    Parse.Cloud.run("getUserWithId",
    {
        userId: request.params.userId
    },
    {
        useMasterKey: true,
        success: function(userResult)
        {
            funcs.conditionalLog("0.1 have User");

            var Role            = Parse.Object.extend(Parse.Role);
            var roleQuery       = new Parse.Query(Role);

            funcs.conditionalLog("1 about to find");

            roleQuery.find(
            {
                useMasterKey: true,
                success: function(roleResults)
                {
                    var theCount = roleResults.length.toString();

                    funcs.conditionalLog("2 success getting results");
                    funcs.conditionalLog("with " + theCount + " results");

                    if ( roleResults.length > 0 )
                    {
                        funcs.conditionalLog("3 results has more than 0");

                        var rolesToSave = []; //NOT: new Array();

                        funcs.conditionalLog("3.1 created rolesToSave, about to loop");

                        for ( rIdx = 0; rIdx < roleResults.length; rIdx += 1 )
                        {
                            var theTemp         = rIdx.toString();

                            funcs.conditionalLog("4 is index " + theTemp);

                            var pfRole          = roleResults[rIdx];
                            var roleName        = pfRole.get("name");
                            var usersRelation   = pfRole.get("users");

                            funcs.conditionalLog("4.1 " + roleName + " Checking for Remove");

                            if ( removeRolesEh )
                            {
                                //var arr = new Array(1,2,3,2,5);
                                //var p = arr.indexOf(3) //p = 2
                                //p = arr.indexOf(7) //p = -1
                                funcs.conditionalLog("4.2 checking if remove from role");

                                var isRemove    = false;

                                for ( rrIdx = 0; rrIdx < removeRoles.length; rrIdx += 1 )
                                {
                                    var chkRoleName = removeRoles[rrIdx];
                                    if ( chkRoleName === roleName )
                                    {
                                        isRemove    = true;
                                    }
                                }

                                funcs.conditionalLog("4.2.1");

                                if ( isRemove === true )
                                {
                                    funcs.conditionalLog("4.3 removing from role");
                                    usersRelation.remove(userResult);
                                    rolesToSave.push(pfRole);
                                    funcs.conditionalLog("4.4 need to save");

                                }
                            }

                            funcs.conditionalLog("4.5 " + roleName + " Checking for Add");

                            if ( addRolesEh )
                            {
                                funcs.conditionalLog("4.6 checking if add to role");

                                var isAdd       = false;

                                for ( arIdx = 0; arIdx < removeRoles.length; arIdx += 1 )
                                {
                                    var chkRoleName = removeRoles[arIdx];
                                    if ( chkRoleName === roleName )
                                    {
                                        isAdd    = true;
                                    }
                                }

                                funcs.condtionalLog("4.6.1");

                                if ( isAdd === true )
                                {
                                    funcs.conditionalLog("4.7 adding to role");
                                    usersRelation.add(userResult);
                                    rolesToSave.push(pfRole);
                                    funcs.conditionalLog("4.8 need to save");
                                }
                            }
                        }

                        funcs.conditionalLog("5 about to save");

                        Parse.Object.saveAll(rolesToSave,
                        {
                            useMasterKey: true,
                            success: function(saveResults)
                            {
                                // All the modfied roles were saved.
                                funcs.conditionalLog("6 Saves were successful");
                                // Need to get the roles, and return them
                                Parse.Cloud.run("getRoleNamesForUserWithId",
                                {
                                    userId: request.params.userId
                                },
                                {
                                    useMasterKey: true,
                                    success: function(updatedRolesResult)
                                    {
                                        // Return Result
                                        funcs.conditionalLog("6.1 retrieved updated roles");
                                        response.success(updatedRolesResult);
                                    },
                                    error: function(updatedRolesError)
                                    {
                                        // Return error
                                        funcs.conditionalLog("6.2 error retrieving updated roles");
                                        funcs.conditionalLog(updatedRolesError);
                                        response.error(updatedRolesError);
                                    }
                                });
                            },
                            error: function(saveError)
                            {
                                // An error occurred while saving one of the objects.
                                funcs.conditionalLog("7 Error saving Installation objects");
                                funcs.conditionalLog(saveError);
                                response.error(saveError);
                            }
                        });
                    }
                    else
                    {
                        funcs.conditionalLog("8 No roles found");
                        response.error("No Roles found");
                    }
                },
                error: function (roleQueryError)
                {
                    funcs.conditionalLog("9 Role Query Error");
                    funcs.conditionalLog(roleQueryError);
                    response.error(roleQueryError);
                }
            });
        },
        error: function(getUserError)
        {
            funcs.conditionalLog("10 GetUserError:");
            funcs.conditionalLog(getUserError);
            response.error(getUserError);
        }
    });
});