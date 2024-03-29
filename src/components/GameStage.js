import {useRef, useState, useEffect, useCallback} from 'react';
import {Stage, Graphics} from '@pixi/react';
import {Form} from 'react-bootstrap';
import GLOBALS from '../constants/constants';
import ScoreTags from './ScoreTags'
import MovingBall from './MovingBall';


export default function GameStage({
    initialLoad,
    setInitialLoad,
    roundStart,
    setRoundStart,
    gameStart,
    setGameStart,
    mazeTilt,
    setMazeTilt,
    roundScore,
    setRoundScore,
    gameScore,
    setGameScore,
    setGameOver,
    tickerBlocked,
    setTickerBlocked,
    soundEnabled,
    gForce
}) {
    const [mazeData, setMazeData] = useState([]);
    const [scoreData, setScoreData] = useState([]);
    const [mazeBuilt, setMazeBuilt] = useState(false);
    const sliderRef = useRef(null);

    useEffect( () => {
        const createMaze = () => {
            let maze = [];
            // First Row
            // First Platform
            let leftX = 0;
            let rightX = 50 + Math.floor(Math.random() * (GLOBALS.mazeWidth / 5));
            let gapLeftX = rightX;
            let gapRightX = rightX + GLOBALS.gateWidth;
            maze.push({
                platforms: [
                    {
                        leftX: leftX,
                        rightX: rightX
                    }
                ],
                gateways: [
                    {
                        leftX: gapLeftX,
                        rightX: gapRightX
                    }
                ]
            });
            // Second Platform
            leftX = gapRightX;
            rightX = GLOBALS.mazeWidth/2 + 50 + Math.floor(Math.random() * (GLOBALS.mazeWidth / 5));
            gapLeftX = rightX;
            gapRightX = rightX + GLOBALS.gateWidth;
            maze[0].platforms.push ({
                leftX: leftX,
                rightX: rightX
            });
            maze[0].gateways.push({
                leftX: gapLeftX,
                rightX: gapRightX
            });
            // Third Platform
            leftX = gapRightX;
            rightX = GLOBALS.mazeWidth - 1;
            maze[0].platforms.push({
                leftX: leftX,
                rightX: rightX
            });


            // Second and Third Platforms
            for (let i = 1; i < 3; i++) {
                maze.push({
                    platforms: [],
                    gateways: []
                })
                leftX = 0;
                let prevNumPlatforms = maze[i - 1].platforms.length;
                for (let j = 0; j < prevNumPlatforms; j++) {
                    let oldPlatformLeft = maze[i - 1].platforms[j].leftX;
                    let oldPlatformRight = maze[i - 1].platforms[j].rightX;
                    let oldPlatformWidth = oldPlatformRight - oldPlatformLeft + 1;
                    if (oldPlatformWidth > GLOBALS.gateWidth + 2 * GLOBALS.ballRadius) {
                        let shift = Math.floor(Math.random() * 10);
                        rightX = oldPlatformLeft + Math.floor((oldPlatformWidth / 2 - GLOBALS.gateWidth / 2) * (shift + 90)/100);
                        maze[i].platforms.push({
                            leftX: leftX,
                            rightX: rightX
                        });
                        maze[i].gateways.push({
                            leftX: rightX,
                            rightX: rightX + GLOBALS.gateWidth
                        });
                        leftX = rightX + GLOBALS.gateWidth;
                    }
                }
                // If the final platform is long enough, add another gateway
                let testPlatformWidth = GLOBALS.mazeWidth - leftX;
                if (testPlatformWidth > GLOBALS.gateWidth + 2 * GLOBALS.ballRadius) {
                    let shift = Math.floor(Math.random() * 10) + 90;
                    rightX = leftX + Math.floor((testPlatformWidth / 2 - GLOBALS.gateWidth / 2) * shift/100);
                    maze[i].platforms.push(
                        {
                            leftX: leftX,
                            rightX: rightX
                        }
                    );
                    maze[i].gateways.push(
                        {
                            leftX: rightX,
                            rightX: rightX + GLOBALS.gateWidth
                        }
                    );
                    leftX = rightX + GLOBALS.gateWidth;
                }
                    
                // Add Final Platform
                rightX = GLOBALS.mazeWidth - 1;
                maze[i].platforms.push({
                    leftX: leftX,
                    rightX: rightX
                })
            } // Next of 2,3 rows

            // Subsequent Rows ( 3 - 19 )
            for (let i = 3; i < GLOBALS.numMazeRows; i++) {
                maze.push({
                    platforms: [],
                    gateways: [{
                        leftX: 0,
                        rightX: GLOBALS.gateWidth - 1
                    }]
                })
                leftX = GLOBALS.gateWidth - 1;
                // Each platform
                let shift = 0;
                let rowDone = false;
                let platformNum = 0;
                if (i === 3) platformNum = 1;
                while (!rowDone) {
                    let priorPlatLeft = maze[i-1].platforms[platformNum].leftX;
                    let priorPlatRight = maze[i-1].platforms[platformNum].rightX;
                    if ((priorPlatRight - priorPlatLeft - GLOBALS.gateWidth) / 2 > GLOBALS.minPlatformWidth) {
                        // Insert Gap
                        shift = 15 - Math.floor(Math.random() * 30);
                        rightX = priorPlatLeft + ((priorPlatRight - priorPlatLeft) / 2) * (1 + shift / 100);
                        // Check whether this split leaves too short a platform on the right
                        let residue = GLOBALS.mazeWidth - rightX - GLOBALS.gateWidth * 2;
                        if (residue < GLOBALS.minPlatformWidth) rightX = rightX - GLOBALS.minPlatformWidth;
                        maze[i].platforms.push({
                            leftX: leftX,
                            rightX: rightX
                        });
                        maze[i].gateways.push({
                            leftX: rightX,
                            rightX: rightX + GLOBALS.gateWidth
                        });
                        leftX = rightX + GLOBALS.gateWidth;
                    }
                    ++platformNum;
                    if (platformNum >= maze[i-1].platforms.length) rowDone = true;
                    if (rowDone === true) {
                        maze[i].platforms.push({
                            leftX: leftX,
                            rightX: GLOBALS.mazeWidth - GLOBALS.gateWidth
                        })
                        maze[i].gateways.push({
                            leftX: GLOBALS.mazeWidth - GLOBALS.gateWidth,
                            rightX: GLOBALS.mazeWidth - 1
                        })
                    }
                }
            }
            setMazeData(maze);
            doScoreData(maze);
            setMazeBuilt(true);
        }

        const doScoreData = (maze) => {
            const maxs = Math.floor(GLOBALS.maxDropScore * 
                (1 + (gForce - GLOBALS.minG) / (GLOBALS.maxG - GLOBALS.minG)));
            let maxScore = maxs;
            let scoreTagData = [];
            const numScoreRows = GLOBALS.scoreRows.length;
            for (let i = 0; i < numScoreRows; i++) {
                scoreTagData.push([]);
                let mazeRow = GLOBALS.scoreRows[i];
                let numDrops = maze[mazeRow].gateways.length;
                for (let j = 0; j < numDrops; j++) {
                    let entry = {};
                    entry.leftX = maze[mazeRow].gateways[j].leftX;
                    entry.rightX = maze[mazeRow].gateways[j].rightX;
                    if (j === 0 || j === numDrops - 1) {
                        entry.score = 0;
                    }
                    else {
                        entry.score = Math.floor(maxScore / 4 * Math.random());
                    }
                    scoreTagData[i].push(entry);
                }
                // Assign maximum score
                let n = numDrops - 2;
                let p = Math.floor(Math.random() * n) + 1;
                scoreTagData[i][p].score = maxScore;

                maxScore *= 2;
            }
            setScoreData(scoreTagData);
        }
        if (initialLoad || roundStart || gameStart) {
            createMaze();
        }

    }, [initialLoad, roundStart, gameStart, gForce])

    const drawMaze = useCallback((g) => {
        const mazeLeft = GLOBALS.stageWidth / 2 - GLOBALS.mazeWidth / 2;
        const mazeTop = GLOBALS.stageHeight / 2 - GLOBALS.mazeHeight / 2;
        const midX = GLOBALS.stageWidth / 2;
        const midY = GLOBALS.stageHeight / 2;

        const rotatePoint = (px, py, mx, my, a) => {
			// Translate point to origin
			let translatedX = px - mx;
			let translatedY = py - my;

			// Rotate point
			let rotatedX = translatedX * Math.cos(a) - translatedY * Math.sin(a);
			let rotatedY = translatedX * Math.sin(a) + translatedY * Math.cos(a);

			// Translate point back
			let finalX = rotatedX + mx;
			let finalY = rotatedY + my;

			return { x: finalX, y: finalY };
		}

        g.clear();

        g.lineStyle(1, 0x000000, 1);

        // Draw the bounding rectangle
        let rect = [];
        let leftX = midX - GLOBALS.mazeWidth / 2;
        let rightX = midX + GLOBALS.mazeWidth / 2;
        let topY = midY - GLOBALS.mazeHeight / 2;
        let bottomY = midY + GLOBALS.mazeHeight / 2;
        rect.push({x: leftX, y: topY});
        rect.push({x: rightX, y: topY});
        rect.push({x: rightX, y: bottomY});
        rect.push({x: leftX, y: bottomY});
        // Adjust for tilt
        for (let i = 0; i < 4; i++) {
            let {x, y} = rotatePoint(rect[i].x, rect[i].y, midX, midY, mazeTilt);
            rect[i].x = x;
            rect[i].y = y;
        }
        // Draw the rectangle
        g.beginFill(0xf0f0f0);
        g.moveTo(rect[0].x, rect[0].y);
        for (let i = 0; i < 4; i++) {
            let n = (i + 1) % 4;
            g.lineTo(rect[n].x, rect[n].y);
        }
        g.endFill();

        let rowOffsetY = GLOBALS.rowHeight - GLOBALS.platformDepth;
        for (let row of mazeData) {
            for (let platform of row.platforms) {
                let leftX = platform.leftX;
                let rightX = platform.rightX;
                // Determine corner nodes on angles
                let rect=[];
                rect.push({x: mazeLeft + leftX, y: mazeTop + rowOffsetY});
                rect.push({x: mazeLeft + rightX, y: mazeTop + rowOffsetY});
                rect.push({x: mazeLeft + rightX, y: mazeTop + rowOffsetY + GLOBALS.platformDepth - 1});
                rect.push({x: mazeLeft + leftX, y: mazeTop + rowOffsetY + GLOBALS.platformDepth - 1});
                // Determine tilt positions
                for (let p of rect) {
                    let {x, y} = rotatePoint(p.x, p.y, midX, midY, mazeTilt);
                    p.x = x;
                    p.y = y;
                }
                // Draw Platform
                g.beginFill(0xff0000);
                g.moveTo(rect[0].x, rect[0].y);
                for (let i = 0; i < 4; i++) {
                    let n = (i + 1) % 4;
                    g.lineTo(rect[n].x, rect[n].y);
                }
                g.endFill();
            }
            rowOffsetY = rowOffsetY + GLOBALS.rowHeight;
        }

    }, [mazeData, mazeTilt]);

    /* Reset Slider */
    useEffect( () => {
        if (gameStart) {
            const slider = sliderRef.current;
            slider.value = 50;
        }
    }, [gameStart])

    const sliderChange = (e) => {
        const p = e.target.value;
        let angle = ((p / 100) * GLOBALS.maxTilt * 2 - GLOBALS.maxTilt) * Math.PI/180;
        setMazeTilt(angle);
    }

    return (
        <>
        <Stage width={GLOBALS.stageWidth} height={GLOBALS.stageHeight} options={{antialias: true, background: 0xc0c000}}>
            { mazeBuilt &&
            <>
                <Graphics draw={drawMaze} />
                <ScoreTags scoreData={scoreData} mazeTilt={mazeTilt}/>
                <MovingBall
                    mazeTilt={mazeTilt}
                    setMazeTilt={setMazeTilt}
                    mazeData={mazeData}
                    gameStart={gameStart}
                    setGameStart={setGameStart}
                    roundStart={roundStart}
                    setRoundStart={setRoundStart}
                    initialLoad={initialLoad}
                    setInitialLoad={setInitialLoad}
                    scoreData={scoreData}
                    roundScore={roundScore}
                    setRoundScore={setRoundScore}
                    gameScore={gameScore}
                    setGameScore={setGameScore}
                    setGameOver={setGameOver}
                    tickerBlocked={tickerBlocked}
                    setTickerBlocked={setTickerBlocked}
                    soundEnabled={soundEnabled}
                    gForce={gForce}
                />  
            </>
            }
        </Stage>
        <div className="text-center">
            <p className="sliderHead">Tilt Control</p>
            <span className="sliderText">-{GLOBALS.maxTilt}&deg;&emsp;</span>
            <Form.Range className="tiltSlider" defaultValue={50} onChange={sliderChange} ref={sliderRef}/>
            <span className="sliderText">&emsp;+{GLOBALS.maxTilt}&deg;</span>
        </div>
        </>
    )
}