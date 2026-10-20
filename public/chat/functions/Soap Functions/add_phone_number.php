<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function add_phone_number($Session_Key, $CustomerID, $PhoneNumber, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/AddPhoneNumber";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CICustomerWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Set the operation to be called
	$client->operation = "AddPhoneNumber";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<AddPhoneNumber xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<id>'.$CustomerID.'</id>
					<newPhoneNumber>
						<internationalCode xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></internationalCode>
						<areaCode xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></areaCode>
						<number xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$PhoneNumber.'</number>
						<phoneNumberType xmlns="http://datatypes.ci.ccmm.applications.nortel.com">Unspecified</phoneNumberType>
						<doNotCall xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</doNotCall>
						<doNotCallSpecified xmlns="http://datatypes.ci.ccmm.applications.nortel.com">true</doNotCallSpecified>
						<defaultPhoneNumber xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultPhoneNumber>
						<defaultPhoneNumberSpecified xmlns="http://datatypes.ci.ccmm.applications.nortel.com">true</defaultPhoneNumberSpecified>
					</newPhoneNumber>
					<sessionKey>'.$Session_Key.'</sessionKey>
				</AddPhoneNumber>
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

	return $response['AddPhoneNumberResult'];
}

?>