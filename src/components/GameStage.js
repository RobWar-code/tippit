import {useState, useEffect} from 'react';
import {Stage} from '@pixi/react';
import GLOBALS from '../constants/constants';


export default function GameStage({
    initialLoad,
    setInitialLoad,
    roundStart,
    setRoundStart,
    gameStart,
    setGameStart
}) {
    const [mazeData, setMazeData] = useState([]);

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
            for (i = 1; i < 3; i++) {
                maze.push({
                    platforms: [],
                    gateways: []
                })
                leftX = 0;
                let prevNumGaps = maze[i - 1].gateways.length;
                for (j = 0; j < prevNumGaps; j++) {
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

            // Subsequent Rows
        }

    }, [initialLoad, roundStart, gameStart])
    return (
        <Stage width={GLOBALS.stageWidth} height={GLOBALS.stageHeight} options={{background: 0xc0c000}}>

        </Stage>
    )
}