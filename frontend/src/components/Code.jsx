import Arrows from "./Arrows";
import Line from "./Line";
import Xarrow from "react-xarrows";

const Code = ({ code, lineNum, boxes, branches }) => {
  const lines = code.split("\n");

  return (
    <div className="card orange lighten-4 text-white" style={{ position: 'relative' }}>
      <div className="row valign-wrapper" style={{ position: 'relative' }}>
        <div className="col" style={{ padding: "10px" }}>
          {lines.map((line, index) => (
            <Line
              id={`line${index + 1}`}
              key={index}
              line={line}
              index={index}
              selected={index + 1 === lineNum}
              boxes={boxes}
            />
          ))}
        </div>
        <div
          className="col s1 valign-wrapper"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <i className="material-icons">arrow_upward</i>
          <i className="material-icons">arrow_downward</i>
        </div>
      </div>
      <Arrows branches={branches} lineNum={lineNum}/>
    </div>
  );
};

export default Code;