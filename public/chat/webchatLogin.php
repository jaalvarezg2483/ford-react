<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved
	require_once ("include/config.php");
	require_once($home."include/main_pre_body.php");

?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml">

	<head>
		<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
		<title><?php echo $CHAT_TITLE_TEXT?></title>
		<link rel="stylesheet" type="text/css" href="<?php echo $home?>css/style.css" />
		<link rel="stylesheet" type="text/css" href="<?php echo $home?>css/calendar.css" />
		<link rel="stylesheet" type="text/css" href="<?php echo $home?>css/time.css" />
	</head>

	<!--	The 'onbeforeunload' event, though not in HTML standard, is used here because the standard 'onunload' event does not fire reliably in Chrome or Firefox	-->
	<body onload="Javascript:onLoginLoadDo()" style="margin:0px;" onbeforeunload="closeAgentWin()">

<?php

	require_once($home."include/main_post_body.php");
	require_once($home."pop-ups/webchat_offer/webchat_pop_over.php");

?>

		<table id="webchatLogin" class="popover_window" width="430" border="0" cellspacing="0" cellpadding="0">
			<tr>
				<td width="100%">
					<table id="" class="top_gradient" border="0" cellspacing="0" cellpadding="0">

						<!--	Header & Logo	-->

						<tr height="70">
							<td width="81" style="padding-top:25px;padding-left:50px;" align="right" valign="top" ><img alt="" src="<?php echo $home?>img/smallLogo.png" /></td>
							<td width="349" style="padding-top:25px;padding-left:15px;" align="left" valign="top"><img alt="" src="<?php echo $home?>img/chat.png"/></td>
						</tr>

						<!--	End Header & Logo	-->

						<tr>
							<td colspan="2" valign="top">

								<!-- Input Fields -->
								<table id="" class="webchat_text_chat" cellSpacing="0" cellPadding="0" border="0" width="100%">
									<tr>
										<td>
										<table id="webchat_user_input" class="input_fields" width="100%" valign="top"  style="display:block;" border="0" cellSpacing="3" cellPadding="0">
											<tr align="left">
												<td width="110"><?php echo $NAME_TEXT_HANDLE?></td>
												<td></td>
												<td><input type="field" maxlength="50" id="username" size="30" /></td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="name_error"></td>
											</tr>
											<tr align="left">
												<td width="110"><?php echo $PHONE_TEXT?></td>
												<td></td>
												<td><input type="field" maxlength="50" id="phone" size="30" onKeyPress="return checkSpace(event)" /></td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="phone_error"></td>
											</tr>
											<tr align="left">
												<td width="110"><?php echo $EMAIL_TEXT?></td>
												<td></td>
												<td><input type="field" maxlength="50" id="email" size="30" onKeyPress="return checkSpace(event)" /></td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="email_error"></td>
											</tr>
											<tr align="left">
												<td width="110"><?php echo $SUBJECT_TEXT?></td>
												<td></td>
												<td><input type="field" maxlength="50" id="subject" size="30" /></td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="subject_error"></td>
											</tr>
											<tr>
												<td width="110"><?PHP echo$REFERENCE_NUMBER_TEXT?></td>
												<td></td>
												<td><input type="field" maxlength="50" id="reference" size="30"></td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="reference_error"></td>
											</tr>
											<tr align="left" >
												<td width="110"><?php echo $DEPARTMENT_TEXT?></td>
												<td><font size="3" color="red">*</font></td>
												<td>
													<select style="width:205px;" id="skillset">
														<?php foreach($WEBCHAT_SKILLSETS as $SKILLSET => $SKILLSET_REFERENCE_TEXT) { ?>
															<option value="<?php echo $SKILLSET?>"><?php echo $SKILLSET_REFERENCE_TEXT?></option>
														<?php } ?>
													</select>
												</td>
											</tr>
										</table>
										</td>
									</tr>
								</table>

								<!-- End Input Fields -->

								<!-- Please Wait / Error Message Table -->

								<table id="webchat_please_wait" valign="top" class="input_fields" style="display:none;" width="100%" border="0">
									<tr>
										<td id="PleaseWait" height="152" width="438" valign="middle" align="center"><?php echo $WAIT_TEXT?></td>
									</tr>
								</table>

								<!-- End Please Wait / Error Message Table -->

							</td>
						</tr>
						<tr>
							<td align="center" style="padding:20px;" colspan ="2">
								<input type="submit" class="wc_submit" value="<?php echo $CHAT_SUBMIT_TEXT?>" onClick="javascript:processChatRequest();" />
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>

				<!-- Footer -->

				<td colspan="2" class="bottom_gradient" height="50" width="100%">
					<div>
					<span id="status" class="webchat_connection_status"><b><font class="status_color"><?PHP echo $CHAT_STATUS_TEXT?></font><?PHP echo $CHAT_STATUS_NOT_CONNECTED_TEXT?></b></span>
					<span class="powered_by"><?php echo $POWERED_BY_TEXT?></span>
					</div>
				</td>

				<!-- End Footer -->

			</tr>
		</table>

<script type="text/javascript"> 

var elementID;

function onLoginLoadDo()
{
	//	On window load resize
	resizeWindow(438, 438, 438, 415, 433, 397, 0);

	//	Set focus to name field
	document.getElementById('username').focus();
}

function replaceWithHTMLEntities(str)
{
	//	Replace certain 'vulnerable' characters with their html entities
	str = str.replace("<", "&#60;");
	str = str.replace(">", "&#62;");
	str = str.replace("$", "&#36;");
	str = str.replace("[", "&#91;");
	str = str.replace("[", "&#93;");
	return str; 
}

function processChatRequest()
{
	var error = false;
	elementID = 0;

	//	Get input
	var username = replaceWithHTMLEntities(document.getElementById('username').value);
	var email = replaceWithHTMLEntities(document.getElementById('email').value);
	var phone = replaceWithHTMLEntities(document.getElementById('phone').value);
	var skillset = replaceWithHTMLEntities(document.getElementById('skillset').value);
	var subject = replaceWithHTMLEntities(document.getElementById('subject').value);
	var reference = replaceWithHTMLEntities(document.getElementById('reference').value);

	//	Other potentially useable input objects
	var AddressLine1 = "";
	var AddressLine2 = "";
	var AddressLine3 = "";
	var AddressLine4 = "";
	var AddressLine5 = "";
	var AddressCountry = "";
	var AddressLineZipcode = "";
	var FirstName = "";
	var LastName = "";
	var Title = "";
	var CustomField_1_Name = "";
	var CustomField_1_Value = "";
	//

	//	Retrieve platform and browser information to pass to agent
	var WebCommsQuery = "PLATFORM: [" + navigator.platform + "]; BROWSER: [" + navigator.appName + "]; HEADER: [" + navigator.userAgent + "]";

	//	Assign username to first name for creating user in database
	FirstName = username;

	document.getElementById('email_error').innerHTML = "";
	document.getElementById('phone_error').innerHTML = "";
  
	//	Validate given email address
	if(email != "")
	{
		//	If string contains whitespace, trim
		email = whitespaceTrim(email);
		//	 Validate email address
		if(!isValidEmailAddress(email))
		{
			document.getElementById('email_error').innerHTML = "<font color='red'><?php echo $EMAIL_ADDRESS_INVALID_ERROR_TEXT?></font>";
			error = true;
			elementID = document.getElementById('email');
		}
	}

	//	Validate given phone number
	if(phone != "")
	{
		//	If string contains whitespace, trim
		phone = whitespaceTrim(phone);
		//	 Validate phone number
		if(!isValidPhoneNumber(phone))
		{
			document.getElementById('phone_error').innerHTML = "<font color='red'><?php echo $PHONE_NUMBER_INVALID_ERROR_TEXT?></font>";
			error = true;
			if (elementID == 0)
				elementID = document.getElementById('phone');
		}
	}

	// Check for error
	if(error)
	{
		//	Set element focus
		elementID.focus();

		return;
	}

	//	Append reference number to subject
	if (!reference == "")
		subject += " [" + reference + "]";

	//	Hide user input panel
	document.getElementById('webchat_user_input').style.display = "none";

	//	Show loading panel while we do all the web service calls and it can take a few seconds to complete
	document.getElementById('webchat_please_wait').style.display = "block";

	//	Maintain window size (according to browser used) while wait message is displayed and the chat request is processed
	resizeWindow(438, 438, 438, 415, 408, 381, 0);

	//	Get session key
	var result = jqSajax.x_GetAnonymousSessionKey("<?php echo $home?>");
	SessionKey = result.SessionKey;

	if(SessionKey == null)
	{
		//	Display error - usual cause is the chat cannot connect to the CCMM server - check config for server name
		document.getElementById('PleaseWait').innerHTML = "<?php echo $CHAT_CONNECT_ERROR_TEXT?>";
		return;
	}
  
	//	Get Customer ID
	var CustomerID = jqSajax.x_GetAndUpdateAnonymousCustomerID(SessionKey, result.AnonymousID, email, phone, FirstName, LastName, Title, AddressLine1, AddressLine2, AddressLine3, AddressLine4, AddressLine5, AddressCountry, AddressLineZipcode, "<?php echo $home?>");

	if(CustomerID == -1)
	{
		//	Try to remove phone number (known bug)
		CustomerID = jqSajax.x_GetAndUpdateAnonymousCustomerID(SessionKey, result.AnonymousID, email, "", FirstName, LastName, Title, AddressLine1, AddressLine2, AddressLine3, AddressLine4, AddressLine5, AddressCountry, AddressLineZipcode, "<?php echo $home?>");

		if(CustomerID == -1)
		{
			//	Can happen when ImpersonateCustomer is disabled
			document.getElementById('PleaseWait').innerHTML = "<?php echo $CUSTOMER_ID_ERROR_TEXT?>";
			return;
		}
	}

	//	Get Skillset ID from Skillset Name
	var result = jqSajax.x_ReadSkillsetByName(SessionKey, skillset, "<?php echo $home?>");
	var SkillsetID = result.id;
	var WebOnHoldTag = result.webTag;

	if(SkillsetID == null)
	{
		//	Can happen when an invalid skillset name is used
		document.getElementById('PleaseWait').innerHTML = "<?php echo $SKILLSET_ID_ERROR_TEXT?>";
		return;
	}

	//	Request text chat
	showAgentWin(username, SkillsetID, CustomerID, SessionKey, email, phone, subject, CustomField_1_Name, CustomField_1_Value, WebCommsQuery, WebOnHoldTag);

	return;
}

</script>

	</body>
</html>