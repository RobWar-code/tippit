import {useEffect} from 'react';
import {Button} from 'react-bootstrap';
import dingSound from '../assets/sounds/ding.mp3';
import soundOn from '../assets/images/soundOn.png';
import soundOff from '../assets/images/soundOff.png';

export default function SoundToggle({soundEnabled, setSoundEnabled}) {
    useEffect( () => {
        localStorage.setItem('soundEnabled', soundEnabled);
    }, [soundEnabled])

    const toggleSound = () => {
        let newSound = !soundEnabled;
        setSoundEnabled(newSound);
        if (newSound) {
            playSound();
        }
    }

    const playSound = () => {
        const ding = new Audio(dingSound);
        ding.play();
    }

    return (
        <Button variant="success" className="toolButton" onClick={toggleSound}>{
            soundEnabled ? 
                <img src={soundOn} alt="Sound On" title="Turn Sound Off" width="60" height="60" /> : 
                <img src={soundOff} alt="Sound Off" title="Turn Sound On" width="60" height="60" />
        }</Button>
    )
}