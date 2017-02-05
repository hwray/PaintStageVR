var Controls = function() {


	function init( camera, scene ) {
		DesktopControls.init( camera, scene ); 
	}


	function update() {
		DesktopControls.update(); 
	}


	function setEnabled( bool ) {
		DesktopControls.setEnabled( bool ); 
	}


	function getPosition() {
		return DesktopControls.getPosition(); 
	}


	function getDirection() {
		return DesktopControls.getDirection(); 
	}


	return {
		init: init,
		update: update, 
		setEnabled: setEnabled, 
		getPosition: getPosition, 
		getDirection: getDirection
	}; 

}(); 