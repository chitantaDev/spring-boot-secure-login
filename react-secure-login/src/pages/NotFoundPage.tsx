import React from "react";
import {Link} from "react-router-dom";

export const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-xl mb-4">Page not found</p>
            <Link
                to="/"
                className="text-blue-500 hover:text-blue-700"
            >
                Return to home
            </Link>
        </div>
    );
};