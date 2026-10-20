<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function SendEmail($name, $from_address, $to_address, $subject, $message, $HomeDir)
{
	//	Include config settings needed for this function
	include($HomeDir.'include/config.php');

	//	Word wrap message for lines longer than 70 characters
	$message = wordwrap($message, 70);

	// Format from address appropriately, and add other header information (do not add name to From: as this can cause the email to be returned by the receiving server)
	$header = "From: " . $from_address . PHP_EOL .
	'MIME-Version: 1.0' . PHP_EOL .
	'Content-Type: text/plain; charset=UTF-8' . PHP_EOL .
	'X-Mailer: PHP/' . phpversion();

	//	If debug set, output mailing parameters
	if($debug == 'true')
	{
		logtofile("Email Message:");
		logtofile($header);
		logtofile($to_address);
		logtofile($subject);
		logtofile($message);
	}

	//	PHP mail function called to post form data; returns boolean
	//	Note: for the mail function to be available an installed and working email system is required
	$response = mail($to_address, $subject, $message, $header);

	//	Return PHP mail response
	return $response;
}

$ajax->export("SendEmail", "page->SendEmail");	//	Export function

?>