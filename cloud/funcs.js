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


///////////////////////////////////////
//
// randomNumberWithNumberOfDigits
//
///////////////////////////////////////
function randomNumberWithNumberOfDigits(numDigits)
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
