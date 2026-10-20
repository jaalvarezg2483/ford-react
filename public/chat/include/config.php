<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2013 Avaya Inc. All Rights Reserved

//------Do not edit these two lines------
global $home;
if(!isset($home)){ $home = getcwd(); } $home = (basename($home) != "chat") ? $home . "/chat/": $home."/";

//---------------------------------------

//	VERSION NUMBERS
//	SDK version number
$VERSION_NUMBER = "6.4.2";
//	Server version Number
//	Used to enable backward compatibility if new methods are introduced by the CI WebServices
$SERVER_VERSION_NUMBER = "6.4";

//	MACHINE NAME
//	CCMM Server Hostname
//$CCMM_MACHINE_NAME = "190.7.202.76";
$CCMM_MACHINE_NAME = "45.5.60.42";

//	Change values to suit either HTTP or HTTPS - ensure cert is valid if using HTTPS
//	Ensure the CURL extension is enabled in PHP.ini if using HTTPS
//	Default values:	"http://" with port "80"
$HTTP_REQUEST_TYPE = "http://";
$HTTP_REQUEST_PORT = "80";

//	POLLING INTERVAL 
//	Length of time before refreshing chat history. 
//	Recommended value:	From 3 to 5 seconds (3000-10000) (500-2000 for testing only)
//	Lower value, more system drain; higher value, slower refresh rate.
$POLL_INTERVAL = 5000;

//	NOTICE SOUND 
//	Filename of *.wav sound file to be played when a new message is recieved.
//	Sound files are stored in '<home>\audio' directory
//	Recommended value:	"click.wav"
$NOTICE_SOUND = "click.wav";

//	LANGUAGE FILE
//	Language file used for displayed strings.
//	Default value:	English

require($home."include/language_en.php");

//	TEXT & BACKGROUND COLOUR
//	Text & background colour of customer messages
//	Default values:	"#999999"; "#F7F7F7"
$CUSTOMER_TEXT_COLOR ="#999999";
$CUSTOMER_TEXT_BK_COLOR ="#F7F7F7";
//	Text & background colour of agent messages
//	Default values:	"#666666"; "#EBEBEB"
$AGENT_TEXT_COLOR = "#666666";
$AGENT_TEXT_BK_COLOR ="#EBEBEB";

//	CALL-ME DISPLAYED
//	Whether or not call-me functionality is displayed in the web-chat pop-up.
//	Default value:	"true"
$SHOW_CALL_ME = "true";

//	CHAT HISTORY SEND ME OPTION DISPLAYED
//	Whether or not send chat history after closing webcomm functionality is displayed in the web-chat pop-up.
//	Default value:	"true"
$SHOW_CHAT_HISTORY_EMAIL_ME = "true";

//	QUESTION POPUP DISPLAY
//	Length of time before offering pop-up.
//	Default value:	5000 (5 seconds)
$POPUP_WAIT_TIME = 5000;

//	WEB CHAT SKILLSET
//	The default web chat skillset.
//	Default value:	"WC_Default_Skillset"
$WEBCHAT_SKILLSET = "WC_Default_Skillset";

//	WEB CHAT SERVICE SKILLSET
//	The web chat skillset to check service against. Upon this skillset depends the display of the home page.
//	Default value:	"WC_Default_Skillset"
$WEBCHAT_SERVICE_SKILLSET = "WC_Default_Skillset";

//	WEB CHAT SKILLSETS
//	Web-chat skillsets configured on CCMM.
//	Default value:	array("WC_Default_Skillset" => "Default");
//	Sample value:	array("WC_Default_Skillset" => "Default", "WC_Sales_Skillset" => "Sales", "WC_Information_Skillset" => "Information");
$WEBCHAT_SKILLSETS = array("WC_Default_Skillset" => "Default");

//	WEB CHAT HANG TIME
//	Length of time the chat request failure message will remain displayed.
//	Default value:	3000 (3 seconds)
$WEBCHAT_FAILED_HANG_TIME = 3000;

//	WEBCHAT_CONNECTION_ALERT
//	Notify the customer of agent disconnect via alert.
//	Default value:	"true"
$WEBCHAT_CONNECTION_ALERT = "true";

//	CALL-BACK SKILLSET
//	The default call back skillset.
//	Default value:	"OB_Default_Skillset"
$CALL_BACK_SKILLSET = "OB_Default_Skillset";

//	CALL-BACK SKILLSETS
//	Call-back skillsets configured on CCMM.
//	Default value:	array("OB_Default_Skillset" => "Default");
//	Sample value:	array("OB_Default_Skillset" => "Default", "OB_Sales_Skillset" => "Sales", "OB_Information_Skillset" => "Information");
$CALL_BACK_SKILLSETS = array("OB_Default_Skillset" => "Default");

//	CALL-BACK SUBMITTED HANG TIME
//	Length of time the submitted call-back request pop-up will remain displayed.
//	Default value:	3000 (3 seconds)
$CALL_BACK_HANG_TIME = 3000;

//	CALL-BACK AUTOMATED
//	Whether or not the submitted call-back is automated. Automated call-back's use the first custom field.
//	Default value:	"true"
$CALL_BACK_AUTOMATED = "true";

//	EMAIL SKILLSETS
//	Email skillsets configured on CCMM.
//	Default value:	array("postmaster@localhost" => "Default");
//	Sample value:	array("sales@yourcompany.com" => "Sales", "information@yourcompany.com" => "Information");
$EMAIL_SKILLSETS = array("postmaster@localhost" => "Default");

//	EMAIL SUBMITTED HANG TIME
//	Length of time the submitted email-form request pop-up will remain displayed.
//	Default value:	3000 (3 seconds)
$EMAIL_HANG_TIME = 3000;

//	HEART-BEAT MAXIMUM
//	Maximum length of time before customer is notified of possible disconnect of agent from session.
//	Default value:	90 (90 seconds) [Should be set at least double the agents desktop 'Keep Alive Time'
$HEART_BEAT_MAXIMUM = 90;

//	PAGE-PUSH
//	Whether or not page-push is enabled.
//	Default value:	"false"
$PAGE_PUSH_ENABLED = "false";

//	LOGGING
//	Whether or not logging is enabled.
//	Default value:	"false"
//	Do not set to true except when advised so.
$debug = "false";
//	All soap messages to and from the server will be logged:
//	- It will dramatically slow down system response times.
//	- Messages which will contain sensitive information.

//	LOG FILE NAME
//	Log File Location and name.
//	Default value:	"Log_Files\\CI_Logging_{number}.log"
$LOG_FILE_NAME_TEMPLATE = "Log_Files\\CI_Logging_{number}.log";

//	LOG FILE MAX NUMBER
//	Maximum number of the log files on the system
//	Default value:	5
$MAX_NUMBER_OF_LOG_FILES = 5;

//	LOG FILE SIZE
//	Log file size in MB
//	Default value:	50
$LOG_FILE_SIZE = 50;

?>
