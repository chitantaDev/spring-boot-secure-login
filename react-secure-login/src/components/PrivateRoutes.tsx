import React from "react";
import {Route, Routes} from "react-router-dom";

interface PrivateRoutesProps {
    routes: {
        path: string;
        element: React.ReactElement;
    }[];
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({routes}) => {

    return (
        <Routes>
            {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element}/>
            ))}
        </Routes>
    );
}

export default PrivateRoutes;