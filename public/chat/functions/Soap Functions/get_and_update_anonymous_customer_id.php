<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

//This function will only update the empty fields of an anonymous customer.  
function get_and_update_anonymous_customer_id($session_key, $AnonymousUserID, $EmailAddress, $PhoneNumber, $FirstName, $LastName, $Title, $AddressLine1, $AddressLine2, $AddressLine3, $AddressLine4, $AddressLine5, $AddressCounty, $AddressZipCode, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/GetAndUpdateAnonymousCustomerID";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIUtilityWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//	Encode parameters requiring encoding
	$EmailAddress_utf8 = utf8_encode($EmailAddress);
	$FirstName = utf8_encode($FirstName);
	$LastName = utf8_encode($LastName);
	$Title = utf8_encode($Title);
	$AddressLine1 = utf8_encode($AddressLine1);
	$AddressLine2 = utf8_encode($AddressLine2);
	$AddressLine3 = utf8_encode($AddressLine3);
	$AddressLine4 = utf8_encode($AddressLine4);
	$AddressLine5 = utf8_encode($AddressLine5);
	$AddressZipCode = utf8_encode($AddressZipCode);
	$AddressCounty = utf8_encode($AddressCounty);
	
	$FirstName = htmlentities($FirstName);
	$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($FirstName));
	$FirstName_utf8 = html_entity_decode($str, null, 'UTF-8');
	
	$LastName = htmlentities($LastName);
	$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($LastName));
	$LastName_utf8 = html_entity_decode($str, null, 'UTF-8');
	
	$Title = htmlentities($Title);
	$str = preg_replace("/%u([0-9a-f]{3,4})/i", "&#x\\1;", urldecode($Title));
	$Title_utf8 = html_entity_decode($str, null, 'UTF-8');

	//  Set the operation to be called
	$client->operation = "GetAndUpdateAnonymouseCustomerID";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<GetAndUpdateAnonymousCustomerID xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<LoginResult>
						<SessionKey>'.$session_key.'</SessionKey>
						<AnonymousID>'.$AnonymousUserID.'</AnonymousID>
					</LoginResult>
					<EmailAddress>'.$EmailAddress_utf8.'</EmailAddress>
					<PhoneNumber>'.$PhoneNumber.'</PhoneNumber>
					<ThisCustomer>
						<title xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$Title_utf8.'</title>
						<firstName xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$FirstName_utf8.'</firstName>
						<lastName xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$LastName_utf8.'</lastName>
						<addressList xmlns="http://datatypes.ci.ccmm.applications.nortel.com">
							<CIAddressReadType>
								<line1>'.$AddressLine1.'</line1>
								<line2>'.$AddressLine2.'</line2>
								<line3>'.$AddressLine3.'</line3>
								<line4>'.$AddressLine4.'</line4>
								<line5>'.$AddressLine5.'</line5>
								<zipcode>'.$AddressZipCode.'</zipcode>
								<country>'.$AddressCounty.'</country>
							</CIAddressReadType>
						</addressList>
					</ThisCustomer>
				</GetAndUpdateAnonymousCustomerID>
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

	if(!isset($response['GetAndUpdateAnonymousCustomerIDResult']))
		return -1;

	return $response['GetAndUpdateAnonymousCustomerIDResult'];
}

?>