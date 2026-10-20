<?php

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved

function get_history_since($session_key, $contact_id, $LastReadTime, $HomeDir)
{
	//	Require necessary SOAP files
	require_once($HomeDir.'library/nusoap.php');

	//	Include configuration settings needed for this function
	include($HomeDir.'include/config.php');

	//	Define the soapaction as found in the wsdl
	$soapaction = "http://webservices.ci.ccmm.applications.nortel.com/ReadChatMessage";

	//	Define endpoint address
	$wsdl = $HTTP_REQUEST_TYPE.$CCMM_MACHINE_NAME.":".$HTTP_REQUEST_PORT."/ccmmwebservices/CIWebCommsWs.asmx";

	//	Create client object 
	$client = new nusoap_client($wsdl, 'true');

	//	Set decoding option
	$client->soap_defencoding = 'utf-8';
	$client->decode_utf8 = false;

	//  Set the operation to be called
	$client->operation = "ReadChatMessage";
	
	//	Declare SOAP message
	$mysoapmsg = 
		'<?xml version="1.0" encoding="utf-8"?>
		<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
			<soap:Body>
				<ReadChatMessage xmlns="http://webservices.ci.ccmm.applications.nortel.com">
					<contactID>'.$contact_id.'</contactID>
					<lastReadTime>
						<milliseconds xmlns="http://datatypes.ci.ccmm.applications.nortel.com">'.$LastReadTime.'</milliseconds>
					</lastReadTime>
					<isWriting>false</isWriting>
					<sessionKey>'.$session_key.'</sessionKey>
				</ReadChatMessage>
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

	$chatHistory = "";
	$chatTime;
	$PageFromAgent = "";
	$PlayBeep = "false";
	$AgentTyping = "false";
	$AgentDisconnect = "false";

	//	Only one message received
	if(isset($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessage']))
	{ 
		//	Replace '<' (the less than symbol) with its HTML attribute equivalent for displaying possibility
		$response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessage'] = str_replace ("<" , "&lt;", $response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessage'], $count);

		if($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessageType'] == "Chat_Message_from_Customer")
		{
			$chatHistory .= '<div style="background-color:'.$CUSTOMER_TEXT_BK_COLOR.';padding:4px;"><font color='.$CUSTOMER_TEXT_COLOR.'>'.$response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessage'].'</font></div>';
		}
		else
		{
			$chatHistory .= '<div style="background-color:'.$AGENT_TEXT_BK_COLOR.';padding:4px;"><font color='.$AGENT_TEXT_COLOR.'>'.$response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessage'].'</font></div>';	
			$PlayBeep = "true";
		}

		$chatTime     = $response['ReadChatMessageResult']['lastReadTime']['milliseconds'];
		if($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessageType'] == "Page_Pushed_by_Agent")
		{
			$PageFromAgent = $response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['hiddenMessage'];
		}

		if($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['chatMessageType'] == "Session_Disconnected_by_Agent")
		{
			if($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['hiddenMessage'] == "<Last Agent Disconnect>")
			{
				$AgentDisconnect = "true";
			}
		}
	}

	//	More than one message received
	elseif(isset($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType']['0']))
	{
		foreach($response['ReadChatMessageResult']['listOfChatMessages']['CIChatMessageReadType'] as $value)
		{
			//	Replace '<' (the less than symbol) with its HTML attribute equivalent for displaying possibility
			$value['chatMessage'] = str_replace ("<" , "&lt;", $value['chatMessage'], $count);

			if($value['chatMessageType'] == "Chat_Message_from_Customer")
			{
				$chatHistory .= '<div style="background-color:'.$CUSTOMER_TEXT_BK_COLOR.';padding:4px;"><font color='.$CUSTOMER_TEXT_COLOR.'>'.$value['chatMessage'].'</font></div>';
			}
			else
			{
				$chatHistory .= '<div style="background-color:'.$AGENT_TEXT_BK_COLOR.';padding:4px;"><font color='.$AGENT_TEXT_COLOR.'>'.$value['chatMessage'].'</font></div>';
				$PlayBeep = "true";
			}

			$chatTime     = $response['ReadChatMessageResult']['lastReadTime']['milliseconds'];
			if($value['chatMessageType'] == "Page_Pushed_by_Agent")
			{
				$PageFromAgent = $value['hiddenMessage'];
			}
			
			if($value['chatMessageType'] == "Session_Disconnected_by_Agent")
			{
				if($value['hiddenMessage'] == "<Last Agent Disconnect>")
				{
					$AgentDisconnect = "true";
				}
			}
		}
	}

	//	No messages received
	elseif(isset($response['ReadChatMessageResult']['lastReadTime']['milliseconds']))   
	{
		$chatHistory = "";
		$chatTime = $response['ReadChatMessageResult']['lastReadTime']['milliseconds'];
	}
	else
	{ 
		$chatHistory = "";
		$chatTime = "0";
		$PageFromAgent = "";
	}

	if(isset($response['ReadChatMessageResult']['isWriting']))
	{
		$AgentTyping = $response['ReadChatMessageResult']['isWriting'];
	}

	$returnArray = array(	'time'				=>	$chatTime,
							'text'				=>	$chatHistory,
							'PageFromAgent'		=>	$PageFromAgent,
							'PlayBeep'			=>	$PlayBeep,
							'AgentTyping'		=>	$AgentTyping,
							'AgentDisconnect'	=>	$AgentDisconnect);

	return $returnArray;
}

?>

