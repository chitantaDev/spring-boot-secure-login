import React, { Dispatch, SetStateAction } from "react";

/**
 * Enforces a generic type to accept key-value pairs where both the key and value are strings.
 * This is specifically designed to handle ChangeEvent<HTMLInputElement> and ensure the correct
 * input field value is dynamically set based on the input's name attribute.
 */

export const useHandleTextInput = <T extends Record<string, string>>() => {
    const handleTextInputChange = (
        event: React.ChangeEvent<HTMLInputElement>,
        setState: Dispatch<SetStateAction<T>>
    ) => {
        /**
         * notes for myself cuz this was tricky
         * name is the deconstructed part that belongs to event.target.
         * it identifies the index signature of THIS html input elemnt
         * value is the deconstructed part that keeps track of the curser
         * and what has been typed (find docs in HTMLInputElement(react, dom)
         */

        const { name, value } = event.target;

        setState((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return {
        handleTextInputChange
    };
};
