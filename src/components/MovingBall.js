import {useRef, useState, useEffect, useCallback} from 'react';
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
    setGameOver,
    tickerBlocked
}) {
    const [ballX, setBallX] = useState(0);
    const [ballY, setBallY] = useState(0);
    const [ballAngle, setBallAngle] = useState(Math.PI * 1.5);
    const ballVelocity = useRef(0);
    const ballAcceleration = useRef(0);
    const ballRow = useRef(0);
    const ballPlatform = useRef(0);
    const isFalling = useRef(false);
    const ballVY = useRef(0);
    const ballTargetPlatform = useRef(0);
    const fallingGateNum = useRef(0);
    const gameScore = useRef(0);

    const app = useApp();

    useEffect(() => {
        if (gameStart || roundStart || initialLoad) {
            setMazeTilt(0); // Consider slider position
            ballRow.current = 0;
            ballPlatform.current = 0;
            const leftX = mazeData[0].platforms[1].leftX;
            const rightX = mazeData[0].platforms[1].rightX;
            setBallX(leftX + (rightX - leftX) / 2);
            setBallY(GLOBALS.rowHeight - GLOBALS.platformDepth - GLOBALS.ballRadius);
            ballAcceleration.current = 0;
            ballVelocity.current = 0;
            setBallAngle(Math.PI * 1.5);
            setGameStart(0);
            setRoundStart(0);
            setInitialLoad(0); 
            gameScore.current = 0;
        }
    }, [mazeData,
        gameStart,
        setGameStart, 
        roundStart, 
        setRoundStart,
        initialLoad, 
        setInitialLoad,
        setMazeTilt,
        ballX,
        ballY,
        ballAngle
    ])

    // Update Ball State
    useEffect( () => {
        const adjustBall = () => {

            const getScore = (ballRow, gateNum) => {
                let didScore = false;
                let score = 0;
                let scoreLine = 0;
                for (let i = 0; i < GLOBALS.scoreRows.length; i++) {
                    if (GLOBALS.scoreRows[i] === ballRow) {
                        didScore = true;
                        scoreLine = i;
                        break;
                    }
                }
                if (didScore) {
                    score = scoreData[scoreLine][gateNum];
                }
                return {didScore, score};
            }

            const isBallInGateway = (ballRow, v, s) => {
                let isInGateway = false;
                let exitMaze = false;
                let i, gateNum, leftX, rightX, targetPlatform, score;
                if (v < 0) {
                    for (i = mazeData[ballRow].gateways.length - 1; i >= 0; i--) {
                        let gateLeft = mazeData[ballRow].gateways[i].leftX;
                        let gateRight = mazeData[ballRow].gateways[i].rightX;
                        if ((ballX >= gateRight && 
                            gateRight >= ballX - GLOBALS.ballRadius && 
                            gateRight <= ballX - GLOBALS.ballRadius - s
                            )
                            ||
                            (ballX < gateRight && gateLeft < ballX)
                        ){
                            isInGateway = true;
                            gateNum = i;
                        }
                    }
                }
                else {
                    for (i = 0; i < mazeData[ballRow].gateways.length; i++) {
                        let gateLeft = mazeData[ballRow].gateways[i].leftX;
                        let gateRight = mazeData[ballRow].gateways[i].rightX;
                        if ((ballX < gateLeft &&
                            gateLeft >= ballX + GLOBALS.ballRadius &&
                            gateLeft <= ballX + GLOBALS.ballRadius + s)
                            ||
                            (ballX > gateLeft && gateRight > ballX)
                        ){
                            isInGateway = true;
                            gateNum = i;
                        }
                    }
                }
                if (isInGateway) {
                    leftX = mazeData[ballRow].gateways[gateNum].leftX;
                    rightX = mazeData[ballRow].gateways[gateNum].rightX;
                    // Due: allow for final row and score
                    // Check whether in final row
                    let {didScore, score} = getScore(ballRow, gateNum);
                    if (didScore) {
                        gameScore.current += score;
                    }
                    if (ballRow >= GLOBALS.numMazeRows - 1) {
                        targetPlatform = -1;
                        exitMaze = true;
                    }
                    else {
                        targetPlatform = getTargetPlatform(ballRow, leftX, rightX);
                    }
                }
                return {isInGateway, gateNum, leftX, rightX, targetPlatform, exitMaze, score};
            }

            const getTargetPlatform = (ballRow, leftX, rightX) => {
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
                isFalling.current = true;
                setBallX(leftX + (rightX - leftX) / 2);
                ballTargetPlatform.current = targetPlatform;
                fallingGateNum.current = gateNum;
                ballVY.current = 0;
            }

            const doBallFalling = () => {
                let scoreGate = false;
                let score = 0;

                // Do 1 tick of adjustment
                const leftX = mazeData[ballRow.current].gateways[fallingGateNum.current].leftX;
                const rightX = mazeData[ballRow.current].gateways[fallingGateNum.current].rightX;

                let vy = ballVY.current;
                let by = ballY;
                let rowCeiling = (ballRow + 1) * GLOBALS.rowHeight; 
                // Check for collision with gate edge (horizontal component)
                let v = ballVelocity.current;
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
                let nextRowY = (ballRow.current + 2) * GLOBALS.rowHeight - GLOBALS.platformDepth - GLOBALS.ballRadius;
                if (by >= nextRowY) {
                    by = nextRowY;
                    let br = ballRow.current + 1;
                    ballRow.current = br;
                    let tp = ballTargetPlatform.current;
                    ballPlatform.current = tp;
                    let {isInGateway, gateNum: fGatenum, 
                        targetPlatform: dropPlatform, exitMaze, score} =
                        isBallInGateway(br, v, s);
                    if (isInGateway) {
                        console.log("Falling in gateway", fGatenum);
                        fallingGateNum.current = fGatenum;
                        ballPlatform.current = dropPlatform;
                        ballVelocity.current = 0;
                        if (exitMaze) {
                            isFalling.current = false;
                            return {exitMaze, score};
                        }
                    }
                    else {
                        isFalling.current = false;
                    }
                }
                setBallX(cbx);
                setBallY(by);
                ballVY.current = vy;
                ballVelocity.current = v;
                ballAcceleration.current = 0;
                return {scoreGate, score}
            }

            // adjustBall main
            let a = ballAcceleration.current;
            let v = ballVelocity.current + a;
            let s = ballVelocity.current + a; // (t = 1)
            if (isFalling.current) {
                doBallFalling();
            }
            else {
                let {isInGateway, gateNum, leftX, rightX, targetPlatform, exitMaze, score} = 
                    isBallInGateway(ballRow.current, v, s);
                if (isInGateway) {
                    if (exitMaze) {
                        isFalling.current = false;
                        setRoundScore(prevRoundScore => prevRoundScore + gameScore.current);
                        setGameOver(true);
                        app.ticker.remove(adjustBall);
                    }
                    else {
                        doBallThroughGateway(gateNum, leftX, rightX, targetPlatform, v);
                    }
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
                    ballVelocity.current = v; // u + a * t
                    a = GLOBALS.g * (mazeTilt * 180/Math.PI) / 180;
                    ballAcceleration.current = a;
                }
            }
        }

        if (!tickerBlocked) {
            app.ticker.add(adjustBall);
        }

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
        roundScore,
        setRoundScore,
        setGameOver,
        scoreData,
        tickerBlocked,
        ballX,
        ballY,
        ballAngle
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
