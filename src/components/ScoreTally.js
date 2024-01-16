import {Row, Col} from 'react-bootstrap';
import GLOBALS from '../constants/constants';


export default function ScoreTally({gameScore, lastGameScore, roundScore, lastRoundScore, gameNum}) {

    return (
        <Row className="scoreBox">
            <Col className="text-center">
                <p className="scoreTally">Game Number: {gameNum + 1} of {GLOBALS.gamesPerRound}</p>
                <p className="scoreTally">Current Game Score: {gameScore}</p>
                <p className="scoreTally">Last Game Score: {lastGameScore}</p>
                <p className="scoreTally">Round Score: {roundScore}&emsp;&emsp;Last Score: {lastRoundScore}</p>
            </Col>
        </Row>
    )
}