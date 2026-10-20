<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function IsSkillsetInService($SkillsetName, $HomeDir)
{
	if(!CheckHomeDir($HomeDir, "functions/Soap Functions/is_skillset_in_service.php"))
		return "-1";

	require_once($HomeDir.'functions/Soap Functions/is_skillset_in_service.php');  

	return is_skillset_in_service($SkillsetName, $HomeDir);
}

$ajax->export("IsSkillsetInService", "page->IsSkillsetInService");	//	Export function

?>