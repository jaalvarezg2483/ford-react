<!-- 

	Avaya Aura Contact Center Multimedia
	Copyright © 2010 - 2013 Avaya Inc. All Rights Reserved

-->

<script type="text/javascript" src="library/calendar_us.js"></script>
<script type="text/javascript" src="library/timepicker.js"></script>

<table id="callbackWinDisplay" class="popover_window_callback" style="display:none" width="430" cellSpacing="0" cellPadding="0" border="0">
	<tr>
		<td width="100%">   
			<table id="" class="top_gradient" align="center" width="100%" height="100%" cellspacing="0" cellpadding="0" border="0">  

				<!-- Header --> 

				<tr height="70">
					<td width="81" style="padding-top:25px;padding-left:50px;" align="right" valign="top" ><img alt="" src="img/smallLogo.png" /></td>
					<td width="349" style="padding-top:25px;padding-left:15px;" align="left" valign="top"><img alt="" src="img/callback.png"/></td>
				</tr>

				<!-- End Header --> 

				<tr>
					<td colspan="2" valign="top">

						<!-- Closure Message -->

						<table id="winDisplayClosureMessage" class="webchat_text_callback" style="display:none;" cellSpacing="0" cellPadding="0" border="0" width="100%">  
							<tr>
								<td style="padding-left:50px;" align="left" style="padding-bottom:20px;" class="red_font" id="ClosureMessage"></td>
							</tr>
						</table>

						<!-- End Closure Message -->

						<!-- Form --> 

						<table id="winDisplayCallBackContent" class="webchat_text_callback" cellSpacing="0" cellPadding="0" border="0" width="100%">  

							<!--	Message Center	-->

							<tr>
								<td align="left" class="red_font" id="message_center"></td>
							</tr>

							<!--	End Message Center	-->

							<tr>
								<td>

									<!-- Input Fields --> 

									<table class="input_fields" width="100%" cellSpacing="3" cellPadding="0" border="0">
										<tr>
											<td width="110"><?PHP echo$NAME_TEXT_HANDLE?></td>
											<td><font size="3" color="red">*</font></td>
											<td><input type="field" maxlength="50" id="name" size="30" /></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="name_error"></td>
										</tr>
										<tr>
											<td width="110"><?PHP echo$PHONE_TEXT?></td>
											<td><font size="3" color="red">*</font></td>
											<td><input type="field" maxlength="50" id="contact_no" size="30" onKeyPress="return checkSpace(event)"  /></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="contact_no_error"></td>
										</tr>
										<tr>
											<td width="110"><?PHP echo$EMAIL_TEXT?>: </td>
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
											<td><input type="field" maxlength="50" id="reference_number" size="30"></td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="reference_error"></td>
										</tr>
										<tr align="left">
											<td width="110"><?php echo $DEPARTMENT_TEXT?></td>
											<td><font size="3" color="red">*</font></td>
											<td>
												<select style="width:205px;" id="skillset">
												<?php foreach($CALL_BACK_SKILLSETS as $SKILLSET => $SKILLSET_REFERENCE_TEXT) { ?>
													<option value="<?php echo $SKILLSET?>"><?php echo $SKILLSET_REFERENCE_TEXT?></option>
												<?php } ?>
												</select>    
											</td>
										</tr>
										<tr align="left">
											<td></td>
											<td></td>
											<td id="skillset_error"></td>
										</tr>
										<tr>
											<td valign="bottom" rowspan="2"><img style="padding-top:4px;" align="center" src="img/clock.jpeg" height="50"></td>
											<td></td>
											<td style="padding-left:25px;" align="left" valign="bottom">
												<input type="radio" id="radio_now" name="time_group" checked value="now" onClick="javascript:display_time_section('Now');"><?PHP echo$CALLBACK_CALL_ME_NOW_TEXT?>
											</td>
										</tr>
										<tr>
											<td></td>
											<td style="padding-left:25px;" align="left" valign="bottom">
												<input type="radio" id="radio_later" name="time_group" value="later" onClick="javascript:display_time_section('Later');"><?PHP echo$CALLBACK_CALL_ME_LATER_TEXT?>
											</td>
										</tr>
									</table>

									<!-- End Input Fields --> 

									<!-- Data / Time Fields --> 

									<div id='Time_Selection' style="display:none;" >
										<table class="input_fields" cellpadding="0" cellspacing="3" border="0">
											<tr>
												<td width="110" align="left" ><?PHP echo$DATE_TEXT?>:</td>
												<td><font size="3" color="red">*</font></td>
												<td> 
													<input readonly type="field" id="date" name="date" />
												</td>
												<td>
													<script type="text/javascript">
														var NewCalender = new tcal ({'formname': '','controlname': 'date'});
													</script>
												</td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="date_error"></td>
											</tr>
											<tr>
												<td align="left" ><?PHP echo$TIME_TEXT?>:</td>
												<td><font size="3" color="red">*</font></td>
												<td>
													<input readonly type="field" name="time2" id="time2" />
												</td>
												<td>
													<IMG SRC="img/cal.gif" id="time_img" BORDER="0" ALT="Select a Time" ONCLICK="javascript:selectTime(document.getElementById('time_img'),document.getElementById('time2'))" STYLE="cursor:hand;padding:2px">
												</td>
											</tr>
											<tr align="left">
												<td></td>
												<td></td>
												<td id="time_error"></td>
											</tr>
										</table>
									</div>

									<!-- End Data / Time Fields --> 

								</td>
							</tr>
						</table>

						<!-- End Form --> 

					</td>
				</tr>

				<!-- Submit Button --> 

				<tr id="submit_button">
					<td colspan="2" align="center" style="padding:20px">
						<input type="submit" class="wc_submit" onClick="processCallBackRequest()" value="<?PHP echo$CALLBACK_SUBMIT_TEXT?>">
					</td>
				</tr>

				<!-- End Submit Button --> 	

			</table>

			<!-- Spacer Table --> <!-- Used to bring the footer down to the bottom of the page when opening the calender or time picker -->

			<table id="" class="" cellSpacing="0" cellPadding="0" border="0">  
				<tr>
					<td id="spacer"></td>
				</tr>
			</table>

			<!-- Emd Spacer Table -->

		</td>
	</tr>

	<!-- Footer -->

	<tr height="50">
		<td class="bottom_gradient" width="100%">
			<div>
			<span class="powered_by"><?php echo $POWERED_BY_TEXT?></span>
			</div>
		</td>
	</tr>

	<!-- End Footer -->

</table>
<script type="text/javascript">

var error;
var laterErrorLength = 0;
var extendLength = 0;
var elementID;

function closeCallbackWin()
{
	window.close();
}

function OpenCallbackWin()
{
	//	Resize pop-up on load
	resizeWindow(438, 438, 438, 475, 493, 454, extendLength);

	document.getElementById('callbackWinDisplay').style.display = "";
	document.getElementById('winDisplayCallBackContent').style.display = "";
	document.getElementById('Time_Selection').style.display = 'none';
	document.getElementById('radio_now').checked = true;
	document.getElementById('name').value = "";
	document.getElementById('contact_no').value = "";
	document.getElementById('email').value = "";
	document.getElementById('subject').value = "";
	document.getElementById('reference_number').value = "";
	document.getElementById('date').value = "";
	document.getElementById('time2').value = "";

	//	Set focus to name field
	document.getElementById('name').focus();
}

function processCallBackRequest()
{
	extendLength = 0;
	laterErrorLength = 0;
	error = false;
	elementID = 0;

	//	Reset error fields
	document.getElementById('name_error').innerHTML = "";
	document.getElementById('contact_no_error').innerHTML = "";
	document.getElementById('email_error').innerHTML = "";
	document.getElementById('date_error').innerHTML = "";
	document.getElementById('time_error').innerHTML = "";
	document.getElementById('message_center').innerHTML = "";

	//	Get values
	var call_back_now = document.getElementById('radio_now').checked;
	var name = document.getElementById('name').value;
	var contact_no = document.getElementById('contact_no').value;
	var date = document.getElementById('date').value;
	var time = document.getElementById('time2').value;
	var email = document.getElementById('email').value;
	var subject = document.getElementById('subject').value;
	var reference_number = document.getElementById('reference_number').value;
	var skillset = document.getElementById('skillset').value;

	if(name == "")
	{
		document.getElementById('name_error').innerHTML = "<font color='red'><?php echo $NAME_NULL_ERROR_TEXT?></font>";
		error = true;
		extendLength += 14;
		elementID = document.getElementById('name');
	}

	if(contact_no == "")
	{
		document.getElementById('contact_no_error').innerHTML = "<font color='red'><?php echo $PHONE_NUMBER_NULL_ERROR_TEXT?></font>";
		error = true;
		extendLength += 14;
		if (elementID == 0)
			elementID = document.getElementById('contact_no');
	}
	else
	{
		//	If string contains whitespace, trim
		contact_no = whitespaceTrim(contact_no);
		//	 Validate phone number
		if(isValidPhoneNumber(contact_no) == false)
		{
			document.getElementById('contact_no_error').innerHTML = "<font color='red'><?php echo $PHONE_NUMBER_INVALID_ERROR_TEXT?></font>";
			error = true;
			extendLength += 14;
			if (elementID == 0)
				elementID = document.getElementById('contact_no');
		}
	}

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
			extendLength += 14;
			if (elementID == 0)
				elementID = document.getElementById('email');
		}
	}

	if(call_back_now  == false)
	{
		if( date == "")
		{
			document.getElementById('date_error').innerHTML = "<font color='red'><?php echo $DATE_NULL_ERROR_TEXT?></font>";
			error = true;
			laterErrorLength += 14;
			extendLength += 14;
			if (elementID == 0)
				elementID = document.getElementById('date');
		}

		if(time == "")
		{
			document.getElementById('time_error').innerHTML = "<font color='red'><?php echo $TIME_NULL_ERROR_TEXT?></font>";
			error = true;
			laterErrorLength += 14;
			extendLength += 14;
			if (elementID == 0)
				elementID = document.getElementById('time2');
		}
	}

	//	Append reference number to subject
	if (!reference_number == "")
		subject += " [" + reference_number + "]";

	//	If there are no errors process input
	if(error == false)
	{ 
		var username;
		var GetCustomer = "true";

		//	Try get customer infomation
		//	Get session key
		var result = jqSajax.x_GetAnonymousSessionKey("<?php echo $home?>");
		var SessionKey = result.SessionKey;

		if(SessionKey == null)
		{
			//	Possible (and most frequent) cause of NULL SessionKey is inability to connect to the CCMM server - check config.php file for correct server name
			GetCustomer = "false";
		}

		//	Get customer ID
		var CustomerID = jqSajax.x_GetAndUpdateAnonymousCustomerID(SessionKey, result.AnonymousID, email, contact_no, "", "", "", "", "", "", "", "", "", "", "<?php echo $home?>");
		if(CustomerID == -1)
		{
			//	Can happen when ImpersonateCustomer is disabled
			GetCustomer = "false";
		}

		//	Read Customer so as to update default number for callback
		var phoneNumberId = 0;
		var customer = jqSajax.x_ReadCustomer(SessionKey, CustomerID, "<?php echo $home?>");

		//	Traverse number list to retrieve ID associated with given contact number
		if (Object.prototype.toString.call(customer.phoneNumberList.CIPhoneNumberReadType) === '[object Array]') {
			customer.phoneNumberList.CIPhoneNumberReadType.forEach(function(phoneNumberObject){
				if (phoneNumberObject.number == contact_no) {
					phoneNumberId = phoneNumberObject.id;
				}
			});
		} else {
			phoneNumberId = customer.phoneNumberList.CIPhoneNumberReadType.id;
		}

		//	Update given contact number as default number
		var updateDefault = jqSajax.x_UpdateDefault(SessionKey, phoneNumberId, true, "<?php echo $home?>");
		if (updateDefault != 1) {
			//	Failed to update default phone number
		}

		//	Get Skillset ID
		var result = jqSajax.x_ReadSkillsetByName(SessionKey, skillset, "<?php echo $home?>");
		var skillsetID = result.id;

		if(skillsetID == null)
		{
			//	Can happen when an invalid skillset name is used
			document.getElementById('skillset_error').innerHTML = "<font color='red'><?php echo $SKILLSET_ID_ERROR_TEXT?></font>";
			error = true;
			extendLength += 14;
			elementID = document.getElementById('skillset');
		}

		if (call_back_now  == true)
		{
			//	CallBack request processed according to customer status
			if (GetCustomer == "false")
				username = jqSajax.x_RequestCallBackNow(name, contact_no, subject, skillsetID, "<?php echo $home?>");
			else
				username = jqSajax.x_RequestCallBackNowCustomerCheck(name, contact_no, subject, CustomerID, SessionKey, skillsetID, "<?php echo $home?>");
		}
		else
		{
			//	Parse date
			date = date.split("/");
			var month = date[0];
			var day = date[1];
			var year = date[2];

			//	Parse time
			time = time.split(":");
			var strHour = time[0];
			var hour = Number(strHour);
			time = time[1].split(" ");
			var min = time[0];
			var AMorPM = time[1];

			//	Accommodate for midnight and noon passed as '12'
			if (hour == 12)
				hour = 0;

			//	Convert 12hr time to 24hr time
			if (AMorPM == "pm")
				hour = Number(hour) + 12;

			//	Calculate millisecond value for the scheduled datetime
			var milliseconds = Date.UTC(year, month-1, day, hour, min, 0, 0);

			//	Find the UTC offset (in minutes) for the scheduled datetime
			var scheduledDate = new Date(year, month-1, day, hour, min, 0, 0);
			var utcOffset = scheduledDate.getTimezoneOffset();

			//	Add the UTC offset (in milliseconds) to get a UTC corrected time, i.e. a UTC equivalent of the scheduled time.
			milliseconds += (utcOffset * 60000);

			//	Process callBack request according to customer status
			if (GetCustomer == "false")
				username = jqSajax.x_RequestCallBackLater(name, contact_no, subject, skillsetID, milliseconds, "<?php echo $home?>");
			else
				username = jqSajax.x_RequestCallBackLaterCustomerCheck(name, contact_no, subject, skillsetID, CustomerID, SessionKey, milliseconds, "<?php echo $home?>");
		}

		if (username == null)
		{
			//	Set error message
			document.getElementById('message_center').innerHTML = "<?php echo$CALLBACK_REQUEST_ERROR_TEXT?></font>";
			
			//	Extend length
			extendLength += 14;
		}
		else if (username == "-1")
		{
			//	Set error message
			document.getElementById('message_center').innerHTML = "<?php echo$MAX_REQUESTED_PER_CUSTOMER_TEXT?></font>";
			
			//	Extend length
			extendLength += 14;
		}
		else
		{
			//	Logout chat session used to scheduled call-back
			jqSajax.x_CloseTextChat(username, "");

			//	Post closure message (appropriate to now or later call-back types)
			if(call_back_now  == true)
				document.getElementById('ClosureMessage').innerHTML = "<?PHP echo$CALLBACK_NOW_CONFIRMATION_TEXT?>";
			else
				document.getElementById('ClosureMessage').innerHTML = "<?PHP echo$CALLBACK_LATER_CONFIRMATION_TEXT?>";

			//	Format window for closure
			document.getElementById('winDisplayCallBackContent').style.display = "none";
			document.getElementById('winDisplayClosureMessage').style.display = "block";
			document.getElementById('submit_button').style.display = "none";

			//	Close callback window after configured delay
			setTimeout("closeCallbackWin()", <?PHP echo$CALL_BACK_HANG_TIME?>);
		}
	}
	else
	{
		UpdateCalanderExtender(extendLength);
		UpdateTimeExtender(extendLength);

		//	Set focus on first error
		elementID.focus();
	}

	//	Resize pop-up
	if (document.getElementById('ClosureMessage').innerHTML != "")
		resizeWindow(438, 438, 438, 212, 206, 198, 0);
	else if (document.getElementById('radio_later').checked)
		resizeWindow(438, 438, 438, 530, 556, 517, extendLength);
	else
		resizeWindow(438, 438, 438, 475, 493, 454, extendLength);
}

function display_time_section(value)
{
	if(value=='Now')
	{
		document.getElementById('Time_Selection').style.display = 'none';

		closeTimePicker();
		f_tcalHideAll();

		//	Resize pop-up
		resizeWindow(438, 438, 438, 475, 493, 454, extendLength - laterErrorLength);
	}
	else
	{
		document.getElementById('Time_Selection').style.display = 'block';

		//	Resize pop-up
		resizeWindow(438, 438, 438, 530, 555, 517, extendLength);
	}
}

</script>