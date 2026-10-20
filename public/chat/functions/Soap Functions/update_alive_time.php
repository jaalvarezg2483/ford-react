<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function update_alive_time($session_key, $contact_id, $isTyping, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIWebCommsWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//	Get number value of $SERVER_VERSION_NUMBER
	$SERVER_VERSION = floatval($SERVER_VERSION_NUMBER);

	//	If the server version is previous to the R6.3 it will not contain the UpdateAliveTimeAndUpdateIsTyping method
	if ($SERVER_VERSION > 6.2)
	{
		//	Define the soapaction as found in the wsdl
		$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/UpdateAliveTimeAndUpdateIsTyping";

		//  Set the operation to be called
		$client->operation = "UpdateAliveTimeAndUpdateIsTyping";
		
		//	Declare SOAP message
		$mysoapmsg = 
			'<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<UpdateAliveTimeAndUpdateIsTyping xmlns="http://webservices.ci.ccmm.applications.nortel.com">
						<contactID>'.$contact_id.'</contactID>
						<sessionKey>'.$session_key.'</sessionKey>
						<isTyping>'.$isTyping.'</isTyping>
					</UpdateAliveTimeAndUpdateIsTyping>
				</soap:Body>
			</soap:Envelope>';
	}
	else
	{
		//	Define the soapaction as found in the wsdl
		$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/UpdateAliveTime";

		//  Set the operation to be called
		$client->operation = "UpdateAliveTime";
		
		//	Declare SOAP message
		$mysoapmsg = 
			'<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<UpdateAliveTime xmlns="http://webservices.ci.ccmm.applications.nortel.com">
						<contactID>'.$contact_id.'</contactID>
						<sessionKey>'.$session_key.'</sessionKey>
					</UpdateAliveTime>
				</soap:Body>
			</soap:Envelope>';
	}

	//	Send the SOAP message and specify the soapaction
	$response = $client->send($mysoapmsg, $soapaction);

	//	For debug only - print request and response
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

	//	Check for error
	if(isset($response['faultstring']))
	{
		if (ereg('8756', $response['faultstring']))
		{
			return -1;
		}
		else if (ereg('Server did not recognize the value of HTTP Header SOAPAction', $response['faultstring']))
		{
			logtofile($response['faultstring']);
			logtofile("Consider setting the SERVER_VERSION_NUMBER variable of the config.php file to the CCMM Server version.");
		}
	}

	//	Return the appropriate response
	if ($SERVER_VERSION > 6.2)
	{
		$result = $response['UpdateAliveTimeAndUpdateIsTypingResult']['milliseconds'];
	}
	else
	{
		$result = $response['UpdateAliveTimeResult']['milliseconds'];
	}

	if (is_null($result))
	{
		$result = -1;
	}

	return $result;
}

?>