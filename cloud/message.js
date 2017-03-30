const CONST = require("./const.js");
var funcs = require("./funcs.js");

///////////////////////////////////////
//
// canReplyToUserWithId
//
// Params:
// userId
//
// Response
// BOOL whether user allows messages
//
///////////////////////////////////////
Parse.Cloud.define("canReplyToUserWithId", function(request, response)
{
    funcs.conditionalLog("canReplyToUserWithId " + request.params.userId);

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


///////////////////////////////////////
//
// canReplyToUserWithId_B
//
// Params:
// userId
//
// Response
// BOOL whether user allows messages
//
///////////////////////////////////////
Parse.Cloud.define("canReplyToUserWithId_B", function(request, response)
{
    funcs.conditionalLog("canReplyToUserWithId_B " + request.params.userId);

    var query = new Parse.Query("_User");
    funcs.conditionalLog("1");
    query.equalTo("objectId", request.params.userId);
    funcs.conditionalLog("2");
    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("3");
            if ( results.length === 1 )
            {
                funcs.conditionalLog("4");
                var canReply = results[0].get("allowsMessages");
                if ( canReply === null )
                {
                    funcs.conditionalLog("5");
                    canReply = false;
                }
                funcs.conditionalLog("6 can reply:");
                funcs.conditionalLog(canReply);
                response.success(canReply);
            }
            else if ( results.length > 1 )
            {
                funcs.conditionalLog("more than one user found");
                response.error("more than one user found");
            }
            else
            {
                funcs.conditionalLog("no user found");
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
// convertMessagesFromDeviceRecipientToUserReceiver
//
// NOTE:
// This should not be needed after everyone is on version 2.x
//
// Params:
// installId    STRING  PFInstallation objectId
// userId       STRING  PFUser objectId
//
// Response:
// STRING   description of what happened
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
            funcs.conditionalLog("Converting from Install ID In recipientID to User ID in receiverID");
            funcs.conditionalLog("found: " + foundStr);

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
                    funcs.conditionalLog("converting msg " + msgId);
                    results[mIdx].set("userID", "-not-used-");
                    results[mIdx].set("recipientID", "-not-used-");
                    results[mIdx].set("receiverID", userId);
                    results[mIdx].save();
                }
                var count        = results.length;
                var countStr     = count.toString();
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
// NOTE:
// This should not be needed after everyone is on version 2.x
//
// Params:
// userId   STRING  PFUser objectId
//
// Response:
// STRING   description of what was done
//
///////////////////////////////////////
Parse.Cloud.define("convertMessagesFromUserRecipientToUserReceiver", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    //var installId    = request.params.installId;
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
            funcs.conditionalLog("Converting from User ID in recipientID to receiverID");
            funcs.conditionalLog("found: " + foundStr);
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
                    funcs.conditionalLog("converting msg " + msgId);
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
// NOTE:
// This should not be needed once everyone is on version 2.x
//
// Params:
// userId   STRING  PFUser objectId
//
// Response:
// STRING   description of what was done
//
///////////////////////////////////////
Parse.Cloud.define("convertMessagesFromUserUserToUserReceiver", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    //
    // All Messages
    //var installId    = request.params.installId;
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
            funcs.conditionalLog("Converting from User ID in userID to receiverID");
            funcs.conditionalLog("found: " + foundStr);
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
                    funcs.conditionalLog("converting msg " + msgId);
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
// doesMessageToUserWithNoRepeatHashExist
//
///////////////////////////////////////
Parse.Cloud.define("doesMessageToUserWithNoRepeatHashExist", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    //var userId = request.params.userId;
    //var nrHash = request.params.noRepeat;

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
// getMessageCount
//
// NOTE: Message is SINGULAR
//
// DEPRECIATED
//
// Params:
// installId
//
// Response:
// NUMBER   number of messages (whether read or unread)
//
///////////////////////////////////////
Parse.Cloud.define("getMessageCount", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    //Parse.Cloud.useMasterKey();
    // Unread Messages

    var query = new Parse.Query("Messages");
    query.equalTo("recipientID", request.params.installId);

    funcs.conditionalLog("Getting Messages Count for recipient [" + request.params.installId + "]");

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("SUCCESS: ");
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
// getMessagesCount
//
// NOTE: Messages is PLURAL
//
// Params:
// receiverID   the PFUser objectId
//
// Response:
// DICTIONARY
// allCount     NUMBER  number of messages (new and read)
// newCount     NUMBER  number of unread messages
//
///////////////////////////////////////
Parse.Cloud.define("getMessagesCount", function(request, response)
{
    //Parse.Cloud.useMasterKey();
    // Unread Messages
    var receiverID    = request.params.receiverID;

    var query         = new Parse.Query("Messages");
    query.equalTo("receiverID", receiverID);

    funcs.conditionalLog("Getting Messages Count for user [" + receiverID + "]");

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
                    funcs.conditionalLog("not new");
                }
                else
                {
                    newMessagesCount += 1;
                }
            }
            funcs.conditionalLog("messages count: " + allMessagesCount.toString() );
            funcs.conditionalLog("unread count:   " + newMessagesCount.toString() );
            funcs.conditionalLog("SUCCESS");

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
// getUnreadMessageCount
// DEPRECIATED
//
// Params:
// installId    PFInstallation objectId
//
// Response:
// NUMBER   unread message count
///////////////////////////////////////
Parse.Cloud.define("getUnreadMessageCount", function(request, response)
{
    //Parse.Cloud.useMasterKey();

    // Unread Messages
    var query = new Parse.Query("Messages");
    query.equalTo("recipientID", request.params.installId);
    query.doesNotExist("readAt");

    funcs.conditionalLog("Getting Unread Messages Count for recipient [" + request.params.installId + "]");

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            funcs.conditionalLog("SUCCESS: ");
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


////////////
//////////// These functions are depreciated, are left here as
//////////// shells for backwards compatibility
////////////


///////////////////////////////////////
//
// convertMessagesFromDeviceToUser
//
// Params:
// Doesn't matter, they aren't read
//
// Response:
// Always an error
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
