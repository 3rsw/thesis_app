

const Stdout = ( {stdout} ) => {
    // A black box with a $ before the value of stdout
    return (
        <div className="card black">
            <span className="white-text">$ {stdout}</span>
        </div>
    )
}

export default Stdout;