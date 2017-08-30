const CONST = require("./const.js");
var funcs   = require("./funcs.js");


Parse.Cloud.define("createAvailableAppointment", function(request, response)
{
    var AvailableAppointment = Parse.Object.extend("AvailableAppointment");

    if ( ( request.params.barberId === undefined  ) ||
         ( request.params.dateTime === undefined    ) ||
         ( request.params.serviceId === undefined ) ||
         ( request.params.urlString === undefined   ) )
    {
        response.error("Missing required parameter(s)");
    }

    var appointment = new AvailableAppointment();
    appointment.save(
    {
        barber:     request.params.barberId,
        dateTime:   request.params.dateTime,
        foundTally: 1,
        service:    request.params.serviceId,
        urlString:  request.params.urlString
    }
    ,
    {
        success: function(savedAppointment)
        {
            response.success(savedAppointment);
        },
        error: function(saveError)
        {
            response.error(saveError);
        }
    });
});


///////////////////////////////////////
//
// createOrUpdateAvailableAppointment(dictionary)
//
// RETURNS BOOL success or not
//
///////////////////////////////////////
Parse.Cloud.define("createOrUpdateAvailableAppointment", function(request, response)
{
    if ( ( request.params.barberName === undefined  ) ||
         ( request.params.dateTime === undefined    ) ||
         ( request.params.serviceName === undefined ) ||
         ( request.params.urlString === undefined   ) )
    {
        response.error("Missing required parameter(s)");
    }

    Parse.Cloud.run("barberIdForBarberName",
    {
        barberName: request.params.barberName
    },
    {
        useMasterKey: true,
        success: function(barberId)
        {
            Parse.Cloud.run("serviceIdForBarberNameAndServiceName",
            {
                barberName:     request.params.barberName,
                serviceName:    request.params.serviceName
            },
            {
                useMasterKey: true,
                success: function(serviceId)
                {
                    // Create Cloud Code
                    Parse.Cloud.run("updateAvailableAppointment",
                    {
                        barberId: barberId,
                        dateTime: request.params.dateTime,
                        serviceId: serviceId,
                        urlString: request.params.urlString
                    },
                    {
                        useMasterKey: true,
                        success: function(updateResult)
                        {
                            var success             = updateResult.success;
                            var foundAppointment    = updateResult.foundAppointment;
                            var appointmentId       = updateResult.appointmentId;

                            if ( ( !success ) || ( !foundAppointment) )
                            {
                                // Add it
                                Parse.Cloud.run("createAvailableAppointment",
                                {
                                    barberId: request.params.barberId,
                                    dateTime: request.params.dateTime,
                                    serviceId: request.params.serviceId,
                                    urlString: request.params.urlString
                                },
                                {
                                    useMasterKey: true,
                                    success: function(createResult)
                                    {
                                        // Created
                                        response.success(createResult.id);
                                    },
                                    error: function(createError)
                                    {
                                        response.error(createError);
                                    }
                                });
                            }
                            else
                            {
                                response.success(appointmentId);
                            }
                        },
                        error: function(updateError)
                        {
                            response.error(updateError);
                        }
                    });
                },
                error: function(serviceError)
                {
                    response.error(serviceError);
                }
            });
        },
        error: function(barberError)
        {
            response.error(barberError);
        }
    });
});


///////////////////////////////////////
//
// updateAvailableAppointment
//
// Params - all required:
//
// barberId
// dateTime
// serviceId
// urlString
//
// RETURNS Dictionary
//
// success              Always true
// foundAppointment     Whether an appointment matching the params was found or not
// appointmentId        The objectId of the foundAppointment
//
///////////////////////////////////////
Parse.Cloud.define("updateAvailableAppointment", function(request, response)
{
    if ( ( request.params.barberId === undefined    ) ||
         ( request.params.dateTime === undefined    ) ||
         ( request.params.serviceId === undefined   ) ||
         ( request.params.urlString === undefined   ) )
    {
        response.error("Missing required parameter(s)");
    }

    var AvailableAppointment    = Parse.Object.extend("AvailableAppointment");
    var query                   = new Parse.Query(AvailableAppointment);

    query.equalTo("barber", request.params.barberId);
    query.equalTo("dateTime", request.params.dateTime);
    query.equalTo("serviceId", request.params.serviceId);

    query.find(
    {
        useMasterKey: true,
        success: function(results)
        {
            var theResult   = {};

            if ( results.length === 0 )
            {
                theResult = {   success: true,
                                foundAppointment: false,
                                appointmentId: ""
                            };
                response.success(theResult);
            }
            else
            {
                if ( results.length > 1 )
                {
                    // Delete all but first record
                    var dIdx = 0;
                    var delAppointment;

                    for(dIdx = 1; dIdx < results.length; dIdx += 1)
                    {
                        delAppointment  = results[dIdx];
                        delAppointment.destroy(
                        {
                            success: function(dAppt)
                            {
                                // Object Deleted
                                funcs.conditionalLog("Deleted duplicate record:");
                                funcs.conditionalLog(dAppt.id);
                            },
                            error: function(dAppt, error)
                            {
                                console.log("Unable to delete duplicate record:");
                                console.log(dAppt.id);
                                console.log(error);
                            }
                        });
                    }
                }

                var appointment = results[0];
                var tally       = appointment.get("fetchTally");
                if ( tally === undefined )
                {
                    tally = 1;
                }
                else
                {
                    tally += 1;
                }

                appointment.save(
                {
                    fetchTally: tally,
                    urlString: request.params.urlString
                },
                {
                    useMasterKey: true,
                    success: function(savedAppointment)
                    {
                        theResult = {   success: true,
                                        foundAppointment: true,
                                        appointmentId: savedAppointment.id
                                    };
                        response.success(theResult);
                    },
                    error: function(saveError)
                    {
                        response.error(saveError);
                    }
                });
            }
        },
        error: function(queryError)
        {
            response.error(queryError);
        }
    });
});


///////////////////////////////////////
//
// refreshAvailableAppointments
//
// Params:
// appointments Array  <AvailableAppointment>
//
// Response:
// Error        Error info
// Success      BOOL
//
///////////////////////////////////////
Parse.Cloud.define("refreshAvailableAppointments", function(request, response)
{
    if ( request.params.appointments === undefined )
    {
        response.error("Missing or Invalid parameters.");
    }

    var pAppointments               = request.params.appointments;

    var eachTotal                   = pAppointments.length;
    var eachIndex                   = 0;

    var validAppointments  = [];

    pAppointments.forEach( function(apptDict, index)
    {
        funcs.conditionalLog("Updating " + eachIndex.toString() + " of " + eachTotal.toString());

        // Loop through the passed appointment dictionaries
        // Creating and updating gets the appointmentId, then remove any that aren't
        // in those
        Parse.Cloud.run("createOrUpdateAvailableAppointment",
        {
            barberName  : apptDict["barberName"],
            dateTime    : apptDict["dateTime"],
            serviceName : apptDict["serviceName"],
            urlString   : apptDict["urlString"]
        },
        {
            useMasterKey: true,
            success: function(appointmentResult)
            {
                var appointmentId   = appointmentResult.id;
                validAppointments.push(appointmentId);

                eachIndex += 1;

                if ( eachIndex === eachTotal )
                {
                    Parse.Cloud.run("removeAppointmentsNotInList",
                    {
                        appointmentIds : validAppointments
                    },
                    {
                        useMasterKey: true,
                        success: function(removeResult)
                        {
                            funcs.conditionalLog(removeResult);
                        },
                        error: function(removeError)
                        {
                            console.log(removeError);
                        }
                    });
                }
            },
            error: function(appointmentError)
            {
                console.log(appointmentError);

                eachIndex += 1;

                if ( eachIndex === eachTotal )
                {
                    Parse.Cloud.run("removeAppointmentsNotInList",
                    {
                        appointmentIds : validAppointments
                    },
                    {
                        useMasterKey: true,
                        success: function(removeResult)
                        {
                            funcs.conditionalLog(removeResult);
                        },
                        error: function(removeError)
                        {
                            console.log(removeError);
                        }
                    });
                }
            }
        });
    });
});

Parse.Cloud.define("removeAppointmentsNotInList", function(request, response)
{
    if ( request.params.appointmentIds === undefined )
    {
        response.error("Missing or Invalid parameters.");
    }

    var AvailableAppointment = Parse.Object.extend("AvailableAppointment");
    var query = new Parse.Query(AvailableAppointment);
    query.notContainedIn("objectId",request.params.appointmentIds);

    query.equalTo("objectId", request.params.userId);
    query.find(
    {
        useMasterKey: true,
        success: function(queryResults)
        {
            // remove
            queryResults.forEach( function(queryObject,index)
            {
                queryObject.destroy(
                {
                    useMasterKey: true,
                    success: function(removedObject)
                    {
                        // The object was deleted from the Parse Cloud.
                        funcs.conditionalLog("removed object " + removedObject.id);
                    },
                    error: function(errorObject, error)
                    {
                        console.log("unable to remove object:");
                        console.log(errorObject);
                        console.log(error);
                    }
                });
            });
        },
        error: function(queryError)
        {
            console.log(queryError);
        }
    });
});