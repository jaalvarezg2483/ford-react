<?php

//	Avaya Contact Center Multimedia
//	Copyright � 2010 - 2014 Avaya Inc. All Rights Reserved

function ReadSkillsetByName($session_key, $skillset_name, $HomeDir)
{
	$HomeDir = getcwd(); $HomeDir = (basename($HomeDir) != "chat")? $HomeDir . "/chat/" : $HomeDir . "/";

	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/read_skillset_by_name.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/read_skillset_by_name.php');
	$result = read_skillset_by_name($session_key, $skillset_name, $HomeDir);

	return $result;
}

$ajax->export("ReadSkillsetByName", "page->ReadSkillsetByName");	//	Export function

?>