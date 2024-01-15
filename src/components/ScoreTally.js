import GLOBALS from '../constants/constants';


export default function ScoreTally({gameScore, lastGameScore, lastRoundScore, gameNum}) {

    return (
        <div className="scoreBox text-center">
            <p className="scoreTally">Game Number: {gameNum + 1} of {GLOBALS.gamesPerRound}</p>
            <p className="scoreTally">Current Game Score: {gameScore}&emsp;&emsp;Last Game Score: {lastGameScore}</p>
            <p className="scoreTally">Last Round Score: {lastRoundScore}</p>
        </div>
    )
}