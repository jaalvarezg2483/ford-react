<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reservedd

function request_text_chat($skillsetID, $session_key, $customer_id, $CreateAsClosed, $ChatSubject, $ChatQuery, $CustomField_1_name, $CustomField_1_value, $HomeDir)
{
	$CustomField = '';
	if($CustomField_1_name != "")
	{
		//  Encoding the text to process it below
		$CustomField_1_name = utf8_encode($CustomField_1_name);
		$CustomField_1_value = utf8_encode($CustomField_1_value);
		
		//	Encode parameters requiring encoding
		$CustomField_1_name = htmlentities($CustomField_1_name);
		$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($CustomField_1_name));
		$CustomField_1_name_utf8 = html_entity_decode($str, null, 'UTF-8');
		
		//	Encode parameters requiring encoding
		$CustomField_1_value = htmlentities($CustomField_1_value);
		$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($CustomField_1_value));
		$CustomField_1_value_utf8 = html_entity_decode($str, null, 'UTF-8');
	
		$CustomField = '<customFields xmlns="http://datatypes.ci.ccmm.applications.nortel.com">
		<name>'.$CustomField_1_name_utf8.'</name>
		<text>'.$CustomField_1_value_utf8.'</text>
		<isTextVisible>true</isTextVisible>
		</customFields>';
	}


	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/RequestTextChat";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CICustomerWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Encoding the text to process it below 
	$ChatSubject = utf8_encode($ChatSubject);
	
	//	Encode parameters requiring encoding
	$ChatSubject = htmlentities($ChatSubject);
	$str = preg_replace("/%u(['0-9a-f']{3,4})/i", "&#x\\1;", urldecode($ChatSubject));
	$ChatSubject_utf8 = html_entity_decode($str, null, 'UTF-8');


	//  Set the operation to be called
	$client->operation = "RequestTextChat";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<RequestTextChat xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<custID>'.$customer_id.'</custID>
					<newContact>
						<skillsetID xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$skillsetID.'</skillsetID>
						<priority xmlns="http://datatypes.ci.ccmm.applications.nortel.com">Priority_3_Medium_High</priority>
						<timezone xmlns="http://datatypes.ci.ccmm.applications.nortel.com">-999</timezone>
						<textHTML xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$ChatQuery.'</textHTML>
						<subject xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$ChatSubject_utf8.'</subject>
						<callbackTime xmlns="http://datatypes.ci.ccmm.applications.nortel.com"></callbackTime>
						'.$CustomField.'
					</newContact>
					<createAsClosed>'.$CreateAsClosed.'</createAsClosed>
					<sessionKey>'.$session_key.'</sessionKey>
				</RequestTextChat>
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

	// Check response for error
	if(isset($response['faultstring']))
	{
		// Check faultstring for maximum concurrent contact errorcode: 2832
		if (ereg('2833', $response['faultstring']))
			return -1;
		else if (ereg('2834', $response['faultstring']))
			return -2;
	}

	return $response['RequestTextChatResult'];
}

?>

