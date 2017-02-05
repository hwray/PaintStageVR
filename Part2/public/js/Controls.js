var Controls = function() {

	var isWebVR = false; 


	function init( camera, scene, inIsWebVR, height ) {

		isWebVR = inIsWebVR; 

		if ( isWebVR ) {

			ViveControls.init( camera, scene ); 

		} else {

			DesktopControls.init( camera, scene, height ); 

		}
	}


	function update() {

		if ( isWebVR ) {

			ViveControls.update(); 

		} else {

			DesktopControls.update(); 
		}
	}


	function setEnabled( bool ) {

		if ( isWebVR ) {

		} else {

			DesktopControls.setEnabled( bool ); 
		}
	}


	function getPosition() {

		if ( isWebVR ) {

		} else {

			return DesktopControls.getPosition(); 	
		}
	}


	function getDirection() {

		if ( isWebVR ) {

		} else {
			return DesktopControls.getDirection(); 	
		}
	}


	return {
		init: init,
		update: update, 
		setEnabled: setEnabled, 
		getPosition: getPosition, 
		getDirection: getDirection
	}; 

}(); 