<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function send_message($session_key, $contact_id, $message, $hiddenMessage, $MsgType, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/WriteChatMessage";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIWebCommsWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Encoding the text to process it below 
	$message = utf8_encode($message);

	//	Convert ascii & extendend ascii for safe soap travel
	$message = htmlentities($message,null,'UTF-8');
	$str = preg_replace("/%u([0-9a-f]{3,4})/i","&#x\\1;",urldecode($message));
	$message = html_entity_decode($str,null,'UTF-8');

	//	Replace quotes (")
	$message = str_replace("&quot;", "\"", $message);

	//  Set the operation to be called
	$client->operation = "WriteChatMessage";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<WriteChatMessage xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<contactID>'.$contact_id.'</contactID>
					<message>'.str_replace("&amp;#","&#", htmlspecialchars($message)).'</message>
					<hiddenMessage>'.htmlspecialchars($hiddenMessage).'</hiddenMessage>
					<chatMessageType>'.$MsgType.'</chatMessageType>
					<sessionKey>'.$session_key.'</sessionKey>
				</WriteChatMessage>
			</soap:Body>
		</soap:Envelope>';

	//	Send the SOAP message and specify the soapaction
	$response = $client->send($mysoapmsg, $soapaction);

	//	Ror debug only - print request and response
	if($debug == 'true')
	{
		if ($client->fault) 
		{
			logtofile("Fault");
			logtofile($response);
		}
		logtofile("SOAP query");
		logtofile($client->request);
		logtofile("SOAP response");
		logtofile($client->response);
	}

	return;
}

?>

