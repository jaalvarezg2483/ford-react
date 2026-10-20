<?php

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved
	require_once ("include/config.php");
	require_once($home."include/main_pre_body.php");
	require_once($home."pop-ups/email/email_form.php")

?>

<html>

	<head>
		<link rel="stylesheet" type="text/css" href="css/style.css" />
		<link rel="stylesheet" type="text/css" href="css/calendar.css" />
		<link rel="stylesheet" type="text/css" href="css/time.css" />
	</head>

	<Title><?php echo $EMAIL_TITLE_TEXT?></Title>

	<!--	Load Email Form Window	-->
	<body onload="OpenEmailWin()" style="margin:0px;">

<?php

	require_once($home."include/main_post_body.php");

?>

	</body>

</html>
