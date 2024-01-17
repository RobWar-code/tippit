import {useRef} from 'react';
import {useOutletContext} from 'react-router-dom';
import {Container, Row, Col} from 'react-bootstrap';

export default function ScorePage() {
    const [scoreTable] = useOutletContext();
    const roundsIn = useRef(false);
    const sortedScores = useRef([]);

    if (scoreTable.length > 0) {
        roundsIn.current = true;
        sortedScores.current = scoreTable.slice().sort((a,b) => b.score - a.score);
    }
    else {
        roundsIn.current = false;
    }

    return (
        <Container>
            <Row>
                <Col className="text-center">
                    <h1>Round Scores</h1>
                    {roundsIn.current ? (
                        <>
                            <table className="scoreTable">
                                <thead>
                                    <tr>
                                        <th>Round</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                {sortedScores.current.map((scoreItem, index) => {
                                    return (
                                    <tr key={index}>
                                        <td>{scoreItem.round}</td>
                                        <td>{scoreItem.score}</td>
                                    </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </>
                    ) : (
                        <p>No Rounds Completed</p>
                    )}
                </Col>
            </Row>
        </Container>
    )
}