# RPPtoAEP

Hey, guys. I'm Mai Mai.

I created a script to place the items in After Effects based on the location of the media objects on the REAPER project file.

![image](https://user-images.githubusercontent.com/79758588/113301207-bab86e00-9339-11eb-84c6-0dbae5db5c2f.png)

Prepare a REAPER project file like this, run the script in After Effects, and make various settings, it will be generated as shown here.
![image](https://user-images.githubusercontent.com/79758588/113301221-c146e580-9339-11eb-8c83-d3e66d01dee7.png)

This is what it looks like when you actually export it as a video.

https://imgur.com/kNGudIc

It implements useful functions for Oto-MAD and YTPMV production.

## Introduce
It is distributed on Github.

https://github.com/maimai22015/RPPtoAEP/releases/

Download RPPtoAEP.rar, unzip it, and copy the .jsx file to your AfterEffects Scripts folder.

If you haven't changed any settings, it should be here.
`C:\Program Files\Adobe\[AE Installation Folder]\Support Files\Scripts`

Once copied, launch After Effects and make sure you have Menu->Scripts->RPPtoAEP.jsx and LinkPropaties.jsx.

If there is, it is a successful.

![image](https://user-images.githubusercontent.com/79758588/113301511-0cf98f00-933a-11eb-84d9-19971e9eb8c8.png)

## Usage

Open the project you are working on and Select Composition on Project planel and run the script from the menu, this window will launch.
![image](https://user-images.githubusercontent.com/79758588/113301530-12ef7000-933a-11eb-971a-bf7eb9fdac19.png)


After setting each item, press the RUN button to execute it, and the item will be placed in a new composition in the RPPtoAEP folder.

### About each setting
Each setting will be explained in this section.

* .RPP
  * .Select the RPP file.
* Select Item
  * Select the item to be placed on the AE.
  * Allows you to select footage and composition.
  * Therefore, you need to load the items you want to place on the AE beforehand.
* Composition Name
  * Set the name of the composition to be generate.
  * You may leave this field blank.
* Width,Haight,fps
  * Set properties the composition to be generate.
* Start Position
  * Set the start time of the footage and composition to be place.
* Flip left/right
  * Sets whether or not to flip item left or right.
* Link Properties
  * Link the transform values such as position, magnification, etc. of the item to be placed. 
* Odd Item Link Separately
  * Link values by even-numbered items and odd-numbered items.
* Generate Mode
  * Select how you want to place the items on the AE.
    * Without Gaps : Place the items so that there are no gaps between them.
    * Generate as per RPP : Place the items according to their start and end times in the RPP file.
    * Don't Ajust Item Length : Does not change the length setting of the footage or composition when placing the item. It will be loaded as the length of the material or composition.

### About Link Properties
If Link Properties or Odd Item Link Separately is enabled, the transform value of the first item (layer name: Control) of each generated composition will be shared by all subsequent items.
If you make a keyframe on the first item to change its value, all subsequent items will move in the same way.

![image](https://user-images.githubusercontent.com/79758588/113301572-1edb3200-933a-11eb-8d27-f81da9399e6d.png)

https://imgur.com/D5FW4NT


If Odd Item Link Separately is enabled, a ControlA layer and a ControlB layer will be generated, so please set them respectively.

### About the auxiliary script LinkPropaties.jsx
Since the Link Properties mentioned above only links transform values, I have prepared an auxiliary script to link effect properties as well.

With the target composition selected, select the item to which you want to link the value of the effect applied to the Control layer (see image below), and execute the script to link the setting to other items.

Enable Odd Item Link Separately, and if there are two Control layers, apply the effect to ControlA and put the value in it.

That's all. Please be helpful.

