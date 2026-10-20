<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function get_web_on_hold_urls($sessionkey, $tag, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/GetWebOnHoldURLs";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIWebCommsWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';

	//  Set the operation to be called
	$client->operation = "GetWebOnHoldURLs";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<GetWebOnHoldURLs xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<tagName>'.$tag.'</tagName>
					<sessionKey>'.$sessionkey.'</sessionKey>
				</GetWebOnHoldURLs>
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

	$returnValue = array(	'Duration' 	=>	"",
												'URL' 			=>	"");

	if(isset($response['GetWebOnHoldURLsResult']['URLList']))
	{   
		foreach($response['GetWebOnHoldURLsResult']['URLList'] as $value)
		{
			$returnValue = array(	'Duration'	=>	$value['holdTime'],
									'URL'		=>	$value['URL']);
			//	Use only the first reply
			break;
		}
	}

	return $returnValue;
}

?>

