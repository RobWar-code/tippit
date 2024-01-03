import {useState, useEffect, useCallback} from 'react';
import {Stage, Graphics} from '@pixi/react';
import GLOBALS from '../constants/constants';


export default function GameStage({
    initialLoad,
    setInitialLoad,
    roundStart,
    setRoundStart,
    gameStart,
    setGameStart,
    mazeTilt
}) {
    const [mazeData, setMazeData] = useState([]);

    useEffect( () => {
        const createMaze = () => {
            let maze = [];
            const minOverhang = 10;
            const minPlatformWidth = 10;
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
                let prevNumGaps = maze[i - 1].gateways.length;
                for (let j = 0; j < prevNumGaps; j++) {
                    let oldGapX = maze[i - 1].gateways[j].leftX;
                    let shift = Math.floor(Math.random() * 50) + 25;
                    rightX = leftX + Math.floor((oldGapX - leftX) * shift/100);
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
                // Add Extra Gateway
                let shift = Math.floor(Math.random() * 50) + 25;
                rightX = leftX + Math.floor((GLOBALS.mazeWidth - leftX) * shift/100);
                maze[i].platforms.push({
                    leftX: leftX,
                    rightX: rightX
                });
                maze[i].gateways.push({
                    leftX: rightX,
                    rightX: rightX + GLOBALS.gateWidth
                });
                // Add Final Platform
                leftX = rightX + GLOBALS.gateWidth;
                rightX = GLOBALS.mazeWidth - 1;
                maze[i].platforms.push({
                    leftX: leftX,
                    rightX: rightX
                })
            } // Next of 2,3 rows

            // Subsequent Rows ( 3 - 19 )
            for (let i = 3; i <= 19; i++) {
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
                let gateNum = 0;
                let platformNum = 0;
                if (i === 3) platformNum = 1;
                if (i > 3) gateNum = 1;
                while (!rowDone) {
                    let priorPlatLeft = maze[i-1].platforms[platformNum].leftX;
                    let priorPlatRight = maze[i-1].platforms[platformNum].rightX;
                    if ((priorPlatRight - priorPlatLeft - GLOBALS.gateWidth) / 2 > 6) {
                        // Insert Gap
                        shift = 15 - Math.floor(Math.random() * 30);
                        rightX = priorPlatLeft + ((priorPlatRight - priorPlatLeft) / 2) * (1 + shift / 100);
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
                    ++gateNum;
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
        }

        if (initialLoad || roundStart || gameStart) {
            createMaze();
        }

    }, [initialLoad, roundStart, gameStart])

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

        g.drawRect(mazeLeft, mazeTop, GLOBALS.mazeWidth, GLOBALS.mazeHeight);

        let rowOffsetY = GLOBALS.rowHeight - GLOBALS.platformDepth;
        let count = 0;
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
                for (let i = 0; i < 4; i++) {
                    let n = (i + 1) % 4;
                    g.moveTo(rect[i].x, rect[i].y);
                    g.lineTo(rect[n].x, rect[n].y);
                }
            }
            rowOffsetY = rowOffsetY + GLOBALS.rowHeight;
            ++count;
        }

    }, [mazeData, mazeTilt]);

    return (
        <Stage width={GLOBALS.stageWidth} height={GLOBALS.stageHeight} options={{background: 0xc0c000}}>
            <Graphics draw={drawMaze} />
        </Stage>
    )
}