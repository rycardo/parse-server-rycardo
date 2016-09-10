/*
 *	Parse Cloud Code
 *
 *	Documentation:
 *	https://www.parse.com/docs/js/guide#cloud-code
 *	This URL will probably change to a github url
 *
 *	FOLDERS:
 *
 *	config
 *	contains a JSON configuration file that you shouldn't normally need to deal with
 *
 *	cloud
 *	stores your Cloud Code
 *
 *	public
 *	stores any static content that you want to host on the Parse Server
 *
 *	When you are done editing any of these files,
 *	deploy the changes using git/Git Hub/Git Desktop
 */

/*
 *	Barbershop Apps Methods
 *	These are to connect to and use Parse Server
 *
 *
 *	To use Parse Server you need the following:
 *
 *	Application ID
 *	in APP_ID
 *
 *	Database URI
 *	in DATABASE_URI
 *
 *	File Key
 *	in FILE_KEY
 *
 *	Master Key
 *	in MASTER_KEY
 *
 *	Parse Mount Path
 *	PARSE_MOUNT
 *
 *	The Server URL that the app will use
 *	in SERVER_URL
 *
 */

//do I need to require app.js?
//require('./cloud/app.js');


//////////////////////////////////////
//
// hello
//
//////////////////////////////////////
Parse.Cloud.define('hello', function(req, res)
{
  res.success('Hello my main man!');
});


///////////////////////////////////////
//
// status
//
///////////////////////////////////////
Parse.Cloud.define('status', function(request, response)
{
	response.success('Up, Live, Valid');
});

///////////////////////////////////////
//
// Twilio Functions
//
///////////////////////////////////////
/*
 *
 *	Twilio Functions
 *
 */

 // Account SID
 //
 // Auth Token
 //
 // App SID
 //
 // App Password

 require("./cloud/twil.js");

var twilioAccountSid    = 'AC31fd04d3ce8f6369308dc42d2cb16559';
var twilioAuthToken     = 'f20e0042726b0d9cca9e017e68d1f579';
var twilioPhoneNumber   = '+16172199117';
var secretPasswordToken = '4B9CAEC3-E9BF-42D0-B57B-6109D90A4E07';
var twilioMessagingSID  = 'MGb685587f2b87ff3e94536ef258cfced9';
var language            = "en";
var languages           = ["en","en-GB"];

var twilio = require('twilio')(twilioAccountSid, twilioAuthToken);

var debugging 		= true;

///////////////////////////////////////
//
// getTwilioPhoneNumber
//
///////////////////////////////////////
Parse.Cloud.define("getTwilioPhoneNumber", function(request, response)
{
	Parse.Cloud.useMasterKey();

	response.success(twilioPhoneNumber);
});

///////////////////////////////////////
//
// sendCodeEmail
//
///////////////////////////////////////
Parse.Cloud.define("sendCodeEmail", function(req, res) 
{
	var emailAddress	= req.params.emailAddress;
	var lang			= req.params.language;
	var phoneNumber		= req.params.phoneNumber;
	phoneNumber			= phoneNumber.replace(/\D/g, '');

	if ( lang !== undefined && languages.indexOf(lang) != -1 )
	{
		language = lang;
	}

	if ( !emailAddress )
	{
		return res.error('Missing Email Address');
	}

	if ( !phoneNumber )
	{
		return res.error('Missing Phone Number');
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);

	query.equalTo('email', emailAddress + "");
	query.first().then(function(result)
	{
		var num = randomNumberWithNumberOfDigits(5);

		//for(d = 0; d < 4; d++)
		//{
		//	var min = 0;
		//	var max = 1;
		//	var digit = Math.floor(Math.random() * (max - min + 1)) + min;
		//
		//	num = num + digit.toString();
		//}

		if ( result )
		{
			result.setUsername(phoneNumber);
			result.setPassword(secretPasswordToken + '-' + num);
			result.set("language", language);
			result.save().then(function()
			{
				return sendCodeSms(phoneNumber, num, language);
			}).then(function()
			{
				res.success("verification code sent");
			}, function(err) {
				res.error(err);
			});
		}
		else
		{
			var user = new Parse.User();
			user.setUsername(phoneNumber);
			user.setPassword(secretPasswordToken + '-' + num);
			user.set("language", language);
			user.setACL({});
			user.save().then(function(a)
			{
				return sendCodeSms(phoneNumber, num, language);
			}).then(function()
			{
				res.success("verification code sent");
			}, function(err)
			{
				res.error(err);
			});
		}
	},
	function (err)
	{
		res.error(err);
	});
});

///////////////////////////////////////
//
// sendCode
//
///////////////////////////////////////
Parse.Cloud.define("sendCode", function(req, res) 
{
	conditionalLog(debugging, "sendCode function called")

	var phoneNumber = req.params.phoneNumber;
	phoneNumber 	= phoneNumber.replace(/\D/g, '');

	conditionalLog(debugging, "phoneNumber: [" + phoneNumber + "]")

	var resend		= req.params.resend;

	conditionalLog(debugging, "resend: [" + resend + "]")

	var lang 		= req.params.language;

	conditionalLog(debugging, "lang: [" + language + "]")

	if ( lang !== undefined && languages.indexOf(lang) != -1 )
	{
		language = lang;
		conditionalLog(debugging,"language set to default");
	}

	if ( !phoneNumber || phoneNumber.length != 10 )
	{
		conditionalLog(debugging,"invalid phone number [" + phoneNumber + "]");
		return res.error('Invalid Phone number');
	}

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.User);

	query.equalTo('username', phoneNumber + "");
	query.first().then(function(result)
	{
		var num = randomNumberWithNumberOfDigits(5);
		conditionalLog(debugging,"will send 5 digit verification number");
		if ( result )
		{
			var expiry = result.get("alternateDeviceExpiry");
			var isLinking = isWithinFiveMinutes(expiry);

			if ( resend != null)
			{
				conditionalLog(debugging,"resend request");
				isLinking = false;
			}

			if ( isLinking )
			{
				conditionalLog(debugging,"linking, will obtain from other device");
				res.success("obtain verification code from existing device");
			}
			else
			{
				result.setPassword(secretPasswordToken + '-' + num);
				result.set("language", language);
				result.save().then(function()
				{
					conditionalLog(debugging,"ready to send code to phone");
					return sendCodeSms(phoneNumber, num, language);
				}).then(function()
				{
					conditionalLog(debugging,"sent code");
					res.success("verification code sent");
				}, function(err)
				{
					res.error(err);
				})
			};
		} else
		{
			return res.error('No user found with phone number');
		}
	}, function (err)
	{
		res.error(err);
	});
});
