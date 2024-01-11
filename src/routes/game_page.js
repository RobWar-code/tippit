import {useState, useEffect} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import GameStage from '../components/GameStage.js';

export default function GamePage() {
    const [initialLoad, setInitialLoad] = useState(true);
    const [roundStart, setRoundStart] = useState(true);
    const [gameStart, setGameStart] = useState(true);
    const [mazeTilt, setMazeTilt] = useState(0);
    const [roundScore, setRoundScore] = useState(0);
    const [gameNum, setGameNum] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [tickerBlocked, setTickerBlocked] = useState(false);

    // Game Over
    useEffect (() => {
        if (gameOver) {
            console.log("Game Over Score:", roundScore);
            setGameOver(false);
            setTickerBlocked(true);
        }
    }, [gameOver, roundScore])

    return (
        <Container>
            <Row>
                <Col sm={12} md={6} className="text-center">
                    <GameStage 
                        initialLoad={initialLoad}
                        setInitialLoad={setInitialLoad}
                        roundStart={roundStart}
                        setRoundStart={setRoundStart}
                        gameStart={gameStart}
                        setGameStart={setGameStart}
                        mazeTilt={mazeTilt}
                        setMazeTilt={setMazeTilt}
                        roundScore={roundScore}
                        setRoundScore={setRoundScore}
                        setGameOver={setGameOver}
                        tickerBlocked={tickerBlocked}
                    />
                </Col>
                <Col sm={12} md={6} className="text-center">
                    <h2>Score</h2>
                </Col>
            </Row>
        </Container>
    )
}