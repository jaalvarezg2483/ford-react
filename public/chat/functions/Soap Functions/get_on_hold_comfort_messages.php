<?php

	//	Avaya Aura Contact Center Multimedia	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function get_on_hold_comfort_messages($contact_id, $session_key, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php'); 

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/GetContactOnHoldMessages";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIWebCommsWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';
	$client->decode_utf8 = false;

	//  Set the operation to be called
	$client->operation = "GetContactOnHoldMessages";
	
	//	Declare SOAP message
	$mysoapmsg = 
	'<?xml version="1.0" encoding="utf-8"?>
	<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
		<soap:Body>
			<GetContactOnHoldMessages xmlns="http://webservices.ci.ccmm.applications.nortel.com">
				<contact_id>'.$contact_id.'</contact_id>
				<sessionKey>'.$session_key.'</sessionKey>
			</GetContactOnHoldMessages>
		</soap:Body>
	</soap:Envelope>';

	//	Send the SOAP message and specify the soapaction
	$response = $client->send($mysoapmsg, $soapaction);

	//for debug only - print request and response
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

	$result = "";

	if(isset($response['GetContactOnHoldMessagesResult']['listOfOnHoldMessages']))
	{
		if(isset($response['GetContactOnHoldMessagesResult']['listOfOnHoldMessages']['CICOnHoldMessages']['Message']))
		{
			//	One message received
			$result .= $response['GetContactOnHoldMessagesResult']['listOfOnHoldMessages']['CICOnHoldMessages']['Message'];
			$result .= "<br />";
		}
		if(isset($response['GetContactOnHoldMessagesResult']['listOfOnHoldMessages']['CICOnHoldMessages']['0']))
		{
			//	More than one message received
			foreach($response['GetContactOnHoldMessagesResult']['listOfOnHoldMessages']['CICOnHoldMessages'] as $value)
			{
				$result .= $value['Message'];
				$result .= "<br />";
			}
		}
	}
	else
	{
		//	Since no on hold message use default
		$result = $CHAT_DEFAULT_ON_HOLD_MESSAGE_TEXT;
	}

	return $result;
}

?>