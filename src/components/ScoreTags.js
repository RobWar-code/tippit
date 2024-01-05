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

    let textData = [];
    for (let i = 0; i < scoreData.length; i++) {
        const midX = GLOBALS.stageWidth / 2;
        const mazeLeft = midX - GLOBALS.mazeWidth / 2;
        const midY = GLOBALS.stageHeight / 2 + 5;
        let px = scoreData[i].leftX + mazeLeft + GLOBALS.gateWidth / 2 - 8;
        let py = GLOBALS.mazeHeight / 2 + midY - 20;
        // Rotate x, y to position
        let {x, y} = rotatePoint(px, py, midX, midY, mazeTilt);
        textData.push ({
            id: i,
            content: scoreData[i].score.toString(),
            x: x,
            y: y,
            rotation: mazeTilt,
            style: textStyle
        });
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