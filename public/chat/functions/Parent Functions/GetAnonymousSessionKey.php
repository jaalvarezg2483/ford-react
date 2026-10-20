<?php

	//	Avaya Contact Center Multimedia
	//	Copyright � 2010 - 2014 Avaya Inc. All Rights Reserved

function GetAnonymousSessionKey($HomeDir)
{
	$HomeDir = getcwd(); $HomeDir = (basename($HomeDir) != "chat")? $HomeDir . "/chat/" : $HomeDir . "/";

	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/get_anonymous_session_key.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/get_anonymous_session_key.php');
	$result = get_anonymous_session_key($HomeDir);

	return $result;
}

$ajax->export("GetAnonymousSessionKey", "page->GetAnonymousSessionKey");	//	Export function

?>