(function(window, document, dataKey, upId, pixelserv) {
  var cntrUrl = "";
  try {
      cntrUrl = top.location.href;
  } catch (e) {
      cntrUrl = (window.location !== window.parent.location) ? document.referrer : document.location.href;
  }
  var cntrData = window[dataKey] || {};
  if (!cntrData.hasOwnProperty("cntr_url")) cntrData["cntr_url"] = cntrUrl;
  var queryParams = [];
  for (var param in cntrData) {
      if (cntrData.hasOwnProperty(param)) {
          queryParams.push(encodeURIComponent(param) + "=" + encodeURIComponent(cntrData[param]));
      }
  }
  var query = queryParams.join("&");
  var protocol = ('https:' === document.location.protocol ? 'https://' : 'http://');
  var upUrl = protocol + pixelserv + '/up/' + upId + (query ? "?" + query : "");
  new Image().src = upUrl;
  (function(d) {
      var syncUrl = protocol + pixelserv + '/dmp/asyncPixelSync';
      var iframe = d.createElement('iframe');
      (iframe.frameElement || iframe).style.cssText = "width: 0; height: 0; border: 0;";
      iframe.src = "javascript:false";
      d.body.appendChild(iframe);
      var doc = iframe.contentWindow.document;
      doc.open().write('<body onload="window.location.href=\'' + syncUrl + '\'">');
      doc.close();
  })(document);
})(window, document, "cntrData", "50810821a6a528f9", "pixel-a.basis.net")