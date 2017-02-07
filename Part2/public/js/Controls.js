var Controls = function() {

	// Globals
	var isWebVR = false; 	// is the user's browser WebVR capable? 


	function init( camera, scene, inIsWebVR, height ) {
		// Initialize local player controls

		isWebVR = inIsWebVR; 

		if ( isWebVR ) {

			ViveControls.init( camera, scene ); 

		} else {

			DesktopControls.init( camera, scene, height ); 

		}
	}


	function update( delta ) {
		// Update local player controls

		if ( isWebVR ) {

			ViveControls.update(); 

		} else {

			DesktopControls.update( delta ); 
		}
	}


	function setEnabled( bool ) {
		// Enable or disable local player controls

		if ( isWebVR ) {

			// TODO: ViveControls.setEnabled( bool ); 

		} else {

			DesktopControls.setEnabled( bool ); 
		}
	}


	function getPosition() {
		// Get the position of the local player

		if ( isWebVR ) {

			// TODO: ViveControls.getPosition(); 

		} else {

			return DesktopControls.getPosition(); 	
		}
	}


	function getDirection() {
		// Get the direction / rotation of the local player

		if ( isWebVR ) {

			// TODO: ViveControls.getDirection(); 

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