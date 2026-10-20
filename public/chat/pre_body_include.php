<?php

global $home;
if(!isset($home)){ $home = getcwd(); } $home = (basename($home) != "chat") ? $home . "/chat/": $home."/";

require_once ("include/config.php");
require_once($home."include/main_pre_body.php");

//
//    dump($REFERENCE_NUMBER_TEXT);
//die;
?>