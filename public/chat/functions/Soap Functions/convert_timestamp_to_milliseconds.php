<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function ConvertToMillisecond($hour, $min, $day, $month, $year, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/TimeStampToMilliseconds";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIUtilityWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Set the operation to be called
	$client->operation = "TimeStampToMilliseconds";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<TimeStampToMilliseconds xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<timestamp>
						<day xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$day.'</day>
						<month xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$month.'</month>
						<year xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$year.'</year>
						<hour xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$hour.'</hour>
						<minute xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$min.'</minute>
						<second xmlns="http://datatypes.ci.ccmm.applications.nortel.com">0</second>
						<UTCOffsetMins xmlns="http://datatypes.ci.ccmm.applications.nortel.com">0</UTCOffsetMins>
					</timestamp>
				</TimeStampToMilliseconds>
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

	$milli = $response['TimeStampToMillisecondsResult'];

	return $milli;
}

?>