import {useState, useEffect} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import GameStage from '../components/GameStage.js';
import ScoreTally from '../components/ScoreTally.js';
import GameOverModal from '../components/GameOverModal';

export default function GamePage() {
    const [initialLoad, setInitialLoad] = useState(true);
    const [roundStart, setRoundStart] = useState(true);
    const [gameStart, setGameStart] = useState(true);
    const [mazeTilt, setMazeTilt] = useState(0);
    const [roundScore, setRoundScore] = useState(0);
    const [gameScore, setGameScore] = useState(0);
    const [gameNum, setGameNum] = useState(0);
    const [lastRoundScore, setLastRoundScore] = useState(0);
    const [lastGameScore, setLastGameScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [tickerBlocked, setTickerBlocked] = useState(false);
    const [gameOverDue, setGameOverDue] = useState(false);

    // Game Over
    useEffect (() => {
        if (gameOver) {
            console.log("Game Over Score:", roundScore);
            setGameOver(false);
            setGameOverDue(true);
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
                        gameScore={gameScore}
                        setGameScore={setGameScore}
                        setGameOver={setGameOver}
                        tickerBlocked={tickerBlocked}
                    />
                </Col>
                <Col sm={12} md={6}>
                    <ScoreTally 
                        gameScore={gameScore}
                        lastGameScore={lastGameScore}
                        lastRoundScore={lastRoundScore}
                        gameNum={gameNum}
                    />
                </Col>
            </Row>
            {gameOverDue && <GameOverModal 
                gameNum={gameNum}
                roundScore={roundScore} 
                gameScore={gameScore}
                setGameOverDue={setGameOverDue}
                setGameStart={setGameStart}
                setRoundStart={setRoundStart}
                setGameNum={setGameNum}
                setLastRoundScore={setLastRoundScore}
                setLastGameScore={setLastGameScore}
            />}
        </Container>
    )
}