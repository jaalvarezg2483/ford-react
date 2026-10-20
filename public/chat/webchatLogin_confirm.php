<?php 

	//	Avaya Contact Center Multimedia
	//	Copyright © 2010 - 2014 Avaya Inc. All Rights Reserved
	require_once ("include/config.php");
	require_once($home."include/main_pre_body.php");
	require_once($home."pop-ups/webchat_offer/question_pop_over.php");

?>

<html>

	<head>
		<meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
		<link rel="stylesheet" type="text/css" href="<?php echo $home?>css/style.css" />
		<link rel="stylesheet" type="text/css" href="<?php echo $home?>css/calendar.css" />
		<link rel="stylesheet" type="text/css" href="<?php echo $home?>css/time.css" />
	</head>

	<title><?php echo $CHAT_TITLE_TEXT?></title>

	<body onload="showQuestionWin() " style="margin:0px;">

<?php 

	require_once($home."include/main_post_body.php");

?>

	</body>
</html>
