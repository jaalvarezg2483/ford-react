<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function request_call_later($sessionkey, $cust_id, $skillset_id, $details, $subject, $time, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/RequestScheduledCallbackUTC";

	//	Endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CICustomerWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';
	
	//  Set the operation to be called
	$client->operation = "RequestScheduledCallbackUTC";
	
	//	Check if call back should be automated via custom fields
	if ($CALL_BACK_AUTOMATED == 'true')
	{
		//	Declare SOAP message
		$mysoapmsg = 
			'<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<RequestScheduledCallbackUTC xmlns="http://webservices.ci.ccmm.applications.nortel.com">
						<custID>'.$cust_id.'</custID>
						<newContact>
							<skillsetID xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$skillset_id.'</skillsetID>
							<priority xmlns="http://datatypes.ci.ccmm.applications.nortel.com">Priority_3_Medium_High</priority>
							<timezone xmlns="http://datatypes.ci.ccmm.applications.nortel.com">-999</timezone>
							<text xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$details.'</text>
							<subject xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$subject.'</subject>
							<callbackTime xmlns="http://datatypes.ci.ccmm.applications.nortel.com">
								<milliseconds>'.$time.'</milliseconds>
							</callbackTime>
							<customFields xmlns="http://datatypes.ci.ccmm.applications.nortel.com">
								<name>CallbackType</name>
								<text>CLICK_TO_CALL</text>
								<isTextVisible>true</isTextVisible>
							</customFields>
						</newContact>
						<sessionKey>'.$sessionkey.'</sessionKey>
					</RequestScheduledCallbackUTC>
				</soap:Body>
			</soap:Envelope>';
	}
	else
	{
		//	Create SOAP message
		$mysoapmsg = 
			'<?xml version="1.0" encoding="utf-8"?>
			<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
				<soap:Body>
					<RequestScheduledCallbackUTC xmlns="http://webservices.ci.ccmm.applications.nortel.com">
						<custID>'.$cust_id.'</custID>
						<newContact>
							<skillsetID xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$skillset_id.'</skillsetID>
							<priority xmlns="http://datatypes.ci.ccmm.applications.nortel.com">Priority_3_Medium_High</priority>
							<timezone xmlns="http://datatypes.ci.ccmm.applications.nortel.com">-999</timezone>
							<text xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$details.'</text>
							<subject xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$subject.'</subject>
							<callbackTime xmlns="http://datatypes.ci.ccmm.applications.nortel.com">
								<milliseconds>'.$time.'</milliseconds>
							</callbackTime>
						</newContact>
						<sessionKey>'.$sessionkey.'</sessionKey>
					</RequestScheduledCallbackUTC>
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

	return;
}


?>