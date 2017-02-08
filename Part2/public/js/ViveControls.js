var ViveControls = function() {
	
	// Constants
	var CONTROLLER_PATH = '/models/'; 
	var CONTROLLER_OBJ_FILE = 'vr_controller_vive_1_5.obj'; 
	var CONTROLLER_TEXTURE_FILE = 'onepointfive_texture.png'; 
	var CONTROLLER_SPEC_FILE = 'onepointfive_spec.png'; 
	var UP_VECTOR = new THREE.Vector3( 0, 1, 0 );

	// Globals
	var controls; 
	var controller1; 
	var controller2; 


	function init( camera, scene ) {

		controls = new THREE.VRControls( camera );
		controls.standing = true;

		controller1 = initController( 0 ); 
		controller2 = initController( 1 ); 

		scene.add( controller1 );

		scene.add( controller2 );

		loadControllerModels(); 
	}


	function initController( index ) {

		var controller = new THREE.PaintViveController( index );

		controller.standingMatrix = controls.getStandingMatrix();
		controller.userData.points = [ new THREE.Vector3(), new THREE.Vector3() ];
		controller.userData.matrices = [ new THREE.Matrix4(), new THREE.Matrix4() ];

		return controller; 
	}


	function loadControllerModels() {

		var loader = new THREE.OBJLoader();

		loader.setPath( CONTROLLER_PATH );

		loader.load( CONTROLLER_OBJ_FILE, function ( object ) {

			var loader = new THREE.TextureLoader();
			loader.setPath( CONTROLLER_PATH );
			var controller = object.children[ 0 ];
			controller.material.map = loader.load( CONTROLLER_TEXTURE_FILE );
			controller.material.specularMap = loader.load( CONTROLLER_SPEC_FILE );
			controller.castShadow = true;
			controller.receiveShadow = true;
			// var pivot = new THREE.Group();
			// var pivot = new THREE.Mesh( new THREE.BoxGeometry( 0.01, 0.01, 0.01 ) );
			var pivot = new THREE.Mesh( new THREE.IcosahedronGeometry( 0.002, 2 ) );
			pivot.name = 'pivot';
			pivot.position.y = -0.016;
			pivot.position.z = -0.043;
			pivot.rotation.x = Math.PI / 5.5;
			controller.add( pivot );
			controller1.add( controller.clone() );
			pivot.material = pivot.material.clone();
			controller2.add( controller.clone() );
		} );
	}


	function update() {

		controls.update(); 

		updateController( controller1 ); 
		updateController( controller2 ); 
	}


	function updateController( controller ) {

		controller.update();

		var pivot = controller.getObjectByName( 'pivot' );
		if ( pivot ) {

			pivot.material.color.copy( controller.getColor() );
			var matrix = pivot.matrixWorld;
			var point1 = controller.userData.points[ 0 ];
			var point2 = controller.userData.points[ 1 ];
			var matrix1 = controller.userData.matrices[ 0 ];
			var matrix2 = controller.userData.matrices[ 1 ];
			point1.setFromMatrixPosition( matrix );
			matrix1.lookAt( point2, point1, UP_VECTOR );

			if ( controller.getButtonState( 'trigger' ) ) {
				// TODO: Refactor to integrate better with Painter class
				//Core.paintStroke( controller.getColor().getHex(), point1, point2, matrix1, matrix2, 0.01 );
				Core.updatePainterVive( [ [ controller.getColor().getHex(), point1, point2, matrix1, matrix2, 0.01 ] ] )
			}

			point2.copy( point1 );
			matrix2.copy( matrix1 );
		}
	}




	return {
		init: init, 
		update: update
	}; 

}(); 