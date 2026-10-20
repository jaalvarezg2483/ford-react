<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function register($firstName, $lastName, $email, $password, $contactNumberIntCode, $contactNumberAreaCode, $contactNumber, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/RegisterNewCustomer";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CICustomerWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Set the operation to be called
	$client->operation = "RegisterNewCustomer";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<RegisterNewCustomer xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<newCustomer>
						<title xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></title>
						<firstName xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$firstName.'</firstName>
						<lastName xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'. $lastName.'</lastName>
						<username xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$email.'</username>
						<password xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$password.'</password>
					</newCustomer>
					<newPhoneNumber>
						<internationalCode xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$contactNumberIntCode.'</internationalCode>
						<areaCode xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$contactNumberAreaCode.'</areaCode>
						<number xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$contactNumber.'</number>
						<phoneNumberType xmlns="http://datatypes.ci.ccmm.applications.nortel.com">Unspecified</phoneNumberType>
						<doNotCall xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</doNotCall>
						<doNotCallSpecified xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</doNotCallSpecified>
						<defaultPhoneNumber xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultPhoneNumber>
						<defaultPhoneNumberSpecified xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultPhoneNumberSpecified>
					</newPhoneNumber>
					<newAddress>
						<line1 xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></line1>
						<line2 xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></line2>
						<line3 xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></line3>
						<line4 xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></line4>
						<line5 xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></line5>
						<zipcode xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></zipcode>
						<country xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></country>
						<defaultAddress xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultAddress>
						<defaultAddressSpecified xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultAddressSpecified>
					</newAddress>
					<newEmailAddress>
						<emailAddress xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$email.'</emailAddress>
						<defaultEmailAddress xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultEmailAddress>
						<defaultEmailAddressSpecified xmlns="http://datatypes.ci.ccmm.applications.nortel.com">false</defaultEmailAddressSpecified>
					</newEmailAddress>
				</RegisterNewCustomer>
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

	return $response['RegisterNewCustomerResult'];
}

?>