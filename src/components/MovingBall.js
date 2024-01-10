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
    setInitialLoad,
    scoreData,
    roundScore,
    setRoundScore,
    setGameOver
}) {
    const [ballVelocity, setBallVelocity] = useState(0);
    const [ballAcceleration, setBallAcceleration] = useState(0);
    const [ballRow, setBallRow] = useState(0);
    const [ballPlatform, setBallPlatform] = useState(0);
    const [ballX, setBallX] = useState(0);
    const [ballY, setBallY] = useState(0);
    const [ballAngle, setBallAngle] = useState(Math.PI * 1.5);
    const [isFalling, setIsFalling] = useState(false);
    const [ballVY, setBallVY] = useState(0);
    const [ballTargetPlatform, setBallTargetPlatform] = useState(0);
    const [fallingGateNum, setFallingGateNum] = useState(0);

    const app = useApp();

    useEffect(() => {
        if (gameStart || roundStart || initialLoad) {
            setMazeTilt(0); // Consider slider position
            setBallRow(0);
            setBallPlatform(0);
            const leftX = mazeData[0].platforms[1].leftX;
            const rightX = mazeData[0].platforms[1].rightX;
            setBallX(leftX + (rightX - leftX) / 2);
            setBallY(GLOBALS.rowHeight - GLOBALS.platformDepth - GLOBALS.ballRadius);
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

            const isBallInGateway = (v, s) => {
                let isInGateway = false;
                let scoreGate = false;
                let i, gateNum, leftX, rightX, targetPlatform, score;
                if (v < 0) {
                    for (i = mazeData[ballRow].gateways.length - 1; i >= 0; i--) {
                        if (ballX > mazeData[ballRow].gateways[i].rightX &&
                            mazeData[ballRow].gateways[i].rightX >= ballX - GLOBALS.ballRadius && 
                            mazeData[ballRow].gateways[i].rightX <= ballX - GLOBALS.ballRadius - s) {
                            isInGateway = true;
                            gateNum = i;
                        }
                    }
                }
                else {
                    for (i = 0; i < mazeData[ballRow].gateways.length; i++) {
                        if (ballX < mazeData[ballRow].gateways[i].leftX &&
                            mazeData[ballRow].gateways[i].leftX >= ballX + GLOBALS.ballRadius &&
                            mazeData[ballRow].gateways[i].leftX <= ballX + GLOBALS.ballRadius + s) {
                            isInGateway = true;
                            gateNum = i;
                        }
                    }
                }
                if (isInGateway) {
                    leftX = mazeData[ballRow].gateways[gateNum].leftX;
                    rightX = mazeData[ballRow].gateways[gateNum].rightX;
                    // Due: allow for final row and score
                    targetPlatform = getTargetPlatform(leftX, rightX);
                    // Check whether in final row
                    if (ballRow >= GLOBALS.numMazeRows - 1) {
                        score = scoreData[gateNum];
                        scoreGate = true;
                    }
                }
                return {isInGateway, gateNum, leftX, rightX, targetPlatform, scoreGate, score};
            }

            const getTargetPlatform = (leftX, rightX) => {
                let i;
                for (i = 0; i < mazeData[ballRow + 1].platforms.length; i++) {
                    if (leftX > mazeData[ballRow + 1].platforms[i].leftX && 
                        rightX < mazeData[ballRow + 1].platforms[i].rightX) {
                        break;
                    }
                }
                if (i >= mazeData[ballRow + 1].platforms.length) i = -1;
                return i;
            }

            const doBallThroughGateway = (gateNum, leftX, rightX, targetPlatform) => {
                setIsFalling(true);
                setBallX (leftX + (rightX - leftX) / 2);
                setBallTargetPlatform(targetPlatform);
                setFallingGateNum(gateNum);
                setBallVY(0);
            }

            const doBallFalling = () => {
                let scoreGate = false;
                let score = 0;

                // Do 1 tick of adjustment
                const leftX = mazeData[ballRow].gateways[fallingGateNum].leftX;
                const rightX = mazeData[ballRow].gateways[fallingGateNum].rightX;

                let vy = ballVY;
                let by = ballY;
                let rowCeiling = (ballRow + 1) * GLOBALS.rowHeight; 
                // Check for collision with gate edge (horizontal component)
                let v = ballVelocity;
                let dt = 0;
                let cbx = ballX;
                let tickDone = false;
                while (!tickDone) {
                    let bx = cbx + v;
                    // Note the approximation in this which treats the ball as a cylinder as it drops
                    // This may need correction.
                    // Right Bounce
                    if (by - GLOBALS.ballRadius > rowCeiling && 
                        v >= 0 && bx + GLOBALS.ballRadius >= rightX) {
                        dt = dt + (v / Math.abs((rightX - GLOBALS.ballRadius) - cbx));
                        cbx = rightX - GLOBALS.ballRadius; 
                        v = 0.5 * -v;
                    }
                    // Left Bounce
                    else if (by - GLOBALS.ballRadius > rowCeiling &&
                        v < 0 && bx - GLOBALS.ballRadius <= leftX) {
                        dt = dt + (v / Math.abs((leftX + GLOBALS.ballRadius) - cbx));
                        cbx = leftX + GLOBALS.ballRadius;
                        v = 0.5 * -v;
                    }
                    else {
                        dt = 1 - dt;
                        cbx = cbx + v * dt;
                        tickDone = true;
                    }
                    // Vertical Drop
                    let s = vy * dt + GLOBALS.g * dt ** 2;
                    by = by + s;
                    vy = vy + GLOBALS.g * dt;
                    if (dt >= 1) tickDone = true;
                }
                let nextRowY = (ballRow + 2) * GLOBALS.rowHeight - GLOBALS.platformDepth - GLOBALS.ballRadius;
                if (by >= nextRowY) {
                    by = nextRowY;
                    setBallRow(prevBallRow => prevBallRow + 1);
                    let tp = ballTargetPlatform;
                    setBallPlatform(tp);
                    let {isInGateway, gateNum: fGatenum, 
                        targetPlatform: dropPlatform, scoreGate, score} =
                        isBallInGateway(v, s);
                    if (isInGateway) {
                        setFallingGateNum(fGatenum);
                        setBallPlatform(dropPlatform);
                        if (scoreGate) {
                            setIsFalling(false);
                            return {scoreGate, score}
                        }
                    }
                    else {
                        setIsFalling(false);
                    }
                }
                setBallX(cbx);
                setBallY(by);
                setBallVY(vy);
                setBallVelocity(v);
                setBallAcceleration(0);
                return {scoreGate, score}
            }

            // adjustBall main
            let a = ballAcceleration;
            let v = ballVelocity + a;
            let s = ballVelocity + a; // (t = 1)
            if (isFalling) {
                doBallFalling();
            }
            else {
                let {isInGateway, gateNum, leftX, rightX, targetPlatform, scoreGate, score} = isBallInGateway(v, s);
                if (isInGateway) {
                    if (scoreGate) {
                        score = score + roundScore;
                        setRoundScore(score);
                        setGameOver(true);
                        app.ticker.remove(adjustBall);
                        return;
                    }
                    doBallThroughGateway(gateNum, leftX, rightX, targetPlatform, v);
                }
                else {
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
            }
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
        mazeData,
        mazeTilt,
        ballX,
        setBallX,
        ballY,
        setBallY,
        ballVY,
        setBallVY,
        ballAngle,
        setBallAngle,
        ballVelocity,
        setBallVelocity,
        ballAcceleration,
        setBallAcceleration,
        ballTargetPlatform,
        setBallTargetPlatform,
        ballPlatform,
        setBallPlatform,
        ballRow,
        setBallRow,
        fallingGateNum,
        setFallingGateNum,
        isFalling,
        roundScore,
        setRoundScore,
        setGameOver,
        scoreData
    ]);

    const drawBall = useCallback((g) => {

        const moveBall = () => {

            // Draw the ball
            g.clear();

            // Determine y coordinate
            const midX = GLOBALS.stageWidth / 2;
            const midY = GLOBALS.stageHeight / 2;
            const topY = midY - GLOBALS.mazeHeight / 2;
            const py = topY + ballY;
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
        ballAngle
    ])

    return (
        <Graphics draw={drawBall} />
    )
}
