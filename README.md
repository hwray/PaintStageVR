![screenshot-js-cursor](https://cloud.githubusercontent.com/assets/1117692/8268926/a89a82d0-1748-11e5-8299-1f79838955fc.png)

# AltspaceVR Programming Project - Three.js Cursor

## Instructions

Finish the implementation of the 3D cursor in an example Three.js application, and then build some enhancements using the cursor.

## Goals

We use this test to get a sense of your coding style and to how you creatively solve both a concrete problem and an abstract one. When we receive your project, here is what we will be asking ourselves:

- Is their cursor correct? Does it look and act like the provided example build?

- Do the enhancements implemented work well?

- Are the enhancements creative, challenging to implement, and just plain cool?

- Is the code well structured, easy to read and understand, and organized well?

This project should take approximately 5-15 hours to complete.


# Part 1 - 3D Cursor (3-5 hours)

If you’ve tried AltspaceVR, you’ll have noticed that our user interface uses a 3D cursor. This cursor approach allows the user to select objects in the scene, or interact with 2D web panels. For this part of the project, you’ll be implementing a variant of the 3D cursor algorithm we’ve developed for AltspaceVR.  

- Start by cloning this repo
- Run `AltspaceCursor.exe` in the `Builds-Unity` directory to see how the completed solution should behave.  (Your solution will run in a web browser. We will use Google Chrome to run your code.)
- To get you started, we've provided an [index.html](./index.html) file that uses [Three.js](http://threejs.org) to load the furniture assets and render the scene. It also uses the [Pointer Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API) to remove the browser cursor from view, resulting in the screenshot shown above.
- The cursor is represented by a sphere, found in the THREE.Mesh `cursor` object. 
- The job of the `SphericalCursor.js` script is to update the position and scale of the cursor based upon the movement of the mouse and a raycast to find which object the cursor is over, and highlight (tint) the intersected object.  

Here are the defining features of the cursor algorithm that you should replicate:

- The state of the cursor is represented as spherical coordinates on a sphere surrounding the player. So, as the user moves their mouse, you should be updating the coordinates of the cursor in this space.
- Sensitivity of the cursor to mouse movement should be adjustable via the `SENSITIVITY` property.
- Each frame, a raycast from the eye is made based on the spherical coordinates, against all the selectable objects in the scene.  In this project, selectedable objects are represented by the `furnitureGroup` which is defined for you.  
- If there is no collision, the cursor geometry should be scaled to the DEFAULT_CURSOR_SCALE and positioned on the surface of a large virtual sphere of radius SPHERE_RADIUS surrounding the player.
  - If there **is** a collision, the cursor geometry should be positioned at the hit point and scaled uniformly based upon the distance to the hit, using the equation:
    - `(distanceToObject * DISTANCE_SCALE_FACTOR + 1.0f) / 2.0f`
      - `distanceToObject`: Distance to the hit point
      - `DISTANCE_SCALE_FACTOR`: Tuning factor, default value is provided

By scaling the cursor this way, you get a nice scale effect where it doesn’t feel quite like a real sphere in the scene, but a flat 2d cursor that gets slightly smaller with distance. This approach works well in VR. The cursor is always either sitting on the surface of an object, or it is far away on a virtual sphere, so there are no convergence issues. (For example, having the cursor float in free space near the player’s head is a sure way to cause discomfort.) 

The cursor should be drawn on top of all other geometry, and this is accomplished for you in `index.html`.  You should not need to modify that file, but you may if you wish, and comment your changes.

For this part of the project, please **do not** include 3rd party code. You can reference 3rd party code of course, but any code you write for the cursor should be your own. (We'll be asking you how it works!)

# Part 2 - Enhancements (5-10 hours)

Now that you have a working cursor, and can point at and select objects, now build some functionality that might be fun in VR that showcases your skills and creativity. This is the open ended part of the project, and is your chance to blow us away! 

Some potential ideas:

- Use the cursor to manipulate objects, and add multiplayer!

- Improve the cursor to be more usable.

- Add some custom shaders, behaviors, or effects to objects to show off your graphics chops.

- Add a control scheme or widgets that let the user do stuff with objects.

- Create some kind of interactive game.

- Anything you want! Got some new Three.js technique you want to try? Use this as an excuse! Don’t feel limited by the sample scene, feel free to create a new scene and leverage your cursor code in some novel way.

Feel free to use 3rd party code or assets for this part of the project, keeping in mind our assessment criteria (noted at the top of the README.)

## Deliverable

In your repo, you should clobber this README file with your own describing your project. Any instructions or known issues should be documented in the README as well.

E-mail us a link to your Github repo to `projects@altvr.com`. Please include your contact information, and if you haven't submitted it to us already, your resume and cover letter. 

We hope you have fun working on the project, and we can't wait to see what you come up with!
    
[The Altspace Team](http://altvr.com/team/)
    
##Acknowledgements

*Assets used in this project are from* [Free Furniture Props](https://www.assetstore.unity3d.com/en/#!/content/8822)





