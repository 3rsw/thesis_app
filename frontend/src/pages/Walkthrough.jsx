import { useState, useEffect } from "react";
import Code from "../components/Code";
import Footer from "../components/Footer";
import QuestionBanner from "../components/QuestionBanner";
import Stdout from "../components/Stdout";
import Histories from "../components/Histories";
import qnService from "../services/qn";
import NavBar from "../components/NavBar";
import { useParams } from "react-router-dom";

const Walkthrough = () => {

  console.log('Rendering App...');

  const [qn, setQn] = useState({name: "Question",
                                difficulty: "Difficulty",
                                tags: ["Tag1", "Tag2"],
                                code: "\nCode\nGoes\nHere",
                                numberOfSteps: 1
  });

  const [currStepNum, setCurrStepNum] = useState(0);

  const [dataHistory, setDataHistory] = useState([]);

  const { qnId } = useParams();

  const [lineNum, setLineNum] = useState(1);

  const [branches, setBranches] = useState(null);

  const [stdout, setStdout] = useState("");

  // Stack of the stackFrames of the returned functions
  // so that the back buttons work if there are functions involved
  const [returnedFunctions, setReturnedFunctions] = useState([]);

  useEffect(() => {
    // Fetch data and update state
    qnService.getQn(qnId).then(qn => {
      setQn(qn)
  });
  }, []);

const fetchNextStep = async () => {
  if (qn.numberOfSteps - 1 <= currStepNum) {
    return;
  }

  // Get next step (for flow etc)
  qnService.getStep(qnId, currStepNum + 1).then(stepData => {
    setLineNum(stepData.line);
    if ('branch' in stepData) {
      setBranches(stepData.branch);
    }
    else {
      setBranches(null);
    }
  });

  // If it's not the last step, get step after that (for HistoryTable)
  if (qn.numberOfSteps >= currStepNum +2) {
    qnService.getStep(qnId, currStepNum + 2).then(stepData => {
      setStdout(stepData.stdout);
      let tempDataHistory = [ ...dataHistory ];
      //Check stack frame matches
      let topStackFramePremature = false;
      if (stepData.stack_to_render.length < dataHistory.length) { // We have returned from a function
        console.log("returnedFunctions", returnedFunctions);
        setReturnedFunctions([...returnedFunctions??[], tempDataHistory.pop()]);
      } else if (stepData.stack_to_render.length > dataHistory.length) { // We have entered a new function
        tempDataHistory.push({func_name: stepData.stack_to_render[stepData.stack_to_render.length - 1].func_name, vars: {}})
        // We actually want to skp the variable changing in the new top stack frame because we don't want it to show up yet.
        if (stepData.stack_to_render.length != 1) { // Don't do for main
          topStackFramePremature = true;
        }
      }
      // Go through each stack frame and check if the variables have changed
      // Need to go through all stack frames because pointers
      stepData.stack_to_render.map((stackFrame, index) => {
        console.log(index);
        if (!topStackFramePremature || index != stepData.stack_to_render.length - 1) {
          const decLines = stepData.vars.find(func => func.function === stackFrame.func_name).decs ?? {};
          const params = stepData.vars.find(func => func.function === stackFrame.func_name).params ?? [];
          for (let localVar in stackFrame.encoded_locals) {
            let stackFrameVars = tempDataHistory[index].vars;
            if (decLines[localVar] < stepData.line || params.includes(localVar) || localVar in stackFrameVars) { // Account for the variables in other functions that may be declared lower down
              if (localVar in stackFrameVars) { // Check if the variable is already in dataHistory
                if (stackFrameVars[localVar].length > 0) {
                  let varLastEntry = stackFrameVars[localVar][stackFrameVars[localVar].length - 1].value;
                  if (stackFrame.encoded_locals[localVar][0] == "C_ARRAY") {
                    let arr = [];
                    stackFrame.encoded_locals[localVar].forEach((item, index) => {
                      if (index >= 3) {
                        arr.push(item[3]);
                      }
                    });
                    // Check if arr is the same as the previous entry
                    if ((arr.length === varLastEntry.length && arr.every((value, index) => value === varLastEntry[index]) != true)) {
                      stackFrameVars[localVar].push({ step: currStepNum + 1, value: arr });
                    }

                  } else {
                    if (varLastEntry !== stackFrame.encoded_locals[localVar][3]) { // if the entry isn't the same as the last variable, add a new entry to that variable
                      stackFrameVars[localVar].push({ step: currStepNum + 1, value: stackFrame.encoded_locals[localVar][3] });
                    }
                  }
                }
              } else { // If it isn't, add a new entry to dataHistory
                if (stackFrame.encoded_locals[localVar][0] == "C_ARRAY") {
                  let arr = [];
                  stackFrame.encoded_locals[localVar].forEach((item, index) => {
                    if (index >= 3) {
                      arr.push(item[3]);
                    }
                  });
                  stackFrameVars[localVar] = [{ step: currStepNum + 1, value: arr }];
                } else {
                  stackFrameVars[localVar] = [{ step: currStepNum + 1, value: stackFrame.encoded_locals[localVar][3] }];
                }
              }
            }
          }
        }
      });
      setDataHistory(tempDataHistory);
    });
  }
  setCurrStepNum(currStepNum + 1);
};

  const fetchPrevStep = async () => {
    let tempDataHistory = [ ...dataHistory ];

    if (currStepNum != 0) {
      // Get previous step (for flow etc)
      qnService.getStep(qnId, currStepNum - 1).then(stepData => {
        //Check stack frame matches
        if (stepData.stack_to_render.length < dataHistory.length) { // We had entered a function in the previous step
          tempDataHistory.pop();
        } else if (stepData.stack_to_render.length > dataHistory.length) { // We had returned from a function in the previous step
          //tempDataHistory.push({ func_name: stepData.stack_to_render[stepData.stack_to_render.length - 1].func_name, vars: {} })
          tempDataHistory.push(returnedFunctions[returnedFunctions.length - 1]);
          setReturnedFunctions(...returnedFunctions.slice(0, -1));
        }
        setLineNum(stepData.line);
        setStdout(stepData.stdout);
        if ('branch' in stepData) {
          setBranches(stepData.branch);
        }
        else {
          setBranches(null);
        }
      });

      //Get current? step (for stdout)
      qnService.getStep(qnId, currStepNum).then(stepData => {
        setStdout(stepData.stdout);
      });

      // Remove any variables that were added in the "current" step
      // Need to go through all stack frames because pointers
      for (let currStackFrame of tempDataHistory) {
        for (let localVar in currStackFrame.vars) {
          let stackFrameVars = currStackFrame.vars;
            if (stackFrameVars[localVar][stackFrameVars[localVar].length - 1].step >= currStepNum) {
              stackFrameVars[localVar].pop();
            }
            if (stackFrameVars[localVar].length === 0) {
              delete stackFrameVars[localVar];
            }
        }
      }

      console.log("step:", currStepNum - 1)
      setDataHistory(tempDataHistory);
      setCurrStepNum(currStepNum - 1);
    }
  };

const boxes = [
                {color: "green", startCol: 13, endcol: 27},
                {color: "red", startCol: 32, endcol: 46},
                {color: "red", startCol: 13, endcol: 47}
              ]
  return (
    <div className="main-content">
      <NavBar/>
      <div className="container">
        <QuestionBanner questionName={qn.name} difficulty={qn.difficulty} tags={qn.tags} mode={"walkthrough"} qnId={qnId}/>
        <div className="row">
          <div className="col s6">
            <Code code={qn.code} lineNum={lineNum} branches={branches} boxes={boxes} fetchNextStep={fetchNextStep} fetchPrevStep={fetchPrevStep} allVarsHaveAttempt={true} canFetchNext={qn.numberOfSteps - 1 > currStepNum} canFetchPrev={currStepNum != 0}/>
          </div>
          <div className="col s6">
            <Histories histories={dataHistory} stepNum={currStepNum} mode={"walkthrough"}/>
          </div>
        </div>
        <div className="row">
          <Stdout stdout={stdout}/>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Walkthrough;
