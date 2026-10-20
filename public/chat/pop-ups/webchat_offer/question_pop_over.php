<?php 

	//	Avaya Aura Contact Center Multimedia
	//	Copyright © 2010 - 2013 Avaya Inc. All Rights Reserved

	require_once($home.'pop-ups/webchat_offer/webchat_pop_over.php');
	require($home.'include/config.php');

?>

<table id="winDisplay" class="popover_window_confirm" style="display:none;" cellSpacing="0" cellPadding="0" border="0">
	<tr>
		<td>   
		<table id="" cellSpacing="0" cellPadding="0" border="0" class="top_gradient">  

			<!-- Header --> 

			<tr height="70">
				<td width="81" style="padding-top:25px;padding-left:50px;" align="right" valign="top" ><img src="<?php echo $home?>img/smallLogo.png" /></td>
				<td width="349" style="padding-top:25px;padding-left:15px;" align="left" valign="top"><img src="<?php echo $home?>img/chat.png"/></td>
			</tr>

			<!-- End Header --> 

			<!-- Question --> 

			<tr>
				<td rowspan="2" style="padding-left:20;" ><img src="<?php echo $home?>img/nortel_agent.png" border="0" class="webchat_agent_image"></td>
				<td style="padding-top:30;padding-left:30;"><?PHP echo$CHAT_WELCOME_TEXT?></td>
			</tr>
			<tr>
				<td style="padding-top:20; padding-bottom:20;" align="middle"><INPUT TYPE="submit"onClick="LoadAgent()" value="<?PHP echo$YES_TEXT?>"> <INPUT TYPE="submit"onClick="closeQuestionWin()" value="<?PHP echo$NO_TEXT?>"></td>
			</tr>

			<!-- End Question --> 

		</table>
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

function showQuestionWin() 
{ 
	document.getElementById('winDisplay').style.display = "";

	//	On show, resize
	resizeWindow(438, 438, 438, 296, 294, 262, 0);
}

function closeQuestionWin() 
{  
	window.close();
}

function LoadAgent()
{
	if(document.title == "<?php echo $CHAT_TITLE_TEXT?>")
	{
		resizeWindow(438, 438, 438, 514, 508, 478, 0);
	}

	window.open('<?php echo $home?>webchatLogin.php', 'WebChat', 'width=430, height=450, resizable=0');
}

</script>
