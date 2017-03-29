//require("./const.js");
//require("./funcs.js");

///////////////////////////////////////
//
// barberIdForBarberFirstNameLastName
//
// Params:
// firstName    String
// lastName     String
//
// Response:
// barberId     String
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
// Params:
// barberName   String
//
// Response:
// barberId     String
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
// serviceIdForBarberNameAndServiceName
//
// Params:
// barberName   String
// serviceName  String
//
// Response:
// serviceId    String
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
// Params:
// serviceId    String
//
// Response:
// serviceId    String
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
// Params:
// barber   String (barber objectId)
//
// Response:
// array of Services (Class)
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

