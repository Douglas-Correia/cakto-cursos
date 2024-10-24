import { FiLoader } from "react-icons/fi";

export function LoaderSpin() {
    return <FiLoader
        style={{
            animation: 'spin 1s linear infinite',
        }}
    />
}