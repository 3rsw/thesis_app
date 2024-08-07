import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import qnService from '../services/qn';
import { Link } from 'react-router-dom';

const QuestionTable = ({ questions, setQuestions }) => {

    const [sortOrder, setSortOrder] = useState(true);

    const sortByDifficulty = () => {
        const sortedQuestions = [...questions].sort((a, b) => sortOrder ? a.difficulty - b.difficulty : b.difficulty - a.difficulty);
        setQuestions(sortedQuestions);
        setSortOrder(!sortOrder);
    };

    const sortByName = () => {
        const sortedQuestions = [...questions].sort((a, b) => sortOrder ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
        setQuestions(sortedQuestions);
        setSortOrder(!sortOrder);
    };

    return (
        <div style={{ overflow: 'auto', maxHeight: '80vh' }}>
        <table className="centered eighty-width" style={{ backgroundColor: 'white', display: 'block' }}>
            <thead style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                <tr>
                    <th>
                        Name
                        <button onClick={sortByName}><i className="material-icons">swap_vert</i></button>
                    </th>
                    <th></th>
                    <th></th>
                    <th>
                        Difficulty
                        <button onClick={sortByDifficulty}><i className="material-icons">swap_vert</i></button>
                    </th>
                    <th>Topic</th>
                </tr>
            </thead>
            <tbody style={{ display: 'block', overflow: 'auto', maxHeight: '500px', width: '100%', tableLayout: 'fixed' }}>
                {questions.map((question, index) => (
                    <tr key={index} style={{ display: 'table', width: '100%', tableLayout: 'fixed' }}>
                        <td>{question.name}</td>
                        <td><Link to={`/question/${question._id}/walkthrough`} className={"link"}>walkthrough</Link></td>
                        <td><Link to={`/question/${question._id}/quiz`} className={"link"}>quiz</Link></td>
                        <td> {"*".repeat(question.difficulty)}</td>
                        <td>{question.tags.map((tag, index) => (
                            <span key={index}>
                                <Link to={`/topic/${tag}`} className={"link"}>{tag}</Link>
                                {index < question.tags.length - 1 ? ", " : ""}
                            </span>
                        ))}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        </div>
    );
};

export default QuestionTable;