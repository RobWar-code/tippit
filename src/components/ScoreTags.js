import {Text} from '@pixi/react';
import * as PIXI from 'pixi.js';
import {rotatePoint} from '../libraries/geometry';
import GLOBALS from '../constants/constants';


export default function ScoreTags({
    scoreData,
    mazeTilt
}) {
    const textStyle = new PIXI.TextStyle({
        fontFamily: 'Helvetica, sans-serif',
        fontSize: 14,
        fill: 0x000040
    });

    const PixiText =({content, x, y, rotation, style}) => {
        return <Text text={content} x={x} y={y} rotation={rotation} style={style} />
    };

    const midX = GLOBALS.stageWidth / 2;
    const mazeLeft = midX - GLOBALS.mazeWidth / 2;
    const midY = GLOBALS.stageHeight / 2;
    let textData = [];
    let id = 0;
    for (let i = 0; i < GLOBALS.scoreRows.length; i++) {
        let row = GLOBALS.scoreRows[i];
        let py = GLOBALS.stageHeight / 2 - GLOBALS.mazeHeight / 2 + GLOBALS.rowHeight * row;
        for (let j = 0; j < scoreData[i].length; j++) {
            let charLen = (scoreData[i][j].score + "").length;
            let px = scoreData[i][j].leftX + mazeLeft + GLOBALS.gateWidth / 2 - charLen * 8 / 2;
            // Rotate x, y to position
            let {x, y} = rotatePoint(px, py, midX, midY, mazeTilt);
            textData.push ({
                id: id,
                content: scoreData[i][j].score.toString(),
                x: x,
                y: y,
                rotation: mazeTilt,
                style: textStyle
            });
            ++id;
        }
    }
    const texts = textData;

    return (
        <>
        {texts.map(text => (
            <PixiText key={text.id} content={text.content} x={text.x} y={text.y} anchor={0.5} rotation={text.rotation} style={text.style}/>
        ))}
        </>
    )
}