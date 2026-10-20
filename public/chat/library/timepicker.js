//	Written by Tan Ling wee
//	on 19 June 2005
//	email :	info@sparrowscripts.com
//      url : www.sparrowscripts.com

	var imagePath='img/';
	
	var extendedLength = 0;
	
	var ie=document.all;
	var dom=document.getElementById;
	var ns4=document.layers;
	var bShow=false;
	var textCtl;

	function setTimePicker(t) {
		textCtl.value=t;
		closeTimePicker();
	}

	function UpdateTimeExtender(extender)
	{
		this.extendedLength = extender;
	}
	

	function refreshTimePicker(mode) {
		
		if (mode==0)
			{ 
				suffix="am"; 
			}
		else
			{ 
				suffix="pm"; 
			}

		sHTML = "<table><tr><td><table cellpadding=3 cellspacing=0 class='time_body'>";
		for (i=0;i<=11;i++) {

			sHTML+="<tr align=right style='font-family:verdana;font-size:9px;color:#000000;'>";

			if (i==0) {
				hr = 12;
			}
			else {
				hr=i;
			}	

			for (j=0;j<4;j++) {
				sHTML+="<td width=57 style='cursor:hand' onmouseover='this.style.backgroundColor=\"#66CCFF\"' onmouseout='this.style.backgroundColor=\"\"' onclick='setTimePicker(\""+ hr + ":" + padZero(j*15) + " " + suffix + "\")'><a class='time_text' href='javascript:setTimePicker(\""+ hr + ":" + padZero(j*15) + " " + suffix + "\")'>" + hr + ":"+padZero(j*15) + "<font color=\"#808080\">" + suffix + "</font></a></td>";
			}

			sHTML+="</tr>";
		}
		sHTML += "</table></td></tr></table>";
		document.getElementById("timePickerContent").innerHTML = sHTML;
	}
	

	if (dom){
		document.write ("<div id='timepicker' class='popover_window_time' style='display:none;'><table class='time_border' cellpadding=0><tr bgcolor='#0033AA'><td><table cellpadding=0 cellspacing=0 width='100%' background='" + imagePath + "titleback.bmp'><tr valign=bottom height=21><td class='time_title' valign=center><B>&nbsp;&nbsp;Select a Time&nbsp;&nbsp;</B></td><td><img id='iconAM' src='" + imagePath + "pm1.bmp' onclick='document.getElementById(\"iconAM\").src=\"" + imagePath + "pm1.bmp\";document.getElementById(\"iconPM\").src=\"" + imagePath + "am2.bmp\";refreshTimePicker(1)' style='cursor:hand'></td><td><img id='iconPM' src='" + imagePath + "am2.bmp' onclick='document.getElementById(\"iconAM\").src=\"" + imagePath + "pm2.bmp\";document.getElementById(\"iconPM\").src=\"" + imagePath + "am1.bmp\";refreshTimePicker(0)' style='cursor:hand'></td></tr></table></td></tr><tr><td colspan=2><span id='timePickerContent'></span></td></tr></table></div>");
        refreshTimePicker(1);
	}
		
	var crossobj= document.getElementById("timepicker").style;
	var currentCtl = "0";
	
	
	function selectTime(ctl,ctl2) {
		var leftpos=0
		var toppos=0

		textCtl=ctl2;
		currentCtl = ctl	
		currentCtl.src=imagePath + "no_cal.gif";

		aTag = ctl
		do {
			aTag = aTag.offsetParent;
			if(aTag != null)
			{
			  leftpos	+= aTag.offsetLeft;
			  toppos += aTag.offsetTop;
			}
			else
			{
			  break;
			}
		} while(aTag.tagName!="BODY");

		crossobj.left=  (ctl.offsetLeft	+ leftpos/3 - ctl.offsetHeight - 2)+ "px";
		crossobj.top =  (ctl.offsetTop + toppos + ctl.offsetHeight + 2) + "px";	

		if(crossobj.display == "block")
		{
		  	closeTimePicker();
		}
		else
		{
			crossobj.display = "block"
			
			//	Resize pop-up
			resizeWindow(438, 438, 438, 730, 756, 716, extendedLength);

			document.getElementById('spacer').style.height = "200px";
		}          

		hideElement( 'SELECT', document.getElementById("calendar") );
		hideElement( 'APPLET', document.getElementById("calendar") );		
		bShow = true;
	}

	// hides <select> and <applet> objects (for IE only)
	function hideElement( elmID, overDiv ){
		if( ie ){
			for( i = 0; i < document.all.tags( elmID ).length; i++ ){
				obj = document.all.tags( elmID )[i];
				if( !obj || !obj.offsetParent ){
						continue;
				}
				  // Find the element's offsetTop and offsetLeft relative to the BODY tag.
				  objLeft   = obj.offsetLeft;
				  objTop    = obj.offsetTop;
				  objParent = obj.offsetParent;
				  while( objParent.tagName.toUpperCase() != "BODY" )
				  {
					objLeft  += objParent.offsetLeft;
					objTop   += objParent.offsetTop;
					objParent = objParent.offsetParent;
				  }
				  objHeight = obj.offsetHeight;
				  objWidth = obj.offsetWidth;
				  if(( overDiv.offsetLeft + overDiv.offsetWidth ) <= objLeft );
				  else if(( overDiv.offsetTop + overDiv.offsetHeight ) <= objTop );
				  else if( overDiv.offsetTop >= ( objTop + objHeight + obj.height ));
				  else if( overDiv.offsetLeft >= ( objLeft + objWidth ));
				  else
				  {
					obj.style.visibility = "hidden";
				  }
			}
		}
	}
		 
	//unhides <select> and <applet> objects (for IE only)
	function showElement( elmID ){
		if( ie ){
			for( i = 0; i < document.all.tags( elmID ).length; i++ ){
				obj = document.all.tags( elmID )[i];
				if( !obj || !obj.offsetParent ){
						continue;
				}
				obj.style.visibility = "";
			}
		}
	}

	function closeTimePicker() {
		crossobj.display = "none"
		showElement( 'SELECT' );
		showElement( 'APPLET' );
		if(currentCtl != "0")
		{
		currentCtl.src=imagePath + "cal.gif"
		}

		//	Resize pop-up
		resizeWindow(438, 438, 438, 530, 556, 517, extendedLength);
	  
		document.getElementById('spacer').style.height = "0px";
	}

	function isDigit(c) {
		
		return ((c=='0')||(c=='1')||(c=='2')||(c=='3')||(c=='4')||(c=='5')||(c=='6')||(c=='7')||(c=='8')||(c=='9'))
	}

	function isNumeric(n) {
		
		num = parseInt(n,10);

		return !isNaN(num);
	}

	function padZero(n) {
		v="";
		if (n<10){ 
			return ('0'+n);
		}
		else
		{
			return n;
		}
	}

	function validateDatePicker(ctl) {

		t=ctl.value.toLowerCase();
		t=t.replace(" ","");
		t=t.replace(".",":");
		t=t.replace("-","");

		if ((isNumeric(t))&&(t.length==4))
		{
			t=t.charAt(0)+t.charAt(1)+":"+t.charAt(2)+t.charAt(3);
		}

		var t=new String(t);
		tl=t.length;

		if (tl==1 ) {
			if (isDigit(t)) {
				ctl.value=t+":00 am";
			}
			else {
				return false;
			}
		}
		else if (tl==2) {
			if (isNumeric(t)) {
				if (parseInt(t,10)<13){
					if (t.charAt(1)!=":") {
						ctl.value= t + ':00 am';
					} 
					else {
						ctl.value= t + '00 am';
					}
				}
				else if (parseInt(t,10)==24) {
					ctl.value= "0:00 am";
				}
				else if (parseInt(t,10)<24) {
					if (t.charAt(1)!=":") {
						ctl.value= (t-12) + ':00 pm';
					} 
					else {
						ctl.value= (t-12) + '00 pm';
					}
				}
				else if (parseInt(t,10)<=60) {
					ctl.value= '0:'+padZero(t)+' am';
				}
				else {
					ctl.value= '1:'+padZero(t%60)+' am';
				}
			}
			else
   		    {
				if ((t.charAt(0)==":")&&(isDigit(t.charAt(1)))) {
					ctl.value = "0:" + padZero(parseInt(t.charAt(1),10)) + " am";
				}
				else {
					return false;
				}
			}
		}
		else if (tl>=3) {

			var arr = t.split(":");
			if (t.indexOf(":") > 0)
			{
				hr=parseInt(arr[0],10);
				mn=parseInt(arr[1],10);

				if (t.indexOf("pm")>0) {
					mode="pm";
				}
				else {
					mode="am";
				}

				if (isNaN(hr)) {
					hr=0;
				} else {
					if (hr>24) {
						return false;
					}
					else if (hr==24) {
						mode="am";
						hr=0;
					}
					else if (hr>12) {
						mode="pm";
						hr-=12;
					}
				}
			
				if (isNaN(mn)) {
					mn=0;
				}
				else {
					if (mn>60) {
						mn=mn%60;
						hr+=1;
					}
				}
			} else {

				hr=parseInt(arr[0],10);

				if (isNaN(hr)) {
					hr=0;
				} else {
					if (hr>24) {
						return false;
					}
					else if (hr==24) {
						mode="am";
						hr=0;
					}
					else if (hr>12) {
						mode="pm";
						hr-=12;
					}
				}

				mn = 0;
			}
			
			if (hr==24) {
				hr=0;
				mode="am";
			}
			ctl.value=hr+":"+padZero(mn)+" "+mode;
		}
	}