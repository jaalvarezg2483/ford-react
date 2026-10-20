<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2013 Avaya Inc. All Rights Reserved

function logToFile($msg)
{ 
	global $home;
	require($home.'include/config.php');

	$filename = $home.str_replace("{number}", "1", $LOG_FILE_NAME_TEMPLATE);
	
	//	Open file
	$fd = fopen($filename, "a");

	//	Append date/time to message
	$str = "[" . date("Y/m/d h:i:s", mktime()) . "] " . $msg;

	//	Write string
	fwrite($fd, $str . "\r\n");

	//	Close file
	fclose($fd);
	
	if( DoesLogFileExceedMaxSize($filename, $LOG_FILE_SIZE) )
	{
		RenameLogFiles($MAX_NUMBER_OF_LOG_FILES, $LOG_FILE_NAME_TEMPLATE);
	}
}

function DoesLogFileExceedMaxSize($filename, $size) 
{
	if( filesize($filename) >= $size*1024*1024 )
	{
		return true;
	}
	return false;
}

function RenameLogFiles($maxfilenumber, $logfiletemplate) {
	$lastlogname = str_replace("{number}", $maxfilenumber, $logfiletemplate);
	if (file_exists( $lastlogname ))  // remove last log file if exists
	{
		unlink( $lastlogname );
	}
	for ($i=$maxfilenumber-1; $i>0; $i--) 
	{
		$old = str_replace("{number}", $i, $logfiletemplate);
		$new = str_replace("{number}", $i+1, $logfiletemplate);
		if (file_exists( $old ))
		{
			rename($old, $new);
		}
	}
}

function CheckHomeDir($HomeDir, $file)
{
	global $debug;

	if($HomeDir != "")
	{
		if(!is_readable($HomeDir.$file))
		{ 
			if($debug == "true")
			{
				logtofile("Error : Invalid file ".$HomeDir.$file);
			}
			return false;
		}
		else
		{
			if($debug == "true")
			{
				logtofile("Debug : Valid file ". $HomeDir.$file);
			}
			return true;
		}
	}
	else
	{
		if($debug == "true")
		{
			logtofile("Debug : Home dir is empty - no check required");
		}
		return true;
	}
}

?>