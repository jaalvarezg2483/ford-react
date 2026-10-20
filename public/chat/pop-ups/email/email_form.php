<!--

	Avaya Aura Contact Center Multimedia
	Copyright © 2010 - 2013 Avaya Inc. All Rights Reserved

-->

<table id="emailWinDisplay" class="popover_window_email" style="display:none" width="430" cellSpacing="0" cellPadding="0" border="0">
	<tr>
		<td width="100%">
			<table id="" class="top_gradient" border="0" cellspacing="0" cellpadding="0">

				<!--	Header	-->

				<tr height="70">
					<td width="81" style="padding-top:25px;padding-left:50px;" align="right" valign="top"><img alt="" src="img/smallLogo.png"/></td>
					<td width="349" style="padding-top:25px;padding-left:15px;" align="left" valign="top"><img alt="" src="img/email_text.png"/></td>
				</tr>

				<!--	End Header	-->

				<tr>
					<td colspan="2" valign="top">

						<!--	Closure Message	-->

						<table id="winDisplayClosureMessage" class="webchat_text_email" style="display:none;" cellSpacing="0" cellPadding="0" border="0" width="100%">
							<tr>
								<td style="padding-left:50px;" align="left" style="padding-bottom:20px;" class="red_font" id="ClosureMessage"></td>
							</tr>
						</table>

						<!--	End Closure Message	-->

						<!--	Form	--> 

						<table id="winDisplayEmailContent" class="webchat_text_email" cellSpacing="0" cellPadding="0" border="0" width="100%">

							<!--	Message Center	-->

							<tr>
								<td align="left" class="red_font" id="message_center"></td>
							</tr>

							<!--	End Message Center	-->

							<tr>
								<td>
									<table class="input_fields" width="100%" cellSpacing="3" cellPadding="0" border="0">

										<!--	Input Fields	-->

										<tr align="left">
											<td width="110"><?php echo $NAME_TEXT_HANDLE?></td>
											<td></td>
											<td><input type="text" id="name" size="30" /></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="name_error"></td>
										</tr>
										<tr>
											<td width="110"><?PHP echo$EMAIL_TEXT?></td>
											<td><font size="3" color="red">*</font></td>
											<td><input type="text" id="from_address" size="30" onKeyPress="return checkSpace(event)"></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="email_error"></td>
										</tr>
										<tr>
											<td width="110"><?PHP echo$SUBJECT_TEXT?></td>
											<td></td>
											<td><input type="text" maxlength="50" id="subject" size="30"></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="subject_error"></td>
										</tr>
										<tr>
											<td width="110"><?PHP echo$REFERENCE_NUMBER_TEXT?></td>
											<td></td>
											<td><input type="text" maxlength="50" id="reference" size="30"></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="reference_error"></td>
										</tr>
										<tr>
											<td valign="top" style="padding-top:3px;" width="110"><?PHP echo$EMAIL_MESSAGE_TEXT?></td>
											<td></td>
											<td><textarea type="text" id="message" cols="23" rows="10"></textarea></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="message_error"></td>
										</tr>
										<tr>
											<td width="110"><?php echo $DEPARTMENT_TEXT?></td>
											<td></td>
											<td>
												<select style="width:205px;" id="skillset">
													<?php foreach($EMAIL_SKILLSETS as $SKILLSET => $SKILLSET_REFERENCE_TEXT) { ?>
														<option value="<?php echo $SKILLSET?>"><?php echo $SKILLSET_REFERENCE_TEXT?></option>
													<?php } ?>
												</select>    
											</td>
										</tr>
										
										<!--	End Input Fields	-->

									</table>
								</td>
							</tr>
						</table>

						<!--	End Form	-->
			  
					</td>
				</tr>

				<!--	Send Button	-->
				
				<tr id="send_button">
					<td align="center" style="padding:20px" colspan ="2">
						<input type="submit" class="wc_submit" onClick="SendFormAsEmail()" value="<?PHP echo$EMAIL_SEND_TEXT?>">
					</td>
				</tr>

				<!--	End Send Button	-->

			</table>
		</td>
	</tr>

	<!--	Footer	-->

	<tr height="50">
		<td class="bottom_gradient" width="100%">
		<div>
			<span class="powered_by"><?php echo $POWERED_BY_TEXT?></span>
		</div>
		</td>
	</tr>

	<!--	End Footer	-->

</table>

<Script type="text/javascript">

var error = false;

function closeEmailWindow()
{
	window.close();
}

function OpenEmailWin()
{
	//	Initialise display styles
	resetForm();

	//	Resize window according to browser used
	resizeWindow(438, 438, 438, 575, 577, 541, 0);
}

function resetForm()
{
	//	Null display styles
	document.getElementById('emailWinDisplay').style.display = "";
	document.getElementById('winDisplayEmailContent').style.display = "";

	//	Null input fields
	document.getElementById('name').value = "";
	document.getElementById('from_address').value = "";
	document.getElementById('subject').value = "";
	document.getElementById('reference').value = "";
	document.getElementById('message').value = "";

	//	Set focus to name field
	document.getElementById('from_address').focus();
}

function SendFormAsEmail()
{
	//	Initialize variables
	var extendLength = 0;
	error = false;

	//	Clear error message
	document.getElementById('message_center').innerHTML = "";
	document.getElementById('email_error').innerHTML = "";

	//	Retrieve inputed values
	var name = document.getElementById('name').value;
	var from_address = document.getElementById('from_address').value;
	var subject = document.getElementById('subject').value;
	var reference = document.getElementById('reference').value;
	var message = document.getElementById('message').value;
	var skillset = document.getElementById('skillset').value;

	//	Check for null entry
	if (from_address == "")
	{
		//	Set error meassage and extend length
		document.getElementById('email_error').innerHTML = "<font color='red'><?php echo $EMAIL_ADDRESS_NULL_ERROR_TEXT?></font>";
		error = true;
		extendLength += 14;
		document.getElementById('from_address').focus();
	}
	else
	{
		//	If string contains whitespace, trim
		from_address = whitespaceTrim(from_address);
		//	 Validate email address
		if (!isValidEmailAddress(from_address))
		{
			//	Set error meassage and extend length
			document.getElementById('email_error').innerHTML = "<font color='red'><?php echo $EMAIL_ADDRESS_INVALID_ERROR_TEXT?></font>";
			error = true;
			extendLength += 14;
			document.getElementById('from_address').focus();
		}
	}

	//	Append reference number to subject
	if (!reference == "")
		subject += " [" + reference + "]";

	//	If no error from validation then process the email send; else, note error for display
	if (error == false)
	{
		//	Send form as email
		var result = false;
		result = jqSajax.x_SendEmail(name, from_address, skillset, subject, message, "<?php echo $home?>");

		if (result == true)
		{
			//	Display send mail confirmation
			document.getElementById('winDisplayEmailContent').style.display = "none";
			document.getElementById('winDisplayClosureMessage').style.display = "block";
			document.getElementById('ClosureMessage').innerHTML = "<?PHP echo$EMAIL_CONFIRMATION_TEXT?>";
			document.getElementById('send_button').style.display = "none";

			//	Resize window for confirmation message, and according to browser used
			resizeWindow(438, 438, 438, 212, 206, 197, 0);

			//	Close email form after timeout lenghth configured in config.php
			setTimeout("closeEmailWindow()", <?PHP echo$EMAIL_HANG_TIME?>);
		}
		else
		{
			//	Set error message and extend length
			document.getElementById('message_center').innerHTML = "<font color='red'><?php echo $EMAIL_SEND_ERROR_TEXT?></font>";
			error = true;
			extendLength += 14;
		}
	}
	
	//	Check for error to display
	if(error == true)
	{
		//	Resize window for error message, and according to browser used
		resizeWindow(438, 438, 438, 575, 577, 540, extendLength);
	}
}

</script>