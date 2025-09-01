import {useNavigate} from "react-router-dom";
import "./ContentPageExample.css"
import React from "react";
import NavigationBar from "../../components/NavigationBar";

//TODO: move NavigationBar into App.tsx etc.
export const ContentPageExample = () => {
    const navigate = useNavigate()
    return (
        <div className={"nav-bar"}>
            <NavigationBar/>
        <div className={"app-container"}>
            <div className={"upper-section"}>
                <div className={"input-container"}>
                    input container
                </div>
                <div className={"chart-container"}>
                    item here
                </div>
                <div className={"finance-container"}>
                    item here
                </div>

            </div>
            <div className={"lower-section"}>
                <div className={"table-container"}>
                    <div className={"item"}>
                        item
                    </div>
                    <div className={"item"}>
                        item
                    </div>
                    <div className={"item"}>
                        item
                    </div>

                </div>
                <div className={"table-container"}>
                    table 2
                </div>
                <div className={"table-container"}>
                    table 3
                </div>
            </div>

        </div>
        </div>
    )
}

export default ContentPageExample
