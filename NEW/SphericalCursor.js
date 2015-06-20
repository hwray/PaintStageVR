var SphericalCursor = function() {

	// This class uses Javascript module pattern.

	window.addEventListener( "mousemove", onMouseMove );

	function update() {

		// TODO: Write this function.

		// Put the cursor where you can see it, delete this.
		cursor.position.y = 2.0;

	}

	function onMouseMove( event ) {

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		// TODO: Write this function.

		// For debugging, can remove it.
		console.log("movementX=" + movementX + ", movementY=" + movementY );

	}

	return {
		update: update
	};

}();

