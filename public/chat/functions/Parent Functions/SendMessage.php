<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function SendMessage($session_key, $contact_id, $Message, $hiddenMessage, $MsgType, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/send_message.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/send_message.php');
	$result = send_message($session_key, $contact_id, $Message, $hiddenMessage, $MsgType, $HomeDir);

	return $result;
}

$ajax->export("SendMessage", "page->SendMessage");	//	Export function

?>