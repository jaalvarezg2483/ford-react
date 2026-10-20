<?php
	global $home;
	if(!isset($home)){ $home = getcwd(); } $home = (basename($home) != "chat") ? $home . "/chat/": $home."/";
	//	Avaya Aura Contact Center Multimedia
	//	Copyright � 2010 - 2013 Avaya Inc. All Rights Reserved

	require_once($home."functions/logging.php");
	require_once($home.'include/config.php');

	//	Setup Ajax links so that we can call PHP from JavaScript 
	require_once($home."library/jqSajax.class.php");

	//	Create Ajax object for calling PHP via JavaScript
	$ajax=new jqSajax(2,1,1);	//	2 is for method mode

	//	Require PHP functions that will be called from JavaScript
	require_once($home."functions/Parent Functions/SendMessage.php");
	require_once($home."functions/Parent Functions/RefreshHistory.php");
	require_once($home."functions/Parent Functions/UpdateAliveTime.php");
	require_once($home."functions/Parent Functions/GetAnonymousSessionKey.php");
	require_once($home."functions/Parent Functions/GetAnonymousCustomerID.php");
	require_once($home."functions/Parent Functions/GetAndUpdateAnonymousCustomerID.php");
	require_once($home."functions/Parent Functions/SetupTextChat.php");
	require_once($home."functions/Parent Functions/CloseTextChat.php");
	require_once($home."functions/Parent Functions/RequestCallBackNow.php");
	require_once($home."functions/Parent Functions/RequestCallBackLater.php");
	require_once($home."functions/Parent Functions/RequestCallBackNowCustomerCheck.php");
	require_once($home."functions/Parent Functions/RequestCallBackLaterCustomerCheck.php");
	require_once($home."functions/Parent Functions/RemoveContactFromQueue.php");
	require_once($home."functions/Parent Functions/IsSkillsetInUse.php");
	require_once($home."functions/Parent Functions/IsSkillsetInService.php");
	require_once($home."functions/Parent Functions/GetCustomerIDByEmail.php");
	require_once($home."functions/Parent Functions/RegisterNewCustomer.php");
	require_once($home."functions/Parent Functions/LoginNewCustomer.php");
	require_once($home."functions/Parent Functions/GetCustomerByPhoneNumber.php");
	require_once($home."functions/Parent Functions/AddPhoneNumber.php");
	require_once($home."functions/Parent Functions/AddEmailAddress.php");
	require_once($home."functions/Parent Functions/GetCustomerUserNameByID.php");
	require_once($home."functions/Parent Functions/UpdateEmailAddress.php");
	require_once($home."functions/Parent Functions/RequestChatHistory.php");
	require_once($home."functions/Parent Functions/ReadSkillsetByName.php");
	require_once($home."functions/Parent Functions/GetOnHoldComfortMessages.php");
	require_once($home."functions/Parent Functions/GetWebOnHoldURLs.php");
	require_once($home."functions/Parent Functions/SendEmail.php");
	require_once($home."functions/Parent Functions/ReadCustomer.php");
	require_once($home."functions/Parent Functions/UpdateDefault.php");
	require_once($home."functions/Parent Functions/GetCustomerDisplayName.php");
	
	if( $_SERVER['REQUEST_METHOD'] === 'POST' ) // Only POST requests should be handled
	{
		$ajax->processClientReq(); // Close Ajax object
	}

?>

<script type="text/javascript">

//	Globally used functions

function sound(surl)
{
	document.getElementById("NewMessageBeepHolder").innerHTML = "<embed src=\""+surl+"\" hidden=\"true\" autostart=\"true\" loop=\"false\" />";
}

//	Resize pop-up according to browser used, and by possible extending length
function resizeWindow(ffPixelWidth, crPixelWidth, iePixelWidth, ffPixelLength, crPixelLength, iePixelLength, extendLength)
{
	if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent))
		window.resizeTo(ffPixelWidth, ffPixelLength + extendLength);	//	Firefox
	else if(navigator.userAgent.indexOf("Chrome") != -1)
		window.resizeTo(crPixelWidth, crPixelLength + extendLength);	//	Chrome
	else if(navigator.appName == "Microsoft Internet Explorer")
	{
		extendLength -= extendLength/14;
		window.resizeTo(iePixelWidth, iePixelLength + extendLength);	//	IE
	}
	else 
		window.resizeTo(iePixelWidth, iePixelLength + extendLength);	//	Resize others as of IE
}

//	Whitespace removal functions:
//	At source
function checkSpace(event)
{ 
	var key = event.keyCode || event.which; // get key cross-browser
	if (key == 32) //Space bar key code
	{ 
		//Prevent default action, which is inserting space
		if (event.preventDefault) 
			event.preventDefault(); //normal browsers
		event.returnValue = false; //IE
	}
}
//	In string
function whitespaceTrim(str)
{
	return str.replace(/\s+/g,'');
}

//	Check for valid email address
function isValidEmailAddress(str)
{  
	var at="@";
	var dot=".";
	var lat=str.indexOf(at);
	var lstr=str.length;
	var ldot=str.indexOf(dot);

	//	If string contains whitespace, trim
	str = whitespaceTrim(str);

	if (str.indexOf(at)==-1)
	{
		return false;
	}

	if (str.indexOf(at)==-1 || str.indexOf(at)==0 || str.indexOf(at)==lstr)
	{
		return false;
	}

	if (str.indexOf(dot)==-1 || str.indexOf(dot)==0 || str.indexOf(dot)==(lstr-1))
	{
		return false;
	}

	if (str.indexOf(at,(lat+1))!=-1)
	{
		return false;
	} 

	if (str.substring(lat-1,lat)==dot || str.substring(lat+1,lat+2)==dot)
	{
		return false;
	}

	if (str.indexOf(dot,(lat+2))==-1)
	{
		return false;
	}

	if (str.indexOf(" ")!=-1)
	{
		return false;
	}

	return true;			
}

//	Check for valid phone number
function isValidPhoneNumber(str)
{
		var validCharacters = "0123456789";

		//	If string contains whitespace, trim
		str = whitespaceTrim(str);

		for (i = 0; i < str.length; i++) 
		{ 
			if (validCharacters.indexOf(str.charAt(i)) == -1) 
			{
				return false;
			}
		}

		return true;
}

</script>