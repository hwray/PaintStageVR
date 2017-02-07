![paintstage-gif-1](http://i.imgur.com/Ex8osch.gif)


# PaintStage

PaintStage is a Three.js + WebVR tool for collaborative 3D painting and scene building. It can be used as a shared virtual space for asymmetrical games, improv theater, free-form role-playing, and other forms of creative expression and performance. 

![paintstage-gif-2](http://i.imgur.com/BcLFErJ.gif)


## Instructions

* The first player to join the game is the **Director.** 
    * He or she paints objects / environments and arranges props to help set the scene for the miniature Actors. 
* All players after the first player are miniature **Actors.** 
    * Actors appear at 1/10 scale atop the "stage," where they explore the environment created by the Director and interact with the scene using VR motion controls (or 2D keyboard/mouse controls). 
* As the scene plays out, the Director can grab the spotlight overhead to adjust its position and intensity - perfect for dimming the lights during scene changes, or focusing the spotlight on a dramatic performance! 

![paintstage-gif-3](http://i.imgur.com/96bV6Kj.gif)

* Each player has their own randomized paint palette, as well as a selection of static and animated assets that they can grab and move within the scene. 
    * All players, paint strokes, props, and lights are replicated over the network in real-time using Socket.io. The scene is completely shared, allowing players to play and create together in real time. 
* PaintStage is a blank slate application with no rules or restrictions. Don't feel constrained by the basic premise outlined above! Other potential use cases include:  
    * Visual improv-based games, such as Charades or Pictionary
    * Drawing-based chat
    * Games that involve asymmetry and/or role-playing, such as Dungeons & Dragons
    * A base template for other creative and artistic apps: sculpting, virtual graffiti, etc. 



## Controls

* **W, A, S, D:** Move
* **Arrow keys:** Look
* **Mouse:** Move cursor
* **Left click:** Paint / interact
* **Right click:** Grab / drag
* **Scroll wheel:** Change cursor distance
* **Left click + Scroll wheel:** Change paint stroke thickness



## Code Overview

The code is structured on the classic JavaScript module pattern. PaintStage was developed in a weekend hack sprint, so things are a bit messy right now, but code cleanup and refactors are coming soon. Here's a high level overview of each module:
* **app.js:** Contains all Node.js / Socket.io server code. Passes data back and forth between Clients. 
* **Client.js:** Contains all client-side network code. Responds to incoming messages from the server and transmits local game data back to the server to be broadcast to other players. 
* **Core.js:** Core code for the game. Initializes and updates the Three.js scene, local player controls, and interactions. Updates the core game loop and sub-modules (Scene, Player, Controls, etc.). 
* **Scene.js:** Initializes and updates the Three.js scene and associated objects. 
* **Player.js:** Represents a player in the current game (either the local player or another remote player). Tracks position and rotation, as well as paint interactions. Each Player object has one Painter object. 
* **Painter.js:** Encapsulates the painting functionality for a player. Tracks individual paint strokes and batches them for broadcast to the server. 
* **Controls.js:** Handles controls for the local player. Essentially serves as a high-level interface implemented by both DesktopControls and ViveControls. 
* **DesktopControls.js:** Implements the Controls interface for 2D / non-VR desktop players. Tracks keyboard inputs to move and turn local player. Also initializes and updates SphericalCursor. 
* **SphericalCursor.js:** Cursor for painting and interacting with the scene. Tracks mouse movement and updates cursor object in 3D space. Also handles grabbing and dragging objects in the scene. 
* **ViveControls.js:** Coming soon! 



## Disclaimers, Known Issues, & Limitations

* The game server is extremely minimal.
    * The server functions as a minimal peer-to-peer message passer. Clients send their updated local data to the server after each animation frame, and the server broadcasts that data directly to all other players. 
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



## Acknowledgments

Small pieces of the project are based on (but not copy-pasted from!) the work of others. 

* Parts of the DesktopControls.js code are based on the official [Three.js PointerLockControls example.](https://threejs.org/examples/#misc_controls_pointerlock)
* Parts of the Painter.js code are based on the official [Three.js Vive Paint example.](https://threejs.org/examples/#webvr_vive_paint)
* JSON models are courtesy of the official Three.js examples, as well as Chris Milk's [ROME / 3 Dreams of Black project.](http://www.ro.me/tech/)
* Other technologies used: Node.js, Express, Socket.io, Three.js, WebVR. 
