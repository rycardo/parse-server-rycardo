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

    randomNumberOfDigits: function (numDigits)
    {
        var theRandom   = pvtRandomNumberOfDigits(numDigits);
        return theRandom;
    }
};


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
function pvtRandomNumberOfDigits(numDigits)
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
