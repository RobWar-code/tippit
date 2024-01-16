import {useState, useEffect} from 'react';
import {Container, Row, Col, Button} from 'react-bootstrap';
import GameStage from '../components/GameStage.js';
import ScoreTally from '../components/ScoreTally.js';
import GameOverModal from '../components/GameOverModal';
import Tools from '../components/Tools';
import GLOBALS from '../constants/constants';

export default function GamePage() {
    const [introDue, setIntroDue] = useState(true);
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
    const [soundEnabled, setSoundEnabled] = useState(false);
    const [gForce, setGForce] = useState(GLOBALS.minG);

    // Game Over
    useEffect (() => {
        if (gameOver) {
            console.log("Game Over Score:", roundScore);
            setGameOver(false);
            setGameOverDue(true);
            setTickerBlocked(true);
        }
    }, [gameOver, roundScore])

    const handleDismiss = () => {
        setIntroDue(false);
    }

    return (
        <Container>
            {introDue &&
                <Row>
                    <Col sm={2}>
                    </Col>
                    <Col sm={8}className="text-center introPanel">
                        <p>Welcome to Tippit</p>
                        <p>Use the Tilt Control to control and make the ball fall
                            through the score gaps in the maze.
                        </p>
                        <Button variant="primary" onClick={handleDismiss}>Dismiss Text</Button>
                    </Col>
                </Row>
            }
            <Row>
                <Col md={12} lg={6} className="text-center stageCol">
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
                        setTickerBlocked={setTickerBlocked}
                        soundEnabled={soundEnabled}
                        gForce={gForce}
                    />
                </Col>
                <Col md={12} lg={6}>
                    <ScoreTally 
                        gameScore={gameScore}
                        lastGameScore={lastGameScore}
                        roundScore={roundScore}
                        lastRoundScore={lastRoundScore}
                        gameNum={gameNum}
                    />
                    <Tools 
                        soundEnabled={soundEnabled}
                        setSoundEnabled={setSoundEnabled}
                        setGForce={setGForce}
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