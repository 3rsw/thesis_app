import QuizArrows from "./QuizArrows";
import QuizLine from "./QuizLine";
import { useState } from 'react';

const QuizCode = ({ code, lineNum, boxes, branches, prevBranches, clickedLine, setClickedLine, prevClickedLine, fetchNextStep, allInputsHaveAttempt, canFetchNext }) => {
    const lines = code.split("\n");
    const [hoveredLine, setHoveredLine] = useState(null);
    //const [clickedLine, setClickedLine] = useState(null);

    return (
        <div className="card grey lighten-3 text-white code" style={{ position: 'relative' }}>
            <div className="scrollable-div" style={{ padding: "10px", position: 'relative' }}>
                {lines.map((line, index) => (
                    <QuizLine
                        key={index}
                        line={line}
                        index={index}
                        isCurrentLine={index + 1 === lineNum}
                        isHovered={hoveredLine === index + 1}
                        isClicked={clickedLine === index + 1}
                        boxes={boxes}
                        prevBranches={prevBranches}
                        prevClickedLine={prevClickedLine}
                        onMouseEnter={() => {
                            if (branches.includes(index + 1)) {
                                setHoveredLine(index + 1);
                            }
                        }}
                        onMouseLeave={() => setHoveredLine(null)}
                        onClick={() => {
                            if (branches.includes(index + 1)) {
                                setClickedLine(index + 1);
                            }
                        }}
                    />
                ))}
                <QuizArrows branches={branches} lineNum={lineNum} hoveredLine={hoveredLine} clickedLine={clickedLine} />
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)',
                }}
            >
                {canFetchNext ? (
                    <button onClick={fetchNextStep} disabled={(allInputsHaveAttempt) === false ? true : false} className="btn unselected">
                        <i className="material-icons">arrow_downward</i>
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default QuizCode;
