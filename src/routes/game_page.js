import {useState} from 'react';
import {Container, Row, Col} from 'react-bootstrap';
import GameStage from '../components/GameStage.js';

export default function GamePage() {
    const [initialLoad, setInitialLoad] = useState(true);
    const [roundStart, setRoundStart] = useState(true);
    const [gameStart, setGameStart] = useState(true);

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
                    />
                </Col>
                <Col sm={12} md={6} className="text-center">
                    <h2>Score</h2>
                </Col>
            </Row>
        </Container>
    )
}