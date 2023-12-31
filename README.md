# Tippit - The tipping maze and ball game

## Introduction

An entertaining animated game of skill involving an upright maze through
which a ball is set to roll in order to reach a target. The user can tilt
the maze left or right to make the ball roll.

## Tools and Setup

The game is written in JS, React, Pixi/React

The setup is as follows:

-   npx create-react-app
-   npm install pixi.js @pixi/react
-   npm install react-router-dom
-   npm install react-bootstrap

## Display Layout

There are two pages, the game page and the scores history page. There is also
a link to the Zing Games page.

### Game Page

The game page contains the maze and the current scores and feature buttons. On
a medium width screen the maze is to the left and the current scores and features
are on the right. On small screens the maze appears at the top, with the scores
and features below.

The height of the maze is set near to 400 pixels, allowing for laptop screens, 
allowing for 20 rows of corridors set at 18 pixels high + 3 for the platforms = 420px.

The stage is fixed at a width of about 380 pixels, to allow for small screens. 

## Game Play

The user steers a ball through the maze by tilting the maze left or right to make
the ball roll to an entrance in the maze and so drop to another level. The scores
are traps in the final row, arranged along the bottom of the maze.

The game is divided into rounds of six maze runs, with a total score tally for
the round being kept.

## Maze Construction

The maze is randomly generated within certain parameters to produce an interesting
pathway of corridors and drop-down entrances. The left-right extremities of the
corridors cause a fall into a pit, which is a zero-score condition.

There should be about 20 layers of corridors, so if we assume a height of 420
pixels for the maze, the corridors should be about 21 pixels high and consequently
the ball 16 pixels in diameter. In this case the gaps (gates) between platforms 
should be about 18 pixels.

If we allow for a maximum rotation (tilt) of 15 degrees, what is the maximum width
that the maze can be to fit a stage width of 390 pixels?
If we assume that the maze width is 360, then the diagonal is SQRT(180^2 + 210^2) = 277.
and this is at an angle of acos(210/277) = 40.7 degrees so on the circle of rotation
x = sin(40.7) * 277 - 180.
Now we rotate to x = sin(55.7) * 277 = 228 which is too wide.
So set the maze width to 320, diagonal is SQRT(160^2 + 210^2) = 264
acos(210/264) = 37.3 degrees
x = sin(52.3) * 264 = 208 which still a little too wide, so we will set the width
of the maze at 300 pixels.

The graphics for the maze should be vector drawn, to allow for the different tilt 
angles.

The maze should be offset from the top of the display, to allow for the tilt-up of 
the corners. This sets a maximum tilt angle. Rotation is about the centre of the
maze.

Note that the choice of drops is always binary from any particular corridor. If we
allow for binary drops from each corridor, with a shared drop between adjacent corridors
then the number of possible pathways increases by 1.5 per level, so that after 4 levels
we have 6 corridor sections, this then becomes the standard for the rest of the maze.

The final (bottom) row should contain one success drop and five fail drops.

If the ball is travelling faster than a certain velocity, it should be able to jump a
drop.

If the ball in the maze passes the base of the display, the display should scroll
automatically.

A slider is provided at the base of the maze stage to tilt the maze.

### Maze Drawing Algorithm and Data

The data describing the maze is stored in the object mazeData, composed as follows:

```js
mazeData = [
    {
        platforms: [
            {
                leftX:
                rightX:
            },
        ],
        gateways: [ // These are calculated
            {
                leftX:
                rightX:
            },
        ]
    },
]
```

For the general layout see: ![Maze Layout](./doc/tippit-maze.svg)

The first row has three platforms and two gateways, the position of the leftmost
gateway can be between 50 and 150 pixels and of the rightmost 230 to 330 pixels.

The second row has four platforms, beginning at the left and ranged below the gateways
of the preceding row. Note that the general principle is to begin with a plaform at the
left and to add a gateway to the left of the gateway of the row above (left by at least
18px), in addition, a gateway is added to the last platform to the right of final gateway
of the preceding row.

The third row follows the same pattern.

The fourth and subsequent rows have a gate way on the left and right ends. Other gateways
are determined by taking the midpoint of the platform of the row above, then if there is
room to insert a gateway (varying the position slightly at random), then one is added.

## The Ball

The ball should be considered to be a disk with a spot toward its edge to indicate
rolling action. It should be considered as a mass of 1Kg acted on by a maximum g-force
of 10 Newtons although this can be scaled as appropriate.

### Ball Physics

The ball first presented on the middle platform of the top row, without initial motion.
As the maze is tilted an acceleration is applied to the ball. This is calculated as
follows:
    
Assuming the average distance from the midpoint of the platform to its gateway is
50 pixels and that this takes 2.5 seconds to traverse at a tilt of 3 degrees.
- We have s = a * t^2 hence 
- a = 50 / 6.25 ~ 8 pixels per second per second

Since this is derivative as a proportion of the vertical 180 degrees
- We have 8 = (3 / 180) * G
- G = (180 * 8) / 3 = 480 pixels per second per second (as a theoretical maximum)

The final velocity is also calculated as this carries over to the next measurement.

Since the ticker for the ball operates at 1/60 of a second, we can adjust the calculations
accordingly, ie G = 8 pixels per tick per tick. We can adjust this as required for ease of
play.

As the ball rolls, the spot rotates around the circle (beginning from the vertical) and
this completes s / (PI * D) revolutions where D is the diameter of the disk. So we
take the decimal part of the value to determine the position about the centre of the 
ball.

#### Entry into a gateway

If the velocity of the ball exceeds 2 pixels/tick then the ball jumps the gateway
(indicated by a little vertical bounce) otherwise it strikes the edge of the platform
which is three pixels high so that it reverses its horizontal velocity by an arbitrary
50%, it falls at G pixels per tick per tick to cover a vertical distance of rowHeight 
pixels. We should also consider the bounce from the original side of the gateway, ie:
if the residual horizontal velocity is such that it covers the width of the gateway
before the ball has dropped clear.

So suppose we take the width of the gateway to be ballDiameter (D) + 2 and the
velocity of the ball V to be 1.5 pixels per tick, then clearly, the motion of the
ball within the tick timeframe is visible. So we must display the descent, rather
than generalising it.


## Schedule

Date Commenced: 30/12/2023

| Item                               | Est. Man Days   | Actual Man Days   |
| ---------------------------------- | --------------- | ------------------|
| Analysis Maze Layout               | 4               |                   |
| Analysis Ball Physics              | 2               |                   |
| Display Designs                    | 1               |                   |
| Navbar/Router Design/Development   | 2               |                   |
| Maze Drafting                      | 2               |                   |
| Maze Dynamics                      | 2               |                   |
| Ball Dynamics                      | 3               |                   |
| Scoring                            | 2               |                   |
| Review and Analysis for Extra Dev  | 2               |                   |
| PHASE I Total                      | 20              |                   |
