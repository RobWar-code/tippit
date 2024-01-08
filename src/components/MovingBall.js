import {useState, useEffect, useCallback} from 'react';
import {Graphics, useApp} from '@pixi/react';
import GLOBALS from '../constants/constants';
import {rotatePoint} from '../libraries/geometry';

export default function MovingBall ({
    mazeTilt,
    setMazeTilt,
    mazeData,
    gameStart,
    setGameStart,
    roundStart,
    setRoundStart,
    initialLoad,
    setInitialLoad
}) {
    const [ballVelocity, setBallVelocity] = useState(0);
    const [ballAcceleration, setBallAcceleration] = useState(0);
    const [ballRow, setBallRow] = useState(0);
    const [ballPlatform, setBallPlatform] = useState(0);
    const [ballX, setBallX] = useState(0);
    const [ballY, setBallY] = useState(0);
    const [ballAngle, setBallAngle] = useState(Math.PI * 1.5);

    const app = useApp();

    useEffect(() => {
        if (gameStart || roundStart || initialLoad) {
            setMazeTilt(0); // Consider slider position
            setBallRow(0);
            setBallPlatform(0);
            const leftX = mazeData[0].platforms[1].leftX;
            const rightX = mazeData[0].platforms[1].rightX;
            setBallX(leftX + (rightX - leftX) / 2);
            setBallY(0);
            setBallAcceleration(0);
            setBallVelocity(0);
            setBallAngle(Math.PI * 1.5);
            setGameStart(0);
            setRoundStart(0);
            setInitialLoad(0); 
        }
    }, [mazeData,
        gameStart,
        setGameStart, 
        roundStart, 
        setRoundStart,
        initialLoad, 
        setInitialLoad,
        setMazeTilt, 
        setBallRow, 
        setBallPlatform, 
        setBallX, 
        setBallY, 
        setBallAcceleration, 
        setBallVelocity,
        setBallAngle,
    ])

    // Update Ball State
    useEffect( () => {
        const adjustBall = () => {
            let a = ballAcceleration;
            let v = ballVelocity + a;
            let s = ballVelocity + a; // (t = 1)
            let bx = ballX + s;
            if (bx <= GLOBALS.ballRadius) {
                bx = GLOBALS.ballRadius;
                v = 0;
            }
            else if (bx >= GLOBALS.mazeWidth - GLOBALS.ballRadius) {
                bx = GLOBALS.mazeWidth - GLOBALS.ballRadius;
                v = 0;
            }
            s = bx - ballX;

            let rotation = s / (2 * Math.PI * GLOBALS.ballRadius);
            rotation = rotation - Math.floor(rotation);
            let ballAngle1 = ballAngle + 2 * Math.PI * rotation;

            setBallX(bx);
            setBallAngle(ballAngle1);
            setBallVelocity(v); // u + a * t
            a = GLOBALS.g * (mazeTilt * 180/Math.PI) / 180;
            setBallAcceleration(a);
        }

        app.ticker.add(adjustBall);
 
        // Cleanup on unmount
        return () => {
            if (app && app.ticker) {
            app.ticker.remove(adjustBall);
            }
        };

    }, [
        app,
        app.ticker,
        mazeTilt,
        ballX,
        setBallX,
        ballAngle,
        setBallAngle,
        ballVelocity,
        setBallVelocity,
        ballAcceleration,
        setBallAcceleration
    ]);

    const drawBall = useCallback((g) => {

        const moveBall = () => {

            // Draw the ball
            g.clear();

            // Determine y coordinate
            const midX = GLOBALS.stageWidth / 2;
            const midY = GLOBALS.stageHeight / 2;
            const topY = midY - GLOBALS.mazeHeight / 2;
            const py = topY + ((GLOBALS.rowHeight) * (ballRow + 1) - 3 - GLOBALS.ballRadius) - ballY;
            const leftX = midX - GLOBALS.mazeWidth / 2;
            const px = leftX + ballX; 
            let {x, y} = rotatePoint(px, py, midX, midY, mazeTilt);

            g.lineStyle(1, 0x00ff, 1);
            g.beginFill(0x00ff00);
            g.drawCircle(x, y, GLOBALS.ballRadius);
            g.endFill();

            // Draw the ball spot.
            const sx = px + GLOBALS.ballSpotOffset * Math.cos(ballAngle);
            const sy = py + GLOBALS.ballSpotOffset * Math.sin(ballAngle);
            console.log("ballangle, sx, sy:", ballAngle, sx, sy);
            console.log("px, ballX: ", px, ballX);

            let {x: x1, y: y1} = rotatePoint(sx, sy, midX, midY, mazeTilt);
            g.lineStyle(1, 0xff0000, 1);
            g.beginFill(0xff0000);
            g.drawCircle(x1, y1, GLOBALS.ballSpotRadius);
            g.endFill();

        }

        moveBall();
  
    }, [
        mazeTilt,
        ballX,
        ballY,
//        setBallY,
//        ballPlatform,
//        setBallPlatform,
        ballRow,
//        setBallRow,
        ballAngle
    ])

    return (
        <Graphics draw={drawBall} />
    )
}
