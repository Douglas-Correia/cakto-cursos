import App from "@/App";
import moment from "moment";
import "moment/dist/locale/pt-br";
import ReactDOM from "react-dom/client";
import 'react-toastify/dist/ReactToastify.css';
import 'react-toastify/dist/ReactToastify.min.css';
import './style.css';

moment.locale("pt-br");

const originalWarn = console.error;
console.error = (...args) => {
  if (/validateDOMNesting/.test(args[0])) {
    return;
  }
  if (/UNSAFE_componentWillMount/.test(args[0])) {
    return;
  }
  originalWarn.call(console, ...args);
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <>
    <App />
  </>
);
