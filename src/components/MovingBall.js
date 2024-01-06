import {useState, useEffect, useCallback} from 'react';
import {Graphics, useApp} from '@pixi/react';
import GLOBALS from '../constants/constants';

export default function MovingBall ({
    mazeTilt,
    setMazeTilt,
    mazeData,
    startGame,
    startRound,
    initialLoad
}) {
    const ballVelocity = useState(0);
    const ballAcceleration = useState(0);
    const ballRow = useState(0);
    const ballPlatform = useState(0);
    const ballX = useState(0);
    const ballY = useState(0);
    const app = useApp();

    useEffect(() => {
        setMazeTilt(0); // Consider slider position

    }, [startGame, startRound, initialLoad])

    const drawBall = useCallback((g) => {

    }, [app, app.ticker])

    return (
        <Graphics draw={drawBall} />
    )
}
