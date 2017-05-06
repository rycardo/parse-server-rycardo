//////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
//
// NOT PUBLIC - INTERNAL ONLY
//
// Any js File that is going to use these
// needs to include this line:
//
// require("./funcs.js");
//
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////

//////////////////////////////////////
//
// conditionalLog
//
// Params:
// text     The text to log
//
// Success Response:
// BOOL         Whether the text was actually logged or not
//
//////////////////////////////////////
//Parse.Cloud.define("debugLog", function(request, response)
//{
//    logText     = request.params.text;
//    override    = request.params.force;
//
//   var doLog   = process.env.DEBUG_LOG || true;
//
//    if ( doLog === true || doLog === "True" || override === true )
//    {
//        console.log(logText);
//    }
//    response.success(doLog);
//});
//

module.exports =
{
    // This is the function which will be called in the main file, which is server.js
    // The parameters 'name' and 'surname' will be provided inside the function
    // when the function is called in the main file.
    // Example: concatenameNames('John,'Doe');
    conditionalLog: function (logText)
    {
        pvtConditionalLog(logText);
    },

    randomNumberWithNumberOfDigits: function (numDigits)
    {
        var theRandom   = pvtRandomNumberWithNumberOfDigits(numDigits);
        return theRandom;
    },

    arrayContainsElement: function ( array, element )
    {
        var containsEh  = pvtArrayContainsElement(array,element);
        return containsEh;
    },

    arrayAfterAddingUniqueElement: function ( array, element )
    {
        var newArray    = pvtArrayAfterAddingUniqueElement(array,element);
        return newArray;
    }
};


///////////////////////////////////////
//
// arrayContainsElement(array,element)
//
///////////////////////////////////////
function pvtArrayContainsElement(array,element)
{
    pvtConditionalLog("I'm In");

    var theLength   = array.length;

    console.log("Array Length is " + theLength.toString());

    for ( idx = 0; idx < array.length; idx += 1 )
    {
        console.log("Checking Index " + idx.toString());

        if ( array[idx] === element )
        {
            console.log("Found it");
            return true;
        }
    }
    console.log("Never found it");
    return false;
}


///////////////////////////////////////
//
// arrayAfterAddingUniqueElement(array,element)
//
///////////////////////////////////////
function pvtArrayAfterAddingUniqueElement(array,element)
{
    if ( pvtArrayContainsElement(array,element) )
    {
        return array;
    }

    array.add(element)

    return array;
}


///////////////////////////////////////
//
// conditionalLog - not public
//
///////////////////////////////////////
function pvtConditionalLog(logText)
{
    var doLog = process.env.DEBUG_LOG || true;

    if ( doLog === true || doLog === "True" )
    {
        console.log(logText);
    }
}


///////////////////////////////////////
//
// randomNumberWithNumberOfDigits
//
///////////////////////////////////////
function pvtRandomNumberWithNumberOfDigits(numDigits)
{
    var num = "";

    for( d = 0; d < numDigits; d += 1 )
    {
        var min = 0;
        var max = 9;
        var digit = Math.floor(Math.random() * (max - min + 1)) + min;

        num = num + digit.toString();
    }
    return num;
}
