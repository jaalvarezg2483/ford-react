<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function SetupTextChat($session_key, $customer_id, $skillsetID, $ChatSubject, $ChatQuery, $CustomField_1_name, $CustomField_1_value, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/is_skillset_in_use.php"))
		return "-1";

	//	Is skillset in service
	require_once($HomeDir.'functions/Soap Functions/is_skillset_in_use.php');
	$result = is_skillset_in_use($session_key, $skillsetID, $HomeDir);

	if($result == "true")
	{
		//	Request text chat
		require_once($HomeDir.'functions/Soap Functions/request_text_chat.php');
		$contact_id = request_text_chat($skillsetID, $session_key, $customer_id, 'false', $ChatSubject, $ChatQuery, $CustomField_1_name, $CustomField_1_value, $HomeDir);

		//	Check text chat session failure due to maximum concurrent contact reached per customer or per skillset
		if($contact_id == "-1")
		{
			//	Text chat session failed, customer max reason; return -2
			return "-2";
		}
		else if($contact_id == "-2")
		{
			//	Text chat session failed, skillset max reason; return -3
			return "-3";
		}
		return $contact_id;
	}
	else
	{
		return "-1";
	}
}

$ajax->export("SetupTextChat", "page->SetupTextChat");	//	Export function

?>