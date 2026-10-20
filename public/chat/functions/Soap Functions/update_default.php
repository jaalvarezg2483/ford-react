<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function update_default($sessionKey, $phoneNumberID, $isDefault, $homeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/UpdateDefault";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIPhoneNumberWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Set the operation to be called
	$client->operation = "UpdateDefault";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<UpdateDefault xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<id>'.$phoneNumberID.'</id>
					<newValue>'.$isDefault.'</newValue>
					<sessionKey>'.$sessionKey.'</sessionKey>
				</UpdateDefault>
			</soap:Body>
		</soap:Envelope>';

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

	return $response['UpdateDefaultResult'];
}

?>