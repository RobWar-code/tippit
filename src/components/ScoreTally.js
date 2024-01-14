import {Col} from 'react-bootstrap';


export default function ScoreTally({gameScore}) {

    return (
        <Col sm={12} md={6}>
            <div>
                <p className="scoreTally">Current Game Score: {gameScore}</p>
            </div>
        </Col>
    )
}