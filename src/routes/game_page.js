import {Container, Row, Col} from 'react-bootstrap';
import {Stage} from '@pixi/react';
import GLOBALS from '../constants/constants';

export default function GamePage() {
    return (
        <Container>
            <Row>
                <Col sm={12} md={6} className="text-center">
                    <Stage width={GLOBALS.stageWidth} height={GLOBALS.stageHeight} options={{background: 0xc0c000}}>

                    </Stage>
                </Col>
                <Col sm={12} md={6} className="text-center">
                    <h2>Score</h2>
                </Col>
            </Row>
        </Container>
    )
}