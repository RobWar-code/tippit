import {Row, Col, Form} from 'react-bootstrap';
import SoundToggle from './SoundToggle';
import GLOBALS from '../constants/constants';

export default function Tools({soundEnabled, setSoundEnabled, setGForce}) {

    const sliderChange = (e) => {
        const sliderVal = e.target.value;
        const gRange = GLOBALS.maxG - GLOBALS.minG;
        const newVal = GLOBALS.minG + gRange * sliderVal/100;
        setGForce(newVal);
    }

    return (
        <Row className="toolRow">
            <Col sm={4}>
                <SoundToggle soundEnabled={soundEnabled} setSoundEnabled={setSoundEnabled} />
            </Col>
            <Col sm={8} className="text-center">
                <p className="sliderHead">G Acceleration Control</p>
                <span className="sliderText">-{GLOBALS.minG}N&emsp;</span>
                <Form.Range className="gSlider" defaultValue={0} onChange={sliderChange} 
                    title="Adjust acceleration - extra points"
                />
                <span className="sliderText">&emsp;+{GLOBALS.maxG}N</span>
            </Col>
        </Row>
    )
}