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


module.exports = function()
{
    this.sum = function(a,b) { return a+b };
    this.multiply = function(a,b) { return a*b };
    //etc

///////////////////////////////////////
//
// randomNumberWithNumberOfDigits
//
///////////////////////////////////////
    this.randomNumberWithNumberOfDigits = function(numDigits)
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
    this.conditionalLog = function(logText)
    {
        var doLog = process.env.DEBUG_LOG || true;

        if ( doLog === true || doLog === "True" )
        {
            console.log(logText);
        }
    }

// INSERT NEW FUNCTIONS HERE

}
