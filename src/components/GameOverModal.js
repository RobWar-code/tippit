import {useRef} from 'react';
import {Modal, Button} from 'react-bootstrap';
import GLOBALS from '../constants/constants';


export default function GameOverModal({
    gameNum, 
    roundScore, 
    gameScore, 
    setGameOverDue, 
    setGameStart, 
    setRoundStart,
    setGameNum,
    setLastRoundScore,
    setLastGameScore
}) {
    const endOfRound = useRef(false);

    const handleGameOverDue = () => {
        setGameOverDue(false);
    }

    const handleStartGame = () => {
        setGameOverDue(false);
        setGameStart(true);
        setLastGameScore(gameScore);
        if (gameNum >= GLOBALS.gamesPerRound - 1) {
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
            <Modal.Title>Game {gameNum} Over</Modal.Title>
        </Modal.Header>

        <Modal.Body className="text-center">
            <p className="scoreTally">Game Score: {gameScore}&emsp;&emsp;Round Score: {roundScore}</p>
        </Modal.Body>

        <Modal.Footer>
            <Button variant="primary" onClick={handleStartGame}>
            { endOfRound.current ? (
                "Next Game"
            ):(
                "Next Round"
            )}
            </Button>
        </Modal.Footer>
        </Modal.Dialog>
    </Modal>

    )
}