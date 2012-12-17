jQuery.noConflict();

function isIn(top,left,bot,right, posX, posY) {
	var ret = false;
	if ((posX > left) && (posX < right) && (posY > top) && (posY < bot))
	{
		ret = true;
	}
	return ret;
}

jQuery(document).ready(function() {
	jQuery("#team").mousemove(function(e) {
		var imagePos    = jQuery("#image").offset(); // Bildposition (top, left)
		var imageWidth  = jQuery("#image").width();  // Bildbreite
		var imageHeight = jQuery("#image").height(); //Bildhöhe
		
		// Parameter
		// Prozent des Mittleren Bildbereichs, horizontal und vertikal
		var ph = 2/3;
		var pv = 2/3;
		var selectHeight = -247;
		
		//Rechnung in Globalen Koordinaten
		var h1 = imagePos.left + (imageWidth*(1-ph))/2;
		var h2 = h1 + imageWidth*ph;
		
		var v1 = imagePos.top + (imageWidth*(1-pv))/2;
		var v2 = v1 + imageWidth*pv;
		var hMax=10000;
		var vMax=10000;
		
		var posString = "";
		//Bild
		if (isIn(imagePos.top, imagePos.left, imagePos.top+ imageHeight,imagePos.left+ imageWidth,e.pageX, e.pageY) )
		{
			var pos = 8 * selectHeight;
			jQuery("#sven").css("top", pos.toString()+"px");
			posString= "Treffer";
		}
		else
		{
			// oben links
			if (isIn(0,0,v1,h1, e.pageX, e.pageY))
			{
				var pos = 1 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "oben links";
			}
			// oben Mitte
			if (isIn(0,h1,v1,h2, e.pageX, e.pageY))
			{
				var pos = 0 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "oben mitte";
			}
			// oben Rechts
			if (isIn(0,h2,v1,hMax, e.pageX, e.pageY))
			{
				var pos = 2 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "oben Rechts";
			}
			// Mitte Links
			if (isIn(v1,0,v2,h1, e.pageX, e.pageY))
			{
				var pos = 6 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "Mitte Links";
			}
			//Mitte rechts
			if (isIn(v1,h2,v2,hMax, e.pageX, e.pageY))
			{
				var pos = 7 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "Mitte Rechts";
			}
			//unten links
			if (isIn(v2,0,vMax,h1 , e.pageX, e.pageY))
			{
				var pos = 4* selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "Unten links";
			}
			//unten mitte
			if (isIn(v2,h1,vMax,h2 , e.pageX, e.pageY))
			{
				var pos = 3 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "Unten Mitte";
			}
			// unten rechts
			if (isIn(v2,h2,vMax,hMax , e.pageX, e.pageY))
			{
				var pos = 5 * selectHeight;
				jQuery("#sven").css("top", pos.toString()+"px");
				posString = "unten Rechts";
			}
			
			
		}

//Nici
		var imagePos2    = jQuery("#image2").offset(); // Bildposition (top, left)
		var imageWidth2  = jQuery("#image2").width();  // Bildbreite
		var imageHeight2 = jQuery("#image2").height(); //Bildhöhe
		
		//Rechnung in Globalen Koordinaten
		var h1_2 = imagePos2.left + (imageWidth2*(1-ph))/2;
		var h2_2 = h1_2 + imageWidth2*ph;
		
		var v1_2 = imagePos2.top + (imageWidth2*(1-pv))/2;
		var v2_2 = v1_2 + imageWidth2*pv;
				
		var posString = "";
		//Bild
		if (isIn(imagePos2.top, imagePos2.left, imagePos2.top+ imageHeight2,imagePos2.left+ imageWidth2,e.pageX, e.pageY) )
		{
			var pos = 8 * selectHeight;
			jQuery("#nici").css("top", pos.toString()+"px");
			posString= "Treffer";
		}
		else
		{
			// oben links
			if (isIn(0,0,v1_2,h1_2, e.pageX, e.pageY))
			{
				var pos = 1 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "oben links";
			}
			// oben Mitte
			if (isIn(0,h1_2,v1_2,h2_2, e.pageX, e.pageY))
			{
				var pos = 0 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "oben mitte";
			}
			// oben Rechts
			if (isIn(0,h2_2,v1_2,hMax, e.pageX, e.pageY))
			{
				var pos = 2 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "oben Rechts";
			}
			// Mitte Links
			if (isIn(v1_2,0,v2_2,h1_2, e.pageX, e.pageY))
			{
				var pos = 6 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "Mitte Links";
			}
			//Mitte rechts
			if (isIn(v1_2,h2_2,v2_2,hMax, e.pageX, e.pageY))
			{
				var pos = 7 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "Mitte Rechts";
			}
			//unten links
			if (isIn(v2_2,0,vMax,h1_2 , e.pageX, e.pageY))
			{
				var pos = 4* selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "Unten links";
			}
			//unten mitte
			if (isIn(v2_2,h1_2,vMax,h2_2 , e.pageX, e.pageY))
			{
				var pos = 3 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "Unten Mitte";
			}
			// unten rechts
			if (isIn(v2_2,h2_2,vMax,hMax , e.pageX, e.pageY))
			{
				var pos = 5 * selectHeight;
				jQuery("#nici").css("top", pos.toString()+"px");
				posString = "unten Rechts";
			}
			
			
		}


//Simon
		var imagePos3    = jQuery("#image3").offset(); // Bildposition (top, left)
		var imageWidth3  = jQuery("#image3").width();  // Bildbreite
		var imageHeight3 = jQuery("#image3").height(); //Bildhöhe
		
		//Rechnung in Globalen Koordinaten
		var h1_3 = imagePos3.left + (imageWidth3*(1-ph))/2;
		var h2_3 = h1_3 + imageWidth3*ph;
		
		var v1_3 = imagePos3.top + (imageWidth3*(1-pv))/2;
		var v2_3 = v1_3 + imageWidth3*pv;
				
		var posString = "";
		//Bild
		if (isIn(imagePos3.top, imagePos3.left, imagePos3.top+ imageHeight3,imagePos3.left+ imageWidth3,e.pageX, e.pageY) )
		{
			var pos = 8 * selectHeight;
			jQuery("#simon").css("top", pos.toString()+"px");
			posString= "Treffer";
		}
		else
		{
			// oben links
			if (isIn(0,0,v1_3,h1_3, e.pageX, e.pageY))
			{
				var pos = 1 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "oben links";
			}
			// oben Mitte
			if (isIn(0,h1_3,v1_3,h2_3, e.pageX, e.pageY))
			{
				var pos = 0 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "oben mitte";
			}
			// oben Rechts
			if (isIn(0,h2_3,v1_3,hMax, e.pageX, e.pageY))
			{
				var pos = 2 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "oben Rechts";
			}
			// Mitte Links
			if (isIn(v1_3,0,v2_3,h1_3, e.pageX, e.pageY))
			{
				var pos = 6 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "Mitte Links";
			}
			//Mitte rechts
			if (isIn(v1_3,h2_3,v2_3,hMax, e.pageX, e.pageY))
			{
				var pos = 7 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "Mitte Rechts";
			}
			//unten links
			if (isIn(v2_3,0,vMax,h1_3 , e.pageX, e.pageY))
			{
				var pos = 4* selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "Unten links";
			}
			//unten mitte
			if (isIn(v2_3,h1_3,vMax,h2_3 , e.pageX, e.pageY))
			{
				var pos = 3 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "Unten Mitte";
			}
			// unten rechts
			if (isIn(v2_3,h2_3,vMax,hMax , e.pageX, e.pageY))
			{
				var pos = 5 * selectHeight;
				jQuery("#simon").css("top", pos.toString()+"px");
				posString = "unten Rechts";
			}
			
			
		}
	

		// Info
		jQuery("#leftRight").text(posString);	
		jQuery("#Position").text(posString);	
		var pos = 5 * selectHeight;
		jQuery("#tz").text(pos.toString());			

		jQuery("#imagePosLeft").text(imagePos.left);
		jQuery("#imagePosTop") .text(imagePos.top);
		jQuery("#imagePosDown").text(imagePos.top+imageHeight);
		jQuery("#imagePosRight") .text(imagePos.left+imageWidth);

		jQuery("#mousePosAbsX").text(e.pageX);
		jQuery("#mousePosAbsY").text(e.pageY);

		jQuery("#imageWidth")  .text(imageWidth);
		jQuery("#imageHeight") .text(imageCenter);
		jQuery("#imageCenter") .text(imageCenter);
	}); // mousemove
}); // jQuery(document).ready(function() {
// ]]>
