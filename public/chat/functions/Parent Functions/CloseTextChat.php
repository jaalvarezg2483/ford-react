<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function CloseTextChat($Username, $contactID, $SessionKey, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/logout.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/logout.php');  

	logout($Username, $contactID, $SessionKey, $HomeDir);
}

$ajax->export("CloseTextChat", "page->CloseTextChat");	//	Export function

?>