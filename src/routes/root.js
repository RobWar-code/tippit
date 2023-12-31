import {useState} from 'react';
import {
    Outlet
} from "react-router-dom";
import NavBar from '../components/NavBar';

export default function Root() {
    const [scoreTable, setScoreTable] = useState([]);
    
    return (
        <>
        <NavBar />
        <div id="detail">
            <Outlet context={[scoreTable, setScoreTable]}/>
        </div>
        </>
    )
}