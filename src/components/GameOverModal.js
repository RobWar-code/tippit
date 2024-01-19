import {useRef} from 'react';
import {Modal, Button} from 'react-bootstrap';
import GLOBALS from '../constants/constants';


export default function GameOverModal({
    gameNum, 
    roundNum,
    roundScore, 
    gameScore, 
    setGameOverDue, 
    setGameStart, 
    setRoundStart,
    setGameNum,
    setRoundNum,
    setLastRoundScore,
    setLastGameScore,
    setScoreTable
}) {
    const endOfRound = useRef(false);

    const handleGameOverDue = () => {
        setGameOverDue(false);
    }

    const handleStartGame = () => {
        setGameOverDue(false);
        setGameStart(true);
        setLastGameScore(gameScore);
        setGameNum(gameNum + 1);
        if (gameNum >= GLOBALS.gamesPerRound - 1) {
            setScoreTable(prevScoreTable => [...prevScoreTable, {score: roundScore, round: roundNum + 1}]);
            setRoundNum(roundNum + 1);
            setRoundStart(true);
            setGameNum(0);
            setLastRoundScore(roundScore);
            endOfRound.current = false;
        }
    }

    if (gameNum >= GLOBALS.gamesPerRound - 1) {
        endOfRound.current = true;
    }

    return (
    <Modal
        show="show" onHide={handleGameOverDue}
    >
        <Modal.Dialog>
        <Modal.Header closeButton>
            <Modal.Title>Game {gameNum + 1} Over</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
            <p className="scoreTally">Game Score: {gameScore}&emsp;&emsp;Round Score: {roundScore}</p>
        </Modal.Body>

        <Modal.Footer>
            <Button variant="primary" onClick={handleStartGame}>
            { endOfRound.current ? (
                "Next Round"
            ):(
                "Next Game"
            )}
            </Button>
        </Modal.Footer>
        </Modal.Dialog>
    </Modal>

    )
}