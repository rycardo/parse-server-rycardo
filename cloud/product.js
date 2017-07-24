const CONST = require("./const.js");
var funcs = require("./funcs.js");

///////////////////////////////////////
//
// convertProductsCartToUserId
//
// NOTE:
// This should not be needed after everyone is on version 2.x
//
// Params:
// installId    STRING  PFInstallation objectId
// userId       STRING  PFUser objectId
//
// Response:
// STRING   description of what was done
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
            funcs.conditionalLog("Converting Products Cart from Install ID to User ID");
            funcs.conditionalLog("found: " + foundStr);
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
