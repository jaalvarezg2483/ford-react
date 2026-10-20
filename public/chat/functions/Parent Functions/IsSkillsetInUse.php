<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function IsSkillsetInUse($Session_Key, $SkillsetID, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/is_skillset_in_use.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/is_skillset_in_use.php');  

	return is_skillset_in_use($Session_Key, $SkillsetID, $HomeDir);
}

$ajax->export("IsSkillsetInUse", "page->IsSkillsetInUse");	//	Export function

?>