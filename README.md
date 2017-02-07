![paintstage-gif-1](http://i.imgur.com/Ex8osch.gif)


# PaintStage


## Overview

PaintStage is a Three.js + WebVR tool for asymmetrical games, improv theater, role-playing, and collaborative art. Using the immersive and perspective-changing potential of VR, PaintStage allows for creative expression and performance together in a shared virtual space. 


![paintstage-gif-2](http://i.imgur.com/BcLFErJ.gif)


## Instructions

* The first player to join the game is the **Director.** He or she can paint objects / environments and arrange props to help set the scene for the miniature Actors. 
    * Use thick brush strokes to sketch out an environment for the stage, then progress to thinner strokes to create environmental details and props for your Actors. 
    * Complete the scene by grabbing and dragging a variety of static geometry or animated assets to use as props. 
    * As the scene plays out, you can grab the spotlight overhead to adjust its position and intensity - perfect for dimming the lights during scene changes, or focusing the spotlight on a dramatic performance! 

* All players after the first player are miniature **Actors.** They can explore the environment created by the Director and help act out the scene using VR motion controls (or 2D keyboard/mouse controls). 
	* Actors appear at 1/10 scale atop the "stage", around chest-height of the Director. 
	* Explore the stage created 
    * Actors also have the ability to paint and move objects. They can help the Director fill in the small details of the stage environment, interact with objects the Director places on stage, or paint their own props on the fly.

* Each player has their own randomized paint palette, as well as a selection of static and animated assets that they can grab and move within the scene. 
    * All players, paint strokes, props, and lights are replicated over the network in real-time using Socket.io. The scene is completely shared, allowing players to play and create together in real time. 

* PaintStage is a blank slate application with no rules or restrictions. Don't feel constrained by the basic premise outlined above! Other potential use cases include:  
    * Visual improv-based games, such as Charades or Pictionary
    * Drawing-based chat
    * Games that involve asymmetry and/or role-playing, such as Dungeons & Dragons (the Director fills the role of the Dungeon Master, creating environments and enemies; the Actors become miniature adventurers, exploring the world the DM has created on the stage)
    * A tool for reversing social power dynamics and combating anxiety - reduce the potential stress of communicating with someone in VR by making them appear to be 1/10 your size, or putting them in a silly costume that only you can see! 
    * A base template for other creative and artistic apps: sculpting, virtual graffiti, etc. 



## Controls

* **W, A, S, D:** Move

* **Arrow keys:** Look

* **Mouse:** Move cursor

* **Left click:** Paint / interact

* **Right click:** Grab / drag

* **Scroll wheel:** Change cursor distance

* **Left click + Scroll wheel:** Change paint stroke thickness



## Disclaimers, Known Issues, & Limitations

* The game server is extremely minimal.
    * The server essentially functions as a bare-bones peer-to-peer message passer. Clients send their updated local data to the server after each animation frame (or in the case of paint objects, after a paint stroke is finished). The server broadcasts that data directly to all other players to update their local game states. 
    * The server does not run its own update loop, does not perform any prediction or interpolation of client states, and does not maintain a secure and authoritative copy of the game state (or any game state at all). 
    * There is no support for multiple game rooms / lobbies, and no way to adjust the "tick rate" at which the game server sends data. 
    * All game state exists on the client side, making it trivial for users to edit their own game data or the data of other players. 
    * Overall, the client/server architecture is flimsy, brittle, and unsecure. It is **not** suitable for any sort of real-time multiplayer game or other production app. 

* Paint strokes do not replicate to other players until the local player ends their paint stroke (releases the mouse button). 
	* It is possible to send incremental paint stroke data over the network on every frame. However, due to network latency / asynchronicity, some strokes are inevitably lost, or arrive out of order, etc. This causes other players' paint lines appear "dotted" when they appear in the scene (due to missing geometry segments). 
	* Due to this limitation, paint stroke data is "batched" and only broadcast to the server when the paint stroke ends. Because of this, paint strokes don't appear in other players' scenes until the local player releases the mouse button. 

* Objects cannot be moved after being painted. 
    * The app uses a dynamic Three.js BufferGeometry to create paint strokes. 
    * It is prohibitively expensive to dynamically compute the bounding box for each paint stroke on each frame. 
    * Even if the bounding box computations are batched until the end of a given paint stroke, the user experiences a significant slow-down / freeze on the completion of each paint stroke. 
    * Due to these performance limitations, painted objects do not have bounding boxes, and thus cannot interact with the Three.js Raycaster. 
    * This means that the player's SphericalCursor cannot interact with or grab the painted objects to move them around the scene like other objects. 
    * No raycasting also means no collision detection - the player can walk straight through painted objects, and cannot stand on them. 

* There is a small jitter in the SphericalCursor when moving. 
	* This jittering becomes more apparent when the cursor is closer to the camera, or when the framerate is low. (Jittering is barely apparent at 60fps and nonexistent at 144fps). 
	* It seems as if the SphericalCursor's raycaster is lagging 1-2 frames behind the current position / rotation of the player, causing it to jump back and forth between different positions. 
	* Bugfix incoming soon!

* WebVR functionality isn't fully implemented yet, but check back in a few days! 
    * PaintStage has been designed to work with the HTC Vive via WebVR. 
    * If you have a Vive, check the [WebVR.info](http://webvr.info) page on how to get set up for WebVR. 
    * **[NOTE: As of 2/6/2017, there is a fatal bug affecting Vive WebVR apps on the most recent Chromium build.](https://bugs.chromium.org/p/chromium/issues/detail?id=687009)** If you're interested in checking out PaintStage in WebVR, be sure to follow [the instructions for Firefox Nightly.](https://github.com/Web-VR/iswebvrready/wiki/Instructions%3A-Firefox-Nightly) 



## Code Overview

The code is structured on the classic JavaScript module pattern. PaintStage was developed in a weekend hack sprint, so things are a bit messy right now, but code cleanup and refactors are coming soon. Here's a high level overview of each module:
* **app.js:** Contains all Node.js / Socket.io server code. Passes data back and forth between clients. 
* **Client.js:** Contains all client-side network code. Initializes the core game loop and transmits local game data to the server. Responds to incoming messages from the server and tells game core to update state accordingly. 
* **Core.js:** Core code for the game. Initializes and updates the Three.js scene, local player controls, and interactions. Updates the core game loop and sub-modules, and passes data back and forth to the Client code. 
* **Scene.js:** Initializes, manages, and updates the Three.js scene and associated objects. 
* **Player.js:** Represents a player in the current game (either the local player or another remote player). Tracks position and rotation, as well as paint interactions. Each Player object has one Painter object. 
* **Painter.js:** Encapsulates the painting functionality for a player. Tracks individual paint strokes and batches them for broadcast to the server. 
* **Controls.js:** Handles controls for the local player. Essentially serves as a high-level interface implemented by both DesktopControls and ViveControls. 
* **DesktopControls.js:** Implements the Controls interface for 2D / non-VR desktop players. Tracks keyboard inputs to move and turn local player. Also initializes and updates SphericalCursor. 
* **SphericalCursor.js:** Cursor for painting and interacting with the scene. Tracks mouse movement and updates cursor object in 3D space. Also handles grabbing and dragging objects in the scene. 
* **ViveControls.js:** Coming soon! 



## Acknowledgments

Small pieces of the project are based on (but NOT copy-pasted from!) the work of others. 

* Parts of the DesktopControls.js code are based on the official [Three.js PointerLockControls example,](https://threejs.org/examples/#misc_controls_pointerlock) as well as the internal implementation of PointerLockControls itself. Major changes include: 
	* Created Controls module to integrate SphericalCursor with keyboard movement and look controls.
	* Reimplemented PointerLockControls to use arrow keys instead of mouse for looking.
	* Reimplemented WASD controls and collisions to accomodate players of different heights/sizes, and more. 

* Parts of the Painter.js code are based on the official [Three.js Vive Paint example.](https://threejs.org/examples/#webvr_vive_paint) Enhancements include: 
	* Added the ability to change the paint stroke thickness. 
	* Adapted paint controls to use SphericalCursor and DesktopControls instead of Vive controllers. 
	* Implemented full network replication of all painted objects, and more. 

* JSON models are courtesy of the official Three.js examples, as well as Chris Milk's [ROME / 3 Dreams of Black project.](http://www.ro.me/tech/)

* Other technologies used: Node.js, Express, Socket.io, Three.js, WebVR. 