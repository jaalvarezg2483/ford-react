<!--

  Avaya Aura Contact Center Multimedia 
  Copyright � 2010 - 2013 Avaya Inc. All Rights Reserved 

-->
<?php
	require($home."include/language_en.php");
?>

<script type="text/javascript"> 

var txt;
var thisHistory;
var temp;
var LastReadTime = 0;
var AgentAccepted = false ;
var subSection;
var CustomTextLine = "[Cliente] ";
var heartbeatTime = 0;
var session_key = "";
var contact_id = 0
var username = "";
var window_height;
var StopListening = false;
var EmailAddress = "";
var customerID;
var chatSubject;
var customField_1_name;
var customField_1_value;
var chatQuery;
var UserTyping = false;
var CustomerQuestionHandler_DoOnce = true;
var UseBeep = true;
var WebOnHoldTagGroup = "";
var WebOnHoldList = [];
var WebOnHoldDuration = "";
var WebOnHoldCurrentLink = 0;
var WebOnHoldTimerCounter = 999;
var NS4 = (document.layers) ? true : false;
var isPagePushed = false;
var isCoBrowseMessageSent = false;

// Adding this code to use the trim function in Internet Explorer
if(typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g, ''); 
	}
}

function closeChatWin()
{
	window.close();
}

function CallMeNow()
{
	//	Ensure chat is connected
	var str = document.getElementById('status').innerHTML;

	if(str.match("<?PHP echo$CHAT_STATUS_CONNECTED_TEXT?>"))
	{
		var temp = document.getElementById('comments').value;
		document.getElementById('comments').value = "<?PHP echo$CHAT_CALLBACK_CONTACT_TEXT?>" + document.getElementById('CallMeNumber').value + ".";
		processText();
		document.getElementById('comments').value = temp;
	}
}

function RemovePlaceHolder()
{
	var str = document.getElementById('comments').value;

	if(str.match("<?PHP echo $CHAT_ENTER_QUESTION_HERE_TEXT?>"))
	{
		document.getElementById('comments').value = "";
	}
}

function MuteBeep()
{
	if(UseBeep == true)
	{
		document.getElementById('speakerIcon').src = "<?php echo $home?>img/speaker_off.gif";
		document.getElementById('speakerIcon').title = "<?php echo $SPEAKER_UNMUTE_IMAGE_TEXT?>";
		UseBeep = false;
	}
	else
	{
		document.getElementById('speakerIcon').src = "<?php echo $home?>img/speaker_on.gif";
		document.getElementById('speakerIcon').title = "<?php echo $SPEAKER_MUTE_IMAGE_TEXT?>";
		UseBeep = true;
	}
}

function checkEnter(Object, event)
{ 	
	UserTyping = true;
	<?php
        // Comentarios para que no salga en el codigo, se elimina la validación de conectado para que siempre envie el mensaje
//	var str = document.getElementById('status').innerHTML;
//
/*	if(!str.match("<?PHP echo$CHAT_STATUS_NOT_CONNECTED_TEXT?>"))*/
//	{
//
//	}
	?>

    //	If the enter key was pressed, send the message
    var code = 0;

    if (NS4)
    {
        code = event.which;
    }
    else
    {
        code = event.keyCode;
    }

    if(code==13)
    {
        setTimeout('processText()', 250);

        // Customer should not send the empty strings
        return false;
    }

    return (Object.value.length <= 1000);
}

function sendChatHistoryEmail()
{
	var EmailMeAddress = document.getElementById('EmailMeAddress').value;
	var bSendChatHistory = document.getElementById('SendChatHistory').checked;
		
	if( EmailMeAddress != "" && bSendChatHistory == true )
	{
		//	If string contains whitespace, trim
		EmailMeAddress = whitespaceTrim(EmailMeAddress);
//		var conf = confirm("Do you wish to be emailed a copy of the conversation?");
//		//	 Validate email address
//        if (conf == true) {
//            jqSajax.x_RequestChatHistory(contact_id,EmailMeAddress,session_key,"<?php //echo $home?>//");
//        }
        // Si el check fue seleccionado hace el envio sin preguntar confirmación
        jqSajax.x_RequestChatHistory(contact_id,EmailMeAddress,session_key,"<?php echo $home?>");

	}
}

function closeAgentWin()
{
//	document.getElementById('winDisplayAgent').style.display = "none";

	if(AgentAccepted == false)
	{
		//	Remove the contact from the queue
		var temp = jqSajax.x_RemoveContactFromQueue(session_key, contact_id, "User Ended Chat Before Agent Accepted Call", "<?php echo $home?>");
	}
	else
	{
		sendChatHistoryEmail();
	}

	if(contact_id > 0)
	{
		jqSajax.x_SendMessage(session_key, contact_id, CustomTextLine + "Sesion Finalizada", "", "Session_Disconnected_by_Customer", "<?php echo $home?>");
		var CustomerRealUserName = jqSajax.x_GetCustomerUserNameByID(session_key, customerID, "<?php echo $home?>");
		jqSajax.x_CloseTextChat(CustomerRealUserName, contact_id, session_key, "<?php echo $home?>");
	}

	var cookie_session = getCookie("session_key");
	var cookie_contact = getCookie("contact_id");
	if (cookie_session != '') {
		jqSajax.x_SendMessage(cookie_session, cookie_contact, CustomTextLine + "Sesion Finalizada", "", "Session_Disconnected_by_Customer", "<?php echo $home?>");
		var CustomerRealUserName = jqSajax.x_GetCustomerUserNameByID(cookie_session, customerID, "<?php echo $home?>");
		jqSajax.x_CloseTextChat(CustomerRealUserName, cookie_contact, cookie_session, "<?php echo $home?>");
		setCookie("session_key", "", 0);
		setCookie("contact_id", "", 0);
		setCookie("phone_number", "", 0);
		setCookie("cookie_email", "", 0);
		document.getElementById('webchatLogin').style.display = "";
	}
	StopListening = true;
}

function showAgentWin(Selected_Username, skillsetID, this_customer_id, this_session_key, this_email_address, this_phone_number, this_WebCommsSubject, this_CustomField_1_Name, this_CustomField_1_Value, this_WebCommsQuery, this_WebOnHoldTag) 
{
	EmailAddress = this_email_address;
	customerID = this_customer_id;
	chatSubject = this_WebCommsSubject;
	customField_1_name = this_CustomField_1_Name;
	customField_1_value = this_CustomField_1_Value;
	chatQuery = this_WebCommsQuery;
	WebOnHoldTagGroup = this_WebOnHoldTag;
	//	Use existing session key if supplied
	session_key = this_session_key;

	if(document.getElementById('EmailMeAddress') != null)
	{
		document.getElementById('EmailMeAddress').disabled = true
		document.getElementById('EmailMeAddress').value = this_email_address;
	}

	if(document.getElementById('CallMeNumber') != null)
	{
		document.getElementById('CallMeNumber').disabled = true;
		document.getElementById('CallMeNumber').value = this_phone_number;
	}

	if(Selected_Username != "")
	{
		//	Update name tag with user typed selected username if entered
		CustomTextLine = "["+Selected_Username+"] ";
	}
	else
	{
		// No name entered so retrieve the customer display name stored in the database
		CustomTextLine = jqSajax.x_GetCustomerDisplayName(session_key,  "<?php echo $home?>") + " ";
	}

	//	Check if we have a valid web on hold tag then get string.
	if(WebOnHoldTagGroup != "" && WebOnHoldTagGroup != null)
	{
		var result = jqSajax.x_GetWebOnHoldURLs(session_key, WebOnHoldTagGroup, "<?php echo $home?>");
		var temp = result.URL.replace(/\"/gi, "");
		WebOnHoldList = temp.split(" ");
		WebOnHoldDuration = result.Duration;
	}
	else
	{
		//	Use default
		WebOnHoldList.push("<?php echo $home?>adverts/advert_1.html");
		WebOnHoldList.push("<?php echo $home?>adverts/advert_2.html");
		WebOnHoldList.push("<?php echo $home?>adverts/advert_3.html");
		WebOnHoldList.push("<?php echo $home?>adverts/advert_4.html");
		WebOnHoldList.push("<?php echo $home?>adverts/advert_5.html");
		WebOnHoldList.push("<?php echo $home?>adverts/advert_6.html");
		WebOnHoldDuration = "5";
	}

	//	Put the application to sleep for 1 second so the loading screen can be read.
	setTimeout("showAgentContinued("+skillsetID+")",1000);
}

function postErrorAndClose(errorCondition)
{
	//	Establishing a text chat session has failed: display appropriate window format and message
	document.getElementById('webchatLogin').style.display = "none";	
	document.getElementById('winDisplayAgent').style.display = "";
	document.getElementById(errorCondition).style.display = "";
	// document.getElementById('webchat_advertisement').style.display = "none";	
	document.getElementById('webchat_chat_area').style.display = "none";	

	//	Resize window for confirmation message, and according to browser used
	resizeWindow(438, 438, 438, 241, 235, 206, 0);

	//	Close chat window after delay
	setTimeout("closeChatWin()", <?PHP echo$WEBCHAT_FAILED_HANG_TIME?>);
}

function showAgentContinued(skillsetID)
{
	//	Empty all fields & disable until connected
	document.getElementById('comments').value = "";

	//	Display enter question here prompt
	document.getElementById('comments').value = "<?PHP echo $CHAT_ENTER_QUESTION_HERE_TEXT?>";
	document.getElementById('comments').disabled = false;

	if(document.getElementById('CallMeNumber') != null)
	{
		document.getElementById('CallMeNumber').disabled = true;
	}

	//	Request text chat
	if(customerID != "-1")
	{
		contact_id = jqSajax.x_SetupTextChat(session_key, customerID, skillsetID, chatSubject, chatQuery, customField_1_name, customField_1_value, "<?php echo $home?>");
		setCookie("contact_id", contact_id, 365);
	}

	if(contact_id != "-1")
	{
		//	Check if a text chat session has failed due to max concurrent sessions
		if(contact_id == "-2")
		{
			//	Establishing a text chat session has failed: display message and close
			postErrorAndClose('webchat_max_concurrent_per_customer');

			//	Since establishing a chat session is not currently possible, alter the display of the parent page
			window.opener.document.getElementById('skillset_status').innerHTML = "<a href=\"javascript:void(0)\" onclick=\"emailWindow = window.open('Code/email.php', 'Email', 'width=430, height=540, resizable=0, status=0, toolbar=0, menubar=0');\"><img  title=\"<?php echo $EMAIL_IMAGE_TEXT?>\" alt=\"Email icon.\" border=\"0\" height=\"50\" width=\"50\" src=\"Code/img/email.gif\" /></a>";
		} 
		else if(contact_id == "-3")
		{
			//	Establishing a text chat session has failed: display message and close
			postErrorAndClose('webchat_max_concurrent_per_skillset');

			//	Since establishing a chat session is not currently possible, alter the display of the parent page
			window.opener.document.getElementById('skillset_status').innerHTML = "<a href=\"javascript:void(0)\" onclick=\"emailWindow = window.open('Code/email.php', 'Email', 'width=430, height=540, resizable=0, status=0, toolbar=0, menubar=0');\"><img  title=\"<?php echo $EMAIL_IMAGE_TEXT?>\" alt=\"Email icon.\" border=\"0\" height=\"50\" width=\"50\" src=\"Code/img/email.gif\" /></a>";
		} 
		else
		{
			//	We have connected to the server and processed a contact correctly
			//	Now start polling for connected event	
			//	And hide login page / please wait page
			document.getElementById('webchatLogin').style.display = "none";	
			//	Show chat window
			document.getElementById('winDisplayAgent').style.display = "";
			document.getElementById('webchat_chat_area').style.display = "";
			// document.getElementById('webchat_advertisement').style.display = "";	

			//	Resize for adverts
			if(document.title == "<?php echo $CHAT_TITLE_TEXT?>")
			{
				resizeWindow(1055, 1045, 1045, 540, 540, 512, 0);
			}

			Refresh();
		}
	}
	else
	{
		//	Skillset not in use: display message and close
		postErrorAndClose('webchat_no_agents');
	}
}

function processText()
{

	//	Ensure chat is connected
	var str = document.getElementById('status').innerHTML;

		CustomerQuestionHandler_DoOnce = false;
		TextAreaComments = document.getElementById('comments');
		TextAreaComments.value = replaceWithHTMLEntities(TextAreaComments.value);
		TextAreaHistory  = document.getElementById('history');

		// Checking for not whitespace characters in the message
		if(TextAreaComments.value.trim() != "")
		{
			var session_cookie_key = getCookie("session_key");
			var session_cookie_contact = getCookie("contact_id");
			//	Send message
			temp = jqSajax.x_SendMessage(session_cookie_key, session_cookie_contact, CustomTextLine + TextAreaComments.value, "", "Chat_Message_from_Customer", "<?php echo $home?>");
		}

		TextAreaHistory.scrollTop = TextAreaHistory.scrollHeight;
		TextAreaComments.value="";
		TextAreaComments.focus();

		//	Refresh
		QuickRefresh(session_cookie_key, session_cookie_contact);



}

function popDialog()
{
	//	Alert for Agent Disconnect (future: use a jQuery-ui modal-dialog-box)
	alert("<?php echo $CHAT_STATUS_CONNECTION_END_TEXT?>");
}
function QuickRefresh(session_cookie_key, session_cookie_contact)
{
	//	Function should not be used on its own, only works as expected in conjunction with the Refresh() function, or agent will think the customer will have timed out
	thisHistory = jqSajax.x_GetHistory(session_cookie_key, session_cookie_contact, LastReadTime, "<?php echo $home?>");

	if(thisHistory.text != "")
	{
		temp = thisHistory.text;
		LastReadTime = thisHistory.time;

		if(AgentAccepted  == false)
		{
			document.getElementById('history').innerHTML= "";
			AgentAccepted = true;
		}
	}
	else
	{
		temp="";
	}

	if(temp != "")
	{
		textareaObj = document.getElementById('history');
		txt =  textareaObj.innerHTML;

		if(thisHistory.PageFromAgent != "") // If a page has been pushed then add the url tags to it
		{
			var url = String(thisHistory.PageFromAgent); // Convert link to a string
			temp = temp.replace(url, '<a href="' + url + ' " target="_blank">' + url + '</a>'); // Replace url text with the html for a url
		}

		txt = txt + temp;

		textareaObj.innerHTML = txt;
		textareaObj.scrollTop = textareaObj.scrollHeight;
	}

	if(thisHistory.PlayBeep == "true")
	{
		if(UseBeep == true)
		{
			sound('<?php echo $home?>audio/<?php echo $NOTICE_SOUND?>');
		}
	}

	//	Check agent status both for heartbeat and typing and update user
	if (heartbeatTime > <?php echo $HEART_BEAT_MAXIMUM?>)
		document.getElementById('AgentStatus').innerHTML = "<?PHP echo$CHAT_STATUS_UNSURE_CONNECTED_TEXT?>";
	else if (thisHistory.AgentTyping == "true")
		document.getElementById('AgentStatus').innerHTML = "<?php echo $CHAT_AGENT_TYPING_TEXT?>";
	else
		document.getElementById('AgentStatus').innerHTML = "";

	if(thisHistory.PageFromAgent != "")
	{
		if(<?php echo $PAGE_PUSH_ENABLED?>)
		{
			//	Set isPagePushed 'true'
			isPagePushed = true;

			try
			{
				//	Open agent pushed page in advertisement area of chat pop-up:
				document.getElementById('web_on_hold_url').src = thisHistory.PageFromAgent;

				//	Open agent pushed page in parent window:
				//window.opener.location.href =  thisHistory.PageFromAgent;

				//	Open agent pushed page in new browser:
				//mywindow = window.open(thisHistory.PageFromAgent, "Pushed_Page", "location=1, status=1, scrollbars=1, width=565, height=332");	//	565x332 configuration proportioned to size of advertising area (and so of samples)
			}
			catch(err)
			{
				//	Do nothing, don't display a page, just catch the error
			}
		}
	}

	if (thisHistory.AgentDisconnect == "true")
	{
		document.getElementById('status').innerHTML = "<b><font class='status_color'><?PHP echo $CHAT_STATUS_TEXT?></font><?PHP echo$CHAT_STATUS_NOT_CONNECTED_TEXT?></b>";
		document.getElementById('comments').disabled = true;
		document.getElementById('enterButton').disabled = true;
		document.getElementById('EmailMeAddress').disabled = true;
		if(document.getElementById('CallMeNumber') != null)
		{
			document.getElementById('CallMeNumber').disabled = true;
		}

		contact_id = 0;	//	Results in a cessation of server polling
        setCookie("session_key", "", 0);
		
	}

	UserTyping = false;
}

function setFieldsStates(b) {
	if(document.getElementById('CallMeNumber') != null)
	{
		document.getElementById('CallMeNumber').disabled = b;
	}
	if(document.getElementById('EmailMeAddress') != null)
	{
		document.getElementById('EmailMeAddress').disabled = b;
	}
	if(document.getElementById('SendChatHistory') != null)
	{
		document.getElementById('SendChatHistory').disabled = b;
	}
}

function doHeartBeat(session_cookie_key, session_cookie_contact)
{
	heartbeatTime = jqSajax.x_UpdateAliveTime(session_cookie_key, session_cookie_contact, UserTyping, "<?php echo $home?>");
    //alert(heartbeatTime);
	if(heartbeatTime > 0)
	{
		//	We have connected to an agent: Update status
		document.getElementById('status').innerHTML = "<b><font class='status_color'><?PHP echo $CHAT_STATUS_TEXT?></font><?PHP echo$CHAT_STATUS_CONNECTED_TEXT?></b>";

		//
		//
		//setFieldsStates(false);

		//	Enable comments area if disabled
		document.getElementById('comments').disabled = false;
		//	Remove question place holder if its still there.
		var str = document.getElementById('comments').value;

		if(str.match("<?PHP echo $CHAT_ENTER_QUESTION_HERE_TEXT?>"))
		{
			document.getElementById('comments').value = "";
			CustomerQuestionHandler_DoOnce = false;
		}

		//	Or if its empty
		if(str == "")
		{
			CustomerQuestionHandler_DoOnce = false;
		}
	}
	else if((heartbeatTime < 0) && (AgentAccepted  == false))
	{
		document.getElementById('status').innerHTML = "<b><font class='status_color'><?PHP echo $CHAT_STATUS_TEXT?></font><?PHP echo$CHAT_STATUS_NOT_CONNECTED_TEXT?></b>";

		//setFieldsStates(true);

		//	Get comfort messages
		var ComfortMessage = jqSajax.x_GetOnHoldComfortMessages(contact_id, session_key, "<?php echo $home?>");
		document.getElementById('history').innerHTML = ComfortMessage;
	}
	else
	{
		document.getElementById('status').innerHTML = "<b><font class='status_color'><?PHP echo $CHAT_STATUS_TEXT?></font><?PHP echo$CHAT_STATUS_NOT_CONNECTED_TEXT?></b>";
		//setFieldsStates(true);

		//To send a chat history email in case of customer set the flag.
		sendChatHistoryEmail();
	}
}

function Refresh()
{
	var phone_number = getCookie("phone_number")
	var cookie_email = getCookie("cookie_email")


	//	Use existing session key if supplied

	
	document.getElementById('CallMeNumber').value = phone_number;
	document.getElementById('EmailMeAddress').value = cookie_email;


	//	Don't refresh while user is typing because of an issue with firefox where typed keys can get lost
	if(UserTyping == false)
	{
		//	Do once, if the customer has typed a question, then auto send to the agent on second poll interval
		var str = document.getElementById('status').innerHTML;

		if(CustomerQuestionHandler_DoOnce == true)
		{
			if(!str.match("<?PHP echo$CHAT_STATUS_NOT_CONNECTED_TEXT?>"))
			{
				str = document.getElementById('comments').value;

				if(!str.match("<?PHP echo $CHAT_ENTER_QUESTION_HERE_TEXT?>"))
				{
					//	We now know that, the user is not typing, the chat is connected and has polled once already in the connected state, and the entered text is not the place holder value
					//	Ss, send question
					processText();
				}

				CustomerQuestionHandler_DoOnce = false;
			}
		}
		var session_cookie_key = getCookie("session_key");
		var session_cookie_contact = getCookie("contact_id");
		if(contact_id != 0 || session_cookie_contact != '')
		{
			//	 Update alive time and reflect connection status based on result
			doHeartBeat(session_cookie_key, session_cookie_contact);

			//	Refresh histroy
			QuickRefresh(session_cookie_key, session_cookie_contact);
		}
	}
	else
	{
		//	Because of a bug with firefox, remove the heartbeat. However, this means the client cannot update the agent that they are typing
		if (!(/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)))
		{
			//	Update alive time and reflect connection status based on result
			doHeartBeat();
		}
	}

	if(contact_id != 0 || session_cookie_contact != '')
	{
			UserTyping = false;
			setTimeout("Refresh()",<?php echo $POLL_INTERVAL?>);
	}

//	if (isPagePushed == false)
//	{
//		//	Update advert if needs be
//		WebOnHoldTimerCounter = WebOnHoldTimerCounter +  (<?php //echo $POLL_INTERVAL?>/// 1000);
//
//		if(WebOnHoldDuration <= WebOnHoldTimerCounter)
//		{
//			WebOnHoldTimerCounter = 0;
//
//			if(WebOnHoldList.length == WebOnHoldCurrentLink)
//			{
//				WebOnHoldCurrentLink = 0;
//			}
//
//			document.getElementById('web_on_hold_url').src = WebOnHoldList[WebOnHoldCurrentLink];
//			WebOnHoldCurrentLink = WebOnHoldCurrentLink+1;
//		}
//	}
}

</script>

